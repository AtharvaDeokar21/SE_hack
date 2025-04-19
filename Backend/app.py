from flask import Flask, jsonify
from threading import Thread
import sys
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from flask_cors import CORS

# Ensure Models folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from Models.loitering_detector.detect_and_track import run_loitering_detection, alert_data
from Models.Smart_Communal_Area_Surveillance.surveillance import main  # Import only main
from Models.gender.roboflow_detect import run_gender_alert_detection  # ✅ Add import
from Models.security_staff_vigilance.drowsiness_yawn import run_drowsiness_detection

app = Flask(__name__)
CORS(app)

# Global dictionary for all alerts
alert_data = {}

# Video folders
VIDEO_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), 'location', 'lake'))
VIDEO_FOLDER1 = os.path.abspath(os.path.join(os.path.dirname(__file__), 'location', 'quadrangle'))
VIDEO_FOLDER2 = os.path.abspath(os.path.join(os.path.dirname(__file__), 'location', 'entrance'))
VIDEO_FOLDER3 = os.path.abspath(os.path.join(os.path.dirname(__file__), 'location', 'cabin'))
# ✅ New folder

detection_running = False

# Loitering Handler
class VideoUploadHandler(FileSystemEventHandler):
    def on_created(self, event):
        global detection_running, alert_data
        if event.is_directory or not event.src_path.endswith(('.mp4', '.avi')):
            return
        if not detection_running:
            detection_running = True
            print(f"[INFO] Detected new video: {event.src_path}")
            thread = Thread(target=run_loitering_detection, args=(event.src_path, alert_data))
            thread.start()

# Surveillance Handler
class SurveillanceVideoUploadHandler(FileSystemEventHandler):
    def on_created(self, event):
        global detection_running, alert_data
        if event.is_directory or not event.src_path.endswith(('.mp4', '.avi')):
            return
        if not detection_running:
            detection_running = True
            print(f"[INFO] Detected new video (surveillance): {event.src_path}")
            thread = Thread(target=main, args=(event.src_path, alert_data))
            thread.start()
            thread.join()
            detection_running = False

# ✅ Gender Detection Handler
class GenderVideoUploadHandler(FileSystemEventHandler):
    def on_created(self, event):
        global detection_running, alert_data
        if event.is_directory or not event.src_path.endswith(('.mp4', '.avi')):
            return
        if not detection_running:
            detection_running = True
            print(f"[INFO] Detected new video (gender detection): {event.src_path}")
            thread = Thread(target=run_gender_alert_detection, args=(event.src_path, alert_data))
            thread.start()
            thread.join()
            detection_running = False

class SleepVideoUploadHandler(FileSystemEventHandler):
    def on_created(self, event):
        global detection_running, alert_data
        if event.is_directory or not event.src_path.endswith(('.mp4', '.avi')):
            return
        if not detection_running:
            detection_running = True
            print(f"[INFO] Detected new video (Sleep detection): {event.src_path}")
            thread = Thread(target=run_drowsiness_detection, args=(event.src_path, alert_data))
            thread.start()
            thread.join()
            detection_running = False

# Start observers
observer = Observer()
observer1 = Observer()
observer2 = Observer()  # ✅ New observer
observer3 = Observer()

# Ensure folders exist
for folder in [VIDEO_FOLDER, VIDEO_FOLDER1, VIDEO_FOLDER2]:
    os.makedirs(folder, exist_ok=True)

# Schedule folder watchers
observer.schedule(VideoUploadHandler(), path=VIDEO_FOLDER, recursive=False)
observer1.schedule(SurveillanceVideoUploadHandler(), path=VIDEO_FOLDER1, recursive=False)
observer2.schedule(GenderVideoUploadHandler(), path=VIDEO_FOLDER2, recursive=False)  # ✅
observer3.schedule(SleepVideoUploadHandler(), path=VIDEO_FOLDER3, recursive=False)

observer.start()
observer1.start()
observer2.start()
observer3.start()

@app.route('/get_alerts', methods=['GET'])
def get_alerts():
    global alert_data
    data = alert_data.copy()
    alert_data.clear()
    return jsonify(data)

if __name__ == '__main__':
    try:
        app.run(debug=True)
    finally:
        observer.stop()
        observer.join()
        observer1.stop()
        observer1.join()
        observer2.stop()
        observer2.join()
        observer3.stop()
        observer3.join()
