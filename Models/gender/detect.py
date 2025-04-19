import cv2
from ultralytics import YOLO

# Load YOLOv8 model (only for person detection)
model = YOLO('yolov8n.pt')  # Or yolov8s.pt

# Load Gender Classifier
gender_net = cv2.dnn.readNetFromCaffe("deploy_gender.prototxt", "gender_net.caffemodel")
GENDER_LIST = ['Male', 'Female']

# Open Video Stream
cap = cv2.VideoCapture(0)  # Or video path

while True:
    ret, frame = cap.read()
    if not ret:
        break

    results = model(frame)[0]
    
    for box in results.boxes:
        cls = int(box.cls[0])
        if cls != 0:  # Only person
            continue
        
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        crop = frame[y1:y2, x1:x2]

        if crop.size == 0:
            continue

        try:
            blob = cv2.dnn.blobFromImage(crop, 1.0, (227, 227), (78.4263, 87.7689, 114.8958), swapRB=False)
            gender_net.setInput(blob)
            preds = gender_net.forward()
            gender = GENDER_LIST[preds[0].argmax()]
        except:
            gender = "Unknown"

        color = (255, 0, 0) if gender == "Male" else (0, 0, 255)
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        cv2.putText(frame, f"{gender}", (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        # ALERT: Female Detected
        if gender == "Female":
            print("🚨 ALERT: Female detected in Boys Hostel!")
            cv2.putText(frame, "ALERT: Female detected", (50, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 3)

    cv2.imshow("Gender Monitor", frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
