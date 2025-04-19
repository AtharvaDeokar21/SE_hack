import cv2
import json

zones = {}
current_points = []
current_zone_name = ""
img = None
frame_width, frame_height = None, None

def click_event(event, x, y, flags, param):
    global current_points, img

    if event == cv2.EVENT_LBUTTONDOWN:
        print(f"Point: ({x}, {y})")
        current_points.append((x, y))
        cv2.circle(img, (x, y), 5, (0, 255, 0), -1)
        if len(current_points) > 1:
            cv2.line(img, current_points[-2], current_points[-1], (255, 0, 0), 2)

        cv2.imshow("Draw Zone", img)

# Load image from video
cap = cv2.VideoCapture("demo2.mp4")
ret, frame = cap.read()
cap.release()

if not ret:
    raise Exception("Couldn't read frame from video.")

frame_height, frame_width = frame.shape[:2]
cv2.imwrite("zone_background.jpg", frame)

img_original = frame.copy()

print(f"Loaded background of size: {frame_width}x{frame_height}")

while True:
    current_points = []
    current_zone_name = input("Enter zone name (or 'done' to finish): ")

    if current_zone_name.lower() == "done":
        break

    print("Click to define zone polygon. Press 'q' when done with this zone.")

    img = img_original.copy()
    cv2.imshow("Draw Zone", img)
    cv2.setMouseCallback("Draw Zone", click_event)

    while True:
        key = cv2.waitKey(1) & 0xFF
        if key == ord("q"):
            break

    # Normalize points to 0–1 scale
    norm_points = [(round(x / frame_width, 4), round(y / frame_height, 4)) for x, y in current_points]
    zones[current_zone_name] = norm_points

cv2.destroyAllWindows()

# Save to zone_config.json with frame size metadata
zone_config = {
    "frame_width": frame_width,
    "frame_height": frame_height,
    "zones": zones
}

with open("zone_config.json", "w") as f:
    json.dump(zone_config, f, indent=2)

print("✅ zone_config.json created with all zones and actual frame size!")
