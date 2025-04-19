import cv2
import time
import json
import numpy as np
from ultralytics import YOLO
from deep_sort_realtime.deepsort_tracker import DeepSort
import datetime
from Backend.whatsapp_alerts import send_whatsapp_alert
# Global alert data (optional if you use your own dictionary)
alert_data = {}

# Constants
LOITERING_THRESHOLD = 5  # seconds
ALERT_DURATION = 60      # seconds

def is_inside_zone(x, y, zone_polygon):
    return cv2.pointPolygonTest(zone_polygon.astype(np.int32), (x, y), False) >= 0

def run_loitering_detection(video_path, alert_output_dict):
    # model = YOLO("C:\\Atharva\\SE_hack\\Models\\loitering_detector\\yolov8n.pt")
    model = YOLO("D:\\Hackathons\\SE_hack\\Models\\loitering_detector\\yolov8n.pt")
    tracker = DeepSort()
    
    cap = cv2.VideoCapture(video_path)
    ret, frame = cap.read()
    if not ret:
        print("Error: Unable to read video.")
        return
    
    frame_height, frame_width = frame.shape[:2]

    # Load zones
    with open("D:\\Hackathons\\SE_hack\\Models\\loitering_detector\\zone_config.json") as f:
    # with open("C:\\Atharva\\SE_hack\\Models\\loitering_detector\\zone_config.json") as f:
        config = json.load(f)
        zones = {
            zone_name: np.array([[int(x * frame_width), int(y * frame_height)] for x, y in points])
            for zone_name, points in config["zones"].items()
        }

    time_in_zone = {}
    active_alerts = {}
    send_whatsapp_alert("Alert! Loitering detected near Lake." )
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        now = time.time()
        results = model(frame, classes=[0])[0]  # person
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

                        if track_id not in alert_output_dict:
                            alert_output_dict[track_id] = []

                        description = f"Loitering detected in {zone_name}"
                        timestamp = datetime.datetime.fromtimestamp(now).isoformat()

                        # Check if a similar alert already exists
                        existing_alert = next(
                            (alert for alert in alert_output_dict[track_id] if alert["description"] == description),
                            None
                        )

                        if existing_alert:
                            existing_alert["timestamp"] = timestamp  # Update the timestamp
                        else:
                            alert_output_dict[track_id].append({
                                "id": track_id,
                                "title": "Loitering",
                                "description": description,
                                "location": "Lake",
                                "timestamp": timestamp
                            })

                else:
                    time_in_zone[track_id].pop(zone_name, None)

            # Optional drawing
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 200, 0), 2)
            cv2.putText(frame, f"ID:{track_id}", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        # # Remove expired alerts
        # expired_alerts = []
        # for track_id, zones_alerted in active_alerts.items():
        #     for zone_name, last_seen in zones_alerted.items():
        #         if now - last_seen > ALERT_DURATION:
        #             expired_alerts.append((track_id, zone_name))

        # for tid, zname in expired_alerts:
        #     if tid in active_alerts and zname in active_alerts[tid]:
        #         del active_alerts[tid][zname]
        #     if tid in active_alerts and not active_alerts[tid]:
        #         del active_alerts[tid]
        #     if tid in alert_output_dict:
        #         del alert_output_dict[tid]

        # Optional zone drawing
        for zone_name, polygon in zones.items():
            cv2.polylines(frame, [polygon], isClosed=True, color=(0, 255, 255), thickness=2)
            zone_center = np.mean(polygon, axis=0).astype(int)
            cv2.putText(frame, zone_name, tuple(zone_center), cv2.FONT_HERSHEY_SIMPLEX,
                        0.6, (0, 255, 255), 2)

        # Comment out if running on server
        cv2.imshow("Loitering Detector", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
