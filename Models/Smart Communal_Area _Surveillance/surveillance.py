import cv2
import numpy as np
import supervision as sv
from ultralytics import YOLO
from datetime import datetime
import os
import sys
from dotenv import load_dotenv
from collections import deque
import time

# Try importing inference-sdk, fall back to YOLOv8 if not available
try:
    from inference import get_roboflow_model
    INFERENCE_AVAILABLE = True
except ImportError:
    print("Warning: 'inference-sdk' not installed. Falling back to YOLOv8 model. Install with: pip install inference-sdk")
    INFERENCE_AVAILABLE = False

# Load environment variables from .env file
load_dotenv()

# Get Roboflow API key
ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")

# Initialize model
if INFERENCE_AVAILABLE and ROBOFLOW_API_KEY:
    try:
        # Load Roboflow model (replace with your model_id, e.g., "kitchen-surveillance/1")
        model = get_roboflow_model(model_id="your-model-name/1", api_key=ROBOFLOW_API_KEY)
        print("Using Roboflow model with API key.")
    except Exception as e:
        print(f"Failed to load Roboflow model: {e}. Falling back to YOLOv8.")
        model = YOLO('yolov8s.pt')  # Use smaller model for faster inference
else:
    if not INFERENCE_AVAILABLE:
        print("Roboflow model not used due to missing inference-sdk.")
    elif not ROBOFLOW_API_KEY:
        print("ROBOFLOW_API_KEY not found in .env file.")
    print("Using YOLOv8 model.")
    model = YOLO('yolov8s.pt')  # Use smaller model for faster inference

# YOLOv8 COCO class names (for yolov8s.pt)
COCO_CLASSES = [
    'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
    'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
    'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack',
    'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
    'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
    'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
    'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake',
    'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop',
    'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
    'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier',
    'toothbrush'
]

# Initialize annotators
box_annotator = sv.BoxAnnotator()
label_annotator = sv.LabelAnnotator()
heat_map_annotator = sv.HeatMapAnnotator()

# Crowding thresholds
OVERLAP_THRESHOLD_CROWDED = 0.5  # IoU > 50% for crowded
OVERLAP_THRESHOLD_MODERATE = 0.2  # IoU > 20% for moderately crowded
PERSON_COUNT_THRESHOLD = 10  # Max people before considering crowded
RESTRICTED_ZONE = sv.PolygonZone(polygon=np.array([[0, 0], [300, 0], [300, 300], [0, 300]]))  # Example restricted area

# Plateau and linear detection parameters
PLATEAU_WINDOW = 30  # Seconds to check for plateau
PLATEAU_TOLERANCE = 1  # Allow ±1 variation in count
LINEAR_WINDOW = 30  # Seconds to check for linear increase
LINEAR_SLOPE_THRESHOLD = 0.1  # Min slope (objects/second) for linear increase
HISTORY_SIZE = 300  # Max frames to store (~10s at 30fps)

# Log file setup
LOG_FILE = "surveillance_log.txt"

# History for plateau and linear detection
count_history = deque(maxlen=HISTORY_SIZE)  # (timestamp, person_count, object_count)

def log_event(timestamp, message):
    """Log events with timestamps to a file."""
    with open(LOG_FILE, "a") as f:
        f.write(f"[{timestamp}] {message}\n")

def draw_alert_box(frame, text, position=(10, 100), bg_color=(0, 0, 255), text_color=(255, 255, 255)):
    """Draw a pop-up style alert box with text on the frame."""
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.8
    thickness = 2
    
    # Get text size
    (text_width, text_height), _ = cv2.getTextSize(text, font, font_scale, thickness)
    
    # Draw background rectangle
    padding = 10
    bg_top_left = (position[0], position[1] - text_height - padding)
    bg_bottom_right = (position[0] + text_width + padding * 2, position[1] + padding)
    cv2.rectangle(frame, bg_top_left, bg_bottom_right, bg_color, -1)
    
    # Draw text
    cv2.putText(frame, text, position, font, font_scale, text_color, thickness)

def calculate_iou(box1, box2):
    """Calculate IoU for two axis-aligned bounding boxes [x1, y1, x2, y2]."""
    x1_1, y1_1, x2_1, y2_1 = box1
    x1_2, y1_2, x2_2, y2_2 = box2
    
    # Calculate intersection coordinates
    x1_i = max(x1_1, x1_2)
    y1_i = max(y1_1, y1_2)
    x2_i = min(x2_1, x2_2)
    y2_i = min(y2_1, y2_2)
    
    # Calculate intersection area
    if x2_i > x1_i and y2_i > y1_i:
        intersection = (x2_i - x1_i) * (y2_i - y1_i)
    else:
        intersection = 0.0
    
    # Calculate union area
    area1 = (x2_1 - x1_1) * (y2_1 - y1_1)
    area2 = (x2_2 - x1_2) * (y2_2 - y1_2)
    union = area1 + area2 - intersection
    
    # Calculate IoU
    return intersection / union if union > 0 else 0.0

def calculate_crowding_level(detections, frame, timestamp):
    """Calculate crowding level based on IoU and person count, return alerts."""
    person_detections = detections[detections.class_id == 0]  # Class 0 = person
    num_people = len(person_detections)
    alerts = []
    
    # Calculate IoU for overlapping bounding boxes
    if num_people > 1:
        boxes = person_detections.xyxy  # [x1, y1, x2, y2]
        ious = []
        for i in range(len(boxes)):
            for j in range(i + 1, len(boxes)):
                iou = calculate_iou(boxes[i], boxes[j])
                ious.append(iou)
        
        avg_iou = np.mean(ious) if ious else 0.0
    else:
        avg_iou = 0.0
    
    # Determine crowding level
    if avg_iou > OVERLAP_THRESHOLD_CROWDED or num_people > PERSON_COUNT_THRESHOLD:
        crowding_level = "Crowded"
        alert = "ALERT: Overcrowding detected!"
        alerts.append(alert)
        log_event(timestamp, f"{crowding_level} - {alert} (IoU: {avg_iou:.2f}, People: {num_people})")
    elif avg_iou > OVERLAP_THRESHOLD_MODERATE:
        crowding_level = "Moderately Crowded"
        alert = "ALERT: Moderate crowding detected."
        alerts.append(alert)
        log_event(timestamp, f"{crowding_level} - {alert} (IoU: {avg_iou:.2f}, People: {num_people})")
    else:
        crowding_level = "Normal"
        log_event(timestamp, f"{crowding_level} (IoU: {avg_iou:.2f}, People: {num_people})")
    
    return crowding_level, avg_iou, alerts

def detect_hazards(detections, frame, timestamp):
    """Detect hazards or rule violations, return alerts."""
    violations = []
    alerts = []
    for i in range(len(detections)):
        # Create a single-detection Detections object
        single_detection = sv.Detections(
            xyxy=detections.xyxy[i:i+1],
            confidence=detections.confidence[i:i+1],
            class_id=detections.class_id[i:i+1],
            data={k: v[i:i+1] for k, v in detections.data.items()}
        )
        if RESTRICTED_ZONE.trigger(detections=single_detection):
            class_name = COCO_CLASSES[single_detection.class_id[0]] if single_detection.class_id[0] < len(COCO_CLASSES) else 'Unknown'
            violation = f"Violation: {class_name} in restricted zone"
            alert = f"ALERT: {class_name} detected in restricted zone!"
            violations.append(violation)
            alerts.append(alert)
            log_event(timestamp, violation)
    return violations, alerts

def check_plateau_and_linear(person_count, object_count, timestamp, avg_iou):
    """Check for ReLU-like plateau or linear increase in counts."""
    current_time = time.time()
    count_history.append((current_time, person_count, object_count))
    
    # Filter history within window
    time_window = max(PLATEAU_WINDOW, LINEAR_WINDOW)
    recent_history = [(t, p, o) for t, p, o in count_history if current_time - t <= time_window]
    
    if len(recent_history) < 2:
        return None
    
    # Check for plateau
    person_counts = [p for _, p, _ in recent_history]
    object_counts = [o for _, o, _ in recent_history]
    person_range = max(person_counts) - min(person_counts)
    object_range = max(object_counts) - min(object_counts)
    
    if person_range <= PLATEAU_TOLERANCE and object_range <= PLATEAU_TOLERANCE:
        reason = "Plateau Detected"
        output = f"People: {person_count}, Objects: {object_count}, Reason: {reason}, Timestamp: {timestamp}"
        return output
    
    # Check for linear increase
    times = np.array([t for t, _, _ in recent_history])
    person_trend = np.array(person_counts)
    object_trend = np.array(object_counts)
    
    # Fit linear regression for person and object counts
    if len(times) > 1:
        slope_person, _ = np.polyfit(times - times[0], person_trend, 1)
        slope_object, _ = np.polyfit(times - times[0], object_trend, 1)
        
        if slope_person > LINEAR_SLOPE_THRESHOLD or slope_object > LINEAR_SLOPE_THRESHOLD:
            reason = "ALERT: Linear increase in people/objects detected!"
            output = f"People: {person_count}, Objects: {object_count}, Alert: {reason}, IoU: {avg_iou:.2f}, Timestamp: {timestamp}"
            log_event(timestamp, output)
            print(output)
            sys.exit(0)  # Terminate immediately
    
    return None

def process_frame(frame, frame_count):
    """Process a single video frame."""
    # Get current timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Run inference
    if INFERENCE_AVAILABLE and ROBOFLOW_API_KEY and not isinstance(model, YOLO):
        # Roboflow model inference
        try:
            results = model.infer(frame)
            detections = sv.Detections.from_inference(results)
        except Exception as e:
            print(f"Roboflow inference failed: {e}. Falling back to YOLOv8 for this frame.")
            results = model(frame)[0]
            detections = sv.Detections.from_ultralytics(results)
    else:
        # YOLOv8 inference
        results = model(frame)[0]
        detections = sv.Detections.from_ultralytics(results)
    
    # Filter detections (e.g., confidence > 0.5)
    detections = detections[detections.confidence > 0.5]
    
    # Count people and objects
    person_count = len(detections[detections.class_id == 0])  # Class 0 = person
    object_count = len(detections[detections.class_id != 0])  # All other classes
    
    # Calculate crowding level and get alerts
    crowding_level, avg_iou, crowding_alerts = calculate_crowding_level(detections, frame, timestamp)
    
    # Detect hazards and get alerts
    violations, violation_alerts = detect_hazards(detections, frame, timestamp)
    
    # Check for plateau or linear increase
    tailored_output = check_plateau_and_linear(person_count, object_count, timestamp, avg_iou)
    if tailored_output:
        log_event(timestamp, tailored_output)
        crowding_alerts.append(tailored_output)
    
    # Annotate frame with bounding boxes and labels
    labels = [f"{COCO_CLASSES[class_id] if class_id < len(COCO_CLASSES) else 'Unknown'} ({conf:.2f})" 
              for class_id, conf in zip(detections.class_id, detections.confidence)]
    annotated_frame = box_annotator.annotate(scene=frame.copy(), detections=detections)
    annotated_frame = label_annotator.annotate(scene=annotated_frame, detections=detections, labels=labels)
    
    # Add timestamp
    cv2.putText(annotated_frame, f"Timestamp: {timestamp}", 
                (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    
    # Add crowding level and violations text
    cv2.putText(annotated_frame, f"Crowding: {crowding_level} (IoU: {avg_iou:.2f})", 
                (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    for i, violation in enumerate(violations):
        cv2.putText(annotated_frame, violation, (10, 90 + i * 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
    
    # Add alert pop-ups
    all_alerts = crowding_alerts + violation_alerts
    for i, alert in enumerate(all_alerts):
        draw_alert_box(annotated_frame, alert, position=(10, 150 + i * 60))
    
    # Generate and annotate heatmap
    heatmap_frame = heat_map_annotator.annotate(scene=frame.copy(), detections=detections)
    
    return annotated_frame, heatmap_frame, tailored_output

def get_video_path():
    """Prompt user for video file path and validate it."""
    while True:
        video_path = input("Enter the path to the video file (e.g., C:\\path\\to\\video.mp4): ")
        if os.path.isfile(video_path):
            return video_path
        print(f"Error: File '{video_path}' does not exist. Please try again.")

def main():
    """Process video, display live, and save output."""
    # Get video path from user
    video_path = get_video_path()
    output_path = "output_surveillance.mp4"
    
    # Initialize log file
    if os.path.exists(LOG_FILE):
        os.remove(LOG_FILE)
    
    # Open video
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open video '{video_path}'")
        return
    
    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    video_info = sv.VideoInfo(width=width, height=height, fps=fps)
    
    # Initialize video writer
    with sv.VideoSink(target_path=output_path, video_info=video_info) as sink:
        frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Process frame
            annotated_frame, heatmap_frame, tailored_output = process_frame(frame, frame_count)
            
            # Combine annotated and heatmap frames
            combined_frame = np.hstack((annotated_frame, heatmap_frame))
            
            # Display live
            cv2.imshow('Surveillance', combined_frame)
            
            # Write to output video
            sink.write_frame(frame=combined_frame)
            
            # Break on 'q' key press
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            
            frame_count += 1
        
        # Release resources
        cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    main()