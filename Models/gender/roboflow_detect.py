import cv2
import numpy as np
from inference_sdk import InferenceHTTPClient

# Initialize webcam
cap = cv2.VideoCapture(0)

# Load Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Initialize Roboflow Inference Client
CLIENT = InferenceHTTPClient(
    api_url="https://detect.roboflow.com",
    api_key="7dLWnQPCpvkW0nDutKWO"
)

alert_triggered = False  # To avoid spamming alerts

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    alert_triggered = False  # Reset alert for each frame

    for (x, y, w, h) in faces:
        # Draw rectangle around the face
        cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)

        # Crop and save face image temporarily
        face_img = frame[y:y+h, x:x+w]
        face_img_path = 'demo.png'
        cv2.imwrite(face_img_path, face_img)

        # Run gender detection
        result = CLIENT.infer(face_img_path, model_id="gender-detection-qiyyg/2")

        if 'predictions' in result and result['predictions']:
            prediction = result['predictions'][0]
            gender = prediction['class']
            confidence = prediction['confidence']
            label = f'{gender} ({confidence:.2f})'

            # Add label to frame
            cv2.putText(frame, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)

            # Trigger alert if gender is female
            if gender.lower() == "female" and not alert_triggered:
                cv2.putText(frame, "ALERT: Female Detected!", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 3)
                print("🚨 ALERT: Female Detected!")
                alert_triggered = True  # Avoid multiple alerts for the same frame

    # Display the frame
    cv2.imshow('Real-time Gender Detection', frame)

    # Break loop on 'q' press
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
