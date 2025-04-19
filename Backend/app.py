from flask import Flask, jsonify
from threading import Thread
import sys
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Ensure Models folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from Models.loitering_detector.detect_and_track import run_loitering_detection, alert_data

app = Flask(__name__)

# Use absolute path for the folder to watch
VIDEO_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), 'location', 'lake'))

detection_running = False

class VideoUploadHandler(FileSystemEventHandler):
    def on_created(self, event):
        global detection_running
        if event.is_directory or not event.src_path.endswith(('.mp4', '.avi')):
            return
        if not detection_running:
            detection_running = True
            print(f"[INFO] Detected new video: {event.src_path}")
            thread = Thread(target=run_loitering_detection, args=(event.src_path, alert_data))
            thread.start()

# Start observer
observer = Observer()

# Ensure folder exists or create it
if not os.path.exists(VIDEO_FOLDER):
    os.makedirs(VIDEO_FOLDER)

observer.schedule(VideoUploadHandler(), path=VIDEO_FOLDER, recursive=False)
observer.start()

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
