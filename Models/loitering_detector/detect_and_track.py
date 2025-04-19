import cv2
import time
import json
import numpy as np
from ultralytics import YOLO
from deep_sort_realtime.deepsort_tracker import DeepSort

# Load YOLOv8 model
model = YOLO("yolov8n.pt")  # You can replace this with your custom model
tracker = DeepSort()

# Open video
cap = cv2.VideoCapture("demo.mp4")
ret, frame = cap.read()
if not ret:
    print("Error: Unable to read video.")
    exit()

frame_height, frame_width = frame.shape[:2]

# Load zone config and convert all zone points to absolute coordinates
with open("zone_config.json") as f:
    config = json.load(f)
    zones = {
        zone_name: np.array([[int(x * frame_width), int(y * frame_height)] for x, y in points])
        for zone_name, points in config["zones"].items()
    }

# Constants
LOITERING_THRESHOLD = 5  # seconds
ALERT_DURATION = 60      # seconds
time_in_zone = {}        # track_id -> {zone_name -> first_seen_time}
active_alerts = {}       # track_id -> {zone_name -> last_seen_time}

def is_inside_zone(x, y, zone_polygon):
    return cv2.pointPolygonTest(zone_polygon.astype(np.int32), (x, y), False) >= 0

while True:
    ret, frame = cap.read()
    if not ret:
        break

    now = time.time()
    results = model(frame, classes=[0])[0]  # class 0 = person
    detections = []

    for r in results.boxes.data.tolist():
        x1, y1, x2, y2, score, _ = r
        detections.append(([x1, y1, x2 - x1, y2 - y1], score, "person"))

    tracks = tracker.update_tracks(detections, frame=frame)

    for track in tracks:
        if not track.is_confirmed():
            continue

        track_id = track.track_id
        x1, y1, x2, y2 = map(int, track.to_ltrb())
        cx, cy = (x1 + x2) // 2, (y1 + y2) // 2

        if track_id not in time_in_zone:
            time_in_zone[track_id] = {}

        for zone_name, zone_polygon in zones.items():
            if is_inside_zone(cx, cy, zone_polygon):
                if zone_name not in time_in_zone[track_id]:
                    time_in_zone[track_id][zone_name] = now
                elif now - time_in_zone[track_id][zone_name] > LOITERING_THRESHOLD:
                    if track_id not in active_alerts:
                        active_alerts[track_id] = {}
                    active_alerts[track_id][zone_name] = now
            else:
                time_in_zone[track_id].pop(zone_name, None)

        # Draw bounding boxes
        cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 200, 0), 2)
        cv2.putText(frame, f"ID:{track_id}", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

    # Show active alerts
    alert_index = 0
    expired_alerts = []
    for track_id, zones_alerted in active_alerts.items():
        for zone_name, last_seen in zones_alerted.items():
            if now - last_seen > ALERT_DURATION:
                expired_alerts.append((track_id, zone_name))
            else:
                cv2.putText(frame, f"Loitering: ID {track_id} in {zone_name}",
                            (30, 40 + alert_index * 30), cv2.FONT_HERSHEY_SIMPLEX,
                            0.7, (0, 0, 255), 2)
                alert_index += 1

    # Remove expired alerts
    for tid, zname in expired_alerts:
        if tid in active_alerts and zname in active_alerts[tid]:
            del active_alerts[tid][zname]
        if tid in active_alerts and not active_alerts[tid]:
            del active_alerts[tid]

    # Draw zone outlines
    for zone_name, polygon in zones.items():
        cv2.polylines(frame, [polygon], isClosed=True, color=(0, 255, 255), thickness=2)
        # Optional: Label the zones on the frame
        zone_center = np.mean(polygon, axis=0).astype(int)
        cv2.putText(frame, zone_name, tuple(zone_center), cv2.FONT_HERSHEY_SIMPLEX,
                    0.6, (0, 255, 255), 2)

    cv2.imshow("Loitering Detector", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
