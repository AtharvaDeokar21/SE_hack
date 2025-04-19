import cv2
import numpy as np
import datetime
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.resnet50 import preprocess_input
from Backend.whatsapp_alerts import send_whatsapp_alert
alert_data = {}
flag = 0
def predict_realtime_fast(video_path, alert_data, prediction_interval=10):
    model = load_model('D:\\Hackathons\\SE_hack\\Models\\violence_model\\violence_detection_resnet50.h5')

    cap = cv2.VideoCapture(video_path)  # ✅ Use video path instead of webcam
    if not cap.isOpened():
        print(f"Error: Unable to open video file at {video_path}")
        return

    print("Starting video file prediction.")
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break  # Video has ended

        frame_disp = frame.copy()
        frame_count += 1

        if frame_count % prediction_interval == 0:
            resized = cv2.resize(frame, (224, 224))
            input_frame = preprocess_input(resized.astype(np.float32))
            input_frame = np.expand_dims(input_frame, axis=0)

            prediction = model.predict(input_frame, verbose=0)[0][0]
            label = "Violent" if prediction > 0.5 else "Non-Violent"
            confidence = round(float(prediction), 2)

            color = (0, 0, 255) if label == "Violent" else (0, 255, 0)
            cv2.putText(frame_disp, f"{label} ({confidence})", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)

            print(f"[{frame_count}] Prediction: {label} (Confidence: {confidence})")
            
            if label == "Violent" and alert_data is not None:
                now = datetime.datetime.now().isoformat()
                alert_data[500] = [  # Optional: make this ID dynamic if needed
                    {
                        "id": 500,
                        "title": "Violence",
                        "description": "Violent activity detected in Lobby.",
                        "location": "Lobby",
                        "timestamp": now
                    }
                ]
                if(flag == 0):
                    send_whatsapp_alert("Alert! Violent activity detected in Lobby.")
                    flag = 1

        cv2.imshow("Violence Detection", frame_disp)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
