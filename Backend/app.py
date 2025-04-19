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

app = Flask(__name__)
CORS(app)

# Global dictionary for all alerts
alert_data = {}

# Use absolute path for the folder to watch
VIDEO_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), 'location', 'lake'))
VIDEO_FOLDER1 = os.path.abspath(os.path.join(os.path.dirname(__file__), 'location', 'quadrangle'))
detection_running = False

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
            thread.join()  # Wait for thread to finish before allowing new detection
            detection_running = False

# Start observers
observer = Observer()
observer1 = Observer()

# Ensure folder exists or create it
if not os.path.exists(VIDEO_FOLDER):
    os.makedirs(VIDEO_FOLDER)

if not os.path.exists(VIDEO_FOLDER1):
    os.makedirs(VIDEO_FOLDER1)

observer.schedule(VideoUploadHandler(), path=VIDEO_FOLDER, recursive=False)
observer.start()
observer1.schedule(SurveillanceVideoUploadHandler(), path=VIDEO_FOLDER1, recursive=False)
observer1.start()

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