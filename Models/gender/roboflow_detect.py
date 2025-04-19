import cv2
import numpy as np
import time
import datetime
import os
from inference_sdk import InferenceHTTPClient
from Backend.whatsapp_alerts import send_whatsapp_alert

# Constants
THRESHOLD_FRAMES = 3  # Number of continuous frames to trigger alert

def run_gender_alert_detection(video_path, alert_output_dict):
    cap = cv2.VideoCapture(video_path)
    
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    CLIENT = InferenceHTTPClient(
        api_url="https://detect.roboflow.com",
        api_key="7dLWnQPCpvkW0nDutKWO"
    )

    female_detected_count = 0
    alert_triggered = False
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        female_detected_this_frame = False

        for (x, y, w, h) in faces:
            face_img = frame[y:y+h, x:x+w]

            # Skip saving the image to disk
            # face_img_path = f'temp_face_{frame_count}.png'  # Removed saving part
            # cv2.imwrite(face_img_path, face_img)  # Removed this line

            # Continue with inference without saving the image to disk
            result = CLIENT.infer(face_img, model_id="gender-detection-qiyyg/2")

            if 'predictions' in result and result['predictions']:
                prediction = result['predictions'][0]
                gender = prediction['class']
                confidence = prediction['confidence']

                if gender.lower() == 'female':
                    female_detected_this_frame = True
                    break  # only need one confirmed female

        if female_detected_this_frame:
            female_detected_count += 1
        else:
            female_detected_count = 0
            alert_triggered = False

        if female_detected_count >= THRESHOLD_FRAMES and not alert_triggered:
            alert_triggered = True
            timestamp = datetime.datetime.now().isoformat()

            alert_output_dict["99"] = alert_output_dict.get("99", [])
            alert_output_dict["99"].append({
                "id": "99",
                "title": "Female Detected",
                "description": f"Female detected in boys hostel.",
                "location": "Main Entrance",  # You can customize this
                "timestamp": timestamp
            })

            print(f"[ALERT] Female detected continuously. Alert generated at {timestamp}")
            send_whatsapp_alert("Alert! Female detected at Main Entrance in Boys Hostel.")
            break

        # Optional: draw visuals
        cv2.imshow("Gender Detection", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    # cv2.destroyAllWindows()

