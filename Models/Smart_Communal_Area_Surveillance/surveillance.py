import cv2
import numpy as np
import supervision as sv
from ultralytics import YOLO
from datetime import datetime
import os
from dotenv import load_dotenv
from collections import deque
import time
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')



# Initialize model
# if INFERENCE_AVAILABLE and ROBOFLOW_API_KEY:
#     try:
#         model = get_roboflow_model(model_id="your-model-name/1", api_key=ROBOFLOW_API_KEY)
#         logging.info("Using Roboflow model with API key.")
#     except Exception as e:
#         logging.error(f"Failed to load Roboflow model: {e}. Falling back to YOLOv8.")
#         model = YOLO('D:\\Hackathons\\SE_hack\\Models\\Smart_Communal_Area_Surveillance\\yolov8s.pt')
# else:
#     if not INFERENCE_AVAILABLE:
#         logging.info("Roboflow model not used due to missing inference-sdk.")
#     elif not ROBOFLOW_API_KEY:
#         logging.info("ROBOFLOW_API_KEY not found in .env file.")
#     logging.info("Using YOLOv8 model.")
#     model = YOLO('D:\\Hackathons\\SE_hack\\Models\\Smart_Communal_Area_Surveillance\\yolov8s.pt')

# YOLOv8 COCO class names
# COCO_CLASSES = [
#     'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
#     'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
#     'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack',
#     'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
#     'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
#     'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
#     'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake',
#     'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop',
#     'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
#     'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier',
#     'toothbrush'
# ]

# Initialize annotators
# box_annotator = sv.BoxAnnotator()
# label_annotator = sv.LabelAnnotator()
# heat_map_annotator = sv.HeatMapAnnotator()

# Crowding thresholds
# OVERLAP_THRESHOLD_CROWDED = 0.5
# OVERLAP_THRESHOLD_MODERATE = 0.2
# PERSON_COUNT_THRESHOLD = 10

# Alert duration
# ALERT_DURATION = 60

# Plateau detection parameters
# PLATEAU_WINDOW = 30
# PLATEAU_TOLERANCE = 1
# IOU_TOLERANCE = 0.05
# HISTORY_SIZE = 300

# Log file setup
# LOG_FILE = "surveillance_log.txt"

# History for plateau detection
# count_history = deque(maxlen=HISTORY_SIZE)

def log_event(timestamp, message):
    """Log events with timestamps to a file."""
    with open(LOG_FILE, "a") as f:
        f.write(f"[{timestamp}] {message}\n")

def draw_alert_box(frame, text, position=(10, 100), bg_color=(0, 0, 255), text_color=(255, 255, 255)):
    """Draw a pop-up style alert box with text on the frame."""
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.8
    thickness = 2
    
    (text_width, text_height), _ = cv2.getTextSize(text, font, font_scale, thickness)
    
    padding = 10
    bg_top_left = (position[0], position[1] - text_height - padding)
    bg_bottom_right = (position[0] + text_width + padding * 2, position[1] + padding)
    cv2.rectangle(frame, bg_top_left, bg_bottom_right, bg_color, -1)
    
    cv2.putText(frame, text, position, font, font_scale, text_color, thickness)

def calculate_iou(box1, box2):
    """Calculate IoU for two axis-aligned bounding boxes [x1, y1, x2, y2]."""
    x1_1, y1_1, x2_1, y2_1 = box1
    x1_2, y1_2, x2_2, y2_2 = box2
    
    x1_i = max(x1_1, x1_2)
    y1_i = max(y1_1, y1_2)
    x2_i = min(x2_1, x2_2)
    y2_i = min(y2_1, y2_2)
    
    if x2_i > x1_i and y2_i > y1_i:
        intersection = (x2_i - x1_i) * (y2_i - y1_i)
    else:
        intersection = 0.0
    
    area1 = (x2_1 - x1_1) * (y2_1 - y1_1)
    area2 = (x2_2 - x1_2) * (y2_2 - y1_2)
    union = area1 + area2 - intersection
    
    return intersection / union if union > 0 else 0.0

def calculate_crowding_level(detections, frame, timestamp, frame_count, alert_data):
    """Calculate crowding level and detect plateau, store alerts in alert_data."""
    person_detections = detections[detections.class_id == 0]
    num_people = len(person_detections)
    alerts = []
    now = time.time()
    
    if num_people > 1:
        boxes = person_detections.xyxy
        ious = []
        for i in range(len(boxes)):
            for j in range(i + 1, len(boxes)):
                iou = calculate_iou(boxes[i], boxes[j])
                ious.append(iou)
        
        avg_iou = np.mean(ious) if ious else 0.0
    else:
        avg_iou = 0.0
    
    count_history.append((now, num_people, avg_iou))
    
    crowding_id = f"crowding_{frame_count}_{timestamp.replace(' ', '_')}"
    if avg_iou > OVERLAP_THRESHOLD_CROWDED or num_people > PERSON_COUNT_THRESHOLD:
        crowding_level = "Crowded"
        alert = "ALERT: Overcrowding detected!"
        alerts.append(alert)
        log_event(timestamp, f"{crowding_level} - {alert} (IoU: {avg_iou:.2f}, People: {num_people})")
        if crowding_id not in alert_data:
            alert_data[crowding_id] = []
        alert_data[crowding_id].append({
            "id": crowding_id,
            "title": "Overcrowding",
            "description": f"Overcrowding detected with {num_people} people",
            "location": "Quadrangle",
            "timestamp": datetime.fromtimestamp(now).isoformat(),
            "last_seen": now,
        })
    elif avg_iou > OVERLAP_THRESHOLD_MODERATE:
        crowding_level = "Moderately Crowded"
        alert = "ALERT: Moderate crowding detected."
        alerts.append(alert)
        log_event(timestamp, f"{crowding_level} - {alert} (IoU: {avg_iou:.2f}, People: {num_people})")
        if crowding_id not in alert_data:
            alert_data[crowding_id] = []
        alert_data[crowding_id].append({
            "id": crowding_id,
            "title": "Moderate Crowding",
            "description": f"Moderate crowding detected with {num_people} people",
            "location": "Quadrangle",
            "timestamp": datetime.fromtimestamp(now).isoformat(),
            "last_seen": now,
        })
    else:
        crowding_level = "Normal"
        log_event(timestamp, f"{crowding_level} (IoU: {avg_iou:.2f}, People: {num_people})")
    
    return crowding_level, avg_iou, alerts

def remove_expired_alerts(alert_data):
    """Remove alerts that have expired based on ALERT_DURATION."""
    now = time.time()
    expired_ids = []
    for alert_id, alerts in list(alert_data.items()):
        for alert in alerts:
            if now - alert["last_seen"] > ALERT_DURATION:
                expired_ids.append(alert_id)
                break
    for alert_id in expired_ids:
        del alert_data[alert_id]

def process_frame(frame, frame_count, alert_data):
    """Process a single video frame."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    
    results = model(frame)[0]
    detections = sv.Detections.from_ultralytics(results)
    
    detections = detections[detections.confidence > 0.5]
    
    crowding_level, avg_iou, crowding_alerts = calculate_crowding_level(detections, frame, timestamp, frame_count, alert_data)
    
    remove_expired_alerts(alert_data)
    
    labels = [f"{COCO_CLASSES[class_id] if class_id < len(COCO_CLASSES) else 'Unknown'} ({conf:.2f})" 
              for class_id, conf in zip(detections.class_id, detections.confidence)]
    annotated_frame = box_annotator.annotate(scene=frame.copy(), detections=detections)
    annotated_frame = label_annotator.annotate(scene=annotated_frame, detections=detections, labels=labels)
    
    cv2.putText(annotated_frame, f"Timestamp: {timestamp}", 
                (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    
    cv2.putText(annotated_frame, f"Crowding: {crowding_level} (IoU: {avg_iou:.2f})", 
                (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    
    all_alerts = crowding_alerts
    for i, alert in enumerate(all_alerts):
        draw_alert_box(annotated_frame, alert, position=(10, 150 + i * 60))
    
    heatmap_frame = heat_map_annotator.annotate(scene=frame.copy(), detections=detections)
    
    return annotated_frame, heatmap_frame

def main(video_path, alert_data):
    """Process video, display live, and save output."""
    global model 
    model = YOLO('D:\\Hackathons\\SE_hack\\Models\\Smart_Communal_Area_Surveillance\\yolov8s.pt')
    global COCO_CLASSES
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
    global box_annotator
    global label_annotator
    global heat_map_annotator
    box_annotator = sv.BoxAnnotator()
    label_annotator = sv.LabelAnnotator()
    heat_map_annotator = sv.HeatMapAnnotator()
    
    global OVERLAP_THRESHOLD_CROWDED
    global OVERLAP_THRESHOLD_MODERATE
    global PERSON_COUNT_THRESHOLD
    OVERLAP_THRESHOLD_CROWDED = 0.5
    OVERLAP_THRESHOLD_MODERATE = 0.2
    PERSON_COUNT_THRESHOLD = 10
    
    global ALERT_DURATION
    ALERT_DURATION = 60
    
    global PLATEAU_WINDOW
    global PLATEAU_TOLERANCE
    global IOU_TOLERANCE
    global HISTORY_SIZE
    PLATEAU_WINDOW = 30
    PLATEAU_TOLERANCE = 1
    IOU_TOLERANCE = 0.05
    HISTORY_SIZE = 300
    
    global LOG_FILE
    LOG_FILE = "surveillance_log.txt"
    
    global count_history
    count_history = deque(maxlen=HISTORY_SIZE)
    
    logging.debug(f"main called with video_path={video_path}, alert_data={alert_data}")
    
    output_path = "output_surveillance.mp4"
    
    if os.path.exists(LOG_FILE):
        os.remove(LOG_FILE)
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        logging.error(f"Could not open video '{video_path}'")
        return None
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    video_info = sv.VideoInfo(width=width, height=height, fps=fps)
    
    with sv.VideoSink(target_path=output_path, video_info=video_info) as sink:
        frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            annotated_frame, heatmap_frame = process_frame(frame, frame_count, alert_data)
            
            combined_frame = np.hstack((annotated_frame, heatmap_frame))
            
            cv2.imshow('Surveillance', combined_frame)
            
            sink.write_frame(frame=combined_frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            
            frame_count += 1
        
        cap.release()
        cv2.destroyAllWindows()
    
    logging.info(f"Final Alerts: {alert_data}")
