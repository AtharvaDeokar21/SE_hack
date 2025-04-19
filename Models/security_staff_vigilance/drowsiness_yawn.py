import cv2
import dlib
import time
import datetime
import numpy as np
from threading import Thread
from imutils import face_utils
import imutils
import os
from scipy.spatial import distance as dist

def run_drowsiness_detection(video_path, alert_output_dict):
    # Initialize variables
    EYE_AR_THRESH = 0.3
    EYE_AR_CONSEC_FRAMES = 30
    YAWN_THRESH = 20
    alarm_status = False
    alarm_status2 = False
    saying = False
    COUNTER = 0

    def alarm(msg):
        s = f'espeak "{msg}"'
        os.system(s)

    def eye_aspect_ratio(eye):
        A = dist.euclidean(eye[1], eye[5])
        B = dist.euclidean(eye[2], eye[4])
        C = dist.euclidean(eye[0], eye[3])
        ear = (A + B) / (2.0 * C)
        return ear

    def final_ear(shape):
        (lStart, lEnd) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
        (rStart, rEnd) = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]
        leftEye = shape[lStart:lEnd]
        rightEye = shape[rStart:rEnd]
        leftEAR = eye_aspect_ratio(leftEye)
        rightEAR = eye_aspect_ratio(rightEye)
        ear = (leftEAR + rightEAR) / 2.0
        return (ear, leftEye, rightEye)

    def lip_distance(shape):
        top_lip = shape[50:53]
        top_lip = np.concatenate((top_lip, shape[61:64]))
        low_lip = shape[56:59]
        low_lip = np.concatenate((low_lip, shape[65:68]))
        top_mean = np.mean(top_lip, axis=0)
        low_mean = np.mean(low_lip, axis=0)
        distance = abs(top_mean[1] - low_mean[1])
        return distance

    print("-> Loading the predictor and detector...")
    detector = cv2.CascadeClassifier("D:\\Hackathons\\SE_hack\\Models\\security_staff_vigilance\\haarcascade_frontalface_default.xml")
    predictor = dlib.shape_predictor("D:\\Hackathons\\SE_hack\\Models\\security_staff_vigilance\\shape_predictor_68_face_landmarks.dat")

    print("-> Opening Video File...")
    cap = cv2.VideoCapture(video_path)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame = imutils.resize(frame, width=450)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        rects = detector.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30),
                                          flags=cv2.CASCADE_SCALE_IMAGE)

        for (x, y, w, h) in rects:
            rect = dlib.rectangle(int(x), int(y), int(x + w), int(y + h))
            shape = predictor(gray, rect)
            shape = face_utils.shape_to_np(shape)

            ear, leftEye, rightEye = final_ear(shape)
            distance = lip_distance(shape)

            leftEyeHull = cv2.convexHull(leftEye)
            rightEyeHull = cv2.convexHull(rightEye)
            cv2.drawContours(frame, [leftEyeHull], -1, (0, 255, 0), 1)
            cv2.drawContours(frame, [rightEyeHull], -1, (0, 255, 0), 1)
            lip = shape[48:60]
            cv2.drawContours(frame, [lip], -1, (0, 255, 0), 1)

            now = datetime.datetime.now().isoformat()

            # Drowsiness detection
            if ear < EYE_AR_THRESH:
                COUNTER += 1
                if COUNTER >= EYE_AR_CONSEC_FRAMES:
                    if not alarm_status:
                        alarm_status = True
                        t = Thread(target=alarm, args=('wake up sir',))
                        t.daemon = True
                        t.start()
                    cv2.putText(frame, "DROWSINESS ALERT!", (10, 30),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                    alert_output_dict[200] = [{
                        "id": 200,
                        "title": "Drowsiness",
                        "description": "Drowsiness detected",
                        "location": "Cabin",
                        "timestamp": now
                    }]
            else:
                COUNTER = 0
                alarm_status = False

            # Yawn detection
            if distance > YAWN_THRESH:
                cv2.putText(frame, "Yawn Alert", (10, 60),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                if not alarm_status2 and not saying:
                    alarm_status2 = True
                    saying = True
                    t = Thread(target=alarm, args=('take some fresh air sir',))
                    t.daemon = True
                    t.start()
                    alert_output_dict[45] = [{
                        "id": 45,
                        "title": "Yawn",
                        "description": "Yawn detected",
                        "location": "Cabin",
                        "timestamp": now
                    }]
            else:
                alarm_status2 = False
                saying = False

            cv2.putText(frame, f"EAR: {ear:.2f}", (300, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            cv2.putText(frame, f"YAWN: {distance:.2f}", (300, 60),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        cv2.imshow("Frame", frame)
        key = cv2.waitKey(1) & 0xFF
        if key == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()

    # Final cleanup
    alarm_status = False
    alarm_status2 = False
    saying = False
    time.sleep(1)  # Give threads time to finish

