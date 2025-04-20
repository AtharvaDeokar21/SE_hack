# 👁️‍🗨️ **ThirdEye AI – Smart Surveillance for Safer Hostels**

**Revolutionizing hostel security with intelligent, real-time video analytics — no new hardware required.**

---

## 🧠 **Overview**

Hostels, often housing dozens to hundreds of residents, face continuous security challenges—especially during off-hours when manual vigilance dips. Traditional CCTV setups, while omnipresent, burden security personnel with hours of passive footage that’s difficult to monitor in real time.

**ThirdEye AI** transforms this outdated paradigm by injecting intelligence into existing surveillance systems. It harnesses **cutting-edge computer vision, deep learning models, and real-time alerting** mechanisms to enable **proactive, responsive, and context-aware monitoring**—dramatically improving safety while reducing operational overhead.

---

## 🚀 **Key Features**

### 🔴 1. **Real-Time Altercation Detection**

Detects fights and physical altercations by analyzing:

- **Body posture**
- **Motion velocity**
- **Spatial pattern analysis**

**Powered by**:

- ResNet
- CNN

**System Response**:

- Classifies incidents by severity (e.g., mild scuffle vs aggressive fight)
- Triggers instant alerts with contextual footage and timestamp

---

### 🔐 2. **Unauthorized Entry Detection**

Keeps entry points secure by detecting:

- **Late-night access violations**
- **Unknown individuals**

**Tools Used**:  
🔹 YOLO + DeepSort (for person tracking)

**System Response**:

- Flags and isolates footage of unidentified persons
- Sends access logs to hostel admins

---

### 🧍 3. **Behavioral Anomaly Detection**

Monitors subtle behavioral threats such as:

- **Loitering near sensitive zones**
- **Door-checking behavior**

**Implementation**:  
🔹 Custom object tracking models with zone-mapping logic  
🔹 Time-based anomaly scoring (e.g., idle presence beyond threshold)  
🔹 **Night-mode calibration** for accurate low-light detection

---

### 🧑‍✈️ 4. **Security Staff Vigilance Tracker**

Ensures that on-duty personnel maintain proper vigilance:

- Monitors guard **posture** (dosing, yawning)
- Detects absence or inattention via camera zone checks

**Technology**:  
🔹 Haarcascade Frontalface  
🔹 Shape Predictor 68 Face Landmarks

---

### 🧪 5. **Smart Shared Area Monitoring**

Monitors shared areas (lounges, kitchens, stairwells) for:

- **Overcrowding hazards**
- **Misuse of restricted areas**
- **Activity pattern deviations**

**Tools Used**:  
🔹 Fine-tuned YOLOv8 object detection models  
🔹 Heatmap generation for usage patterns  
🔹 Threshold-based trigger alerts for rule violations

---

### 📲 6. **Parallelized Alerting & Response Dashboard**

A real-time dashboard for centralized monitoring and action-taking:

- **Categorizes incidents** by severity, type, and frequency
- **Real-time notifications** with:
  - Timestamps
  - Exact location on Dashboard

🚀 **Parallel Processing Engine**:

- Multiple incident categories and models processed **simultaneously** using multithreading.
- Ensures minimal latency in high-volume camera setups
- Enables **instant triaging** and multi-channel alerting (WhatsApp)

---

### 🛡️ 7. **Privacy & Ethics Layer**

Ensures responsible AI surveillance:

- **Anonymized alerts** where detailed footage isn't required.
- **Role-based access controls** to ensure only authorized personnel can review sensitive footage.

---

## 🧰 **Tech Stack**

| Module                  | Tools & Technologies Used                                      |
| ----------------------- | -------------------------------------------------------------- |
| **Model Training**      | Roboflow, YOLOv8, Custom Datasets                              |
| **Real-Time Inference** | OpenCV, MediaPipe, DeepSort                                    |
| **Backend & Alerting**  | Flask and parallel event streams and Twilio For Alert messages |
| **Frontend Dashboard**  | Next.js                                                        |

---

## 🎯 **Impact**

- ✅ **Boosts proactive surveillance** without increasing manpower
- ✅ **Reduces incident response time** via real-time alerts
- ✅ **Cost-efficient**: Integrates with existing CCTV infrastructure
- ✅ **Scalable & Modular** for various residential or institutional settings

---
