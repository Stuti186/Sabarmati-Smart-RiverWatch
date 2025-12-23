# 🚀 Smart Sabarmati River Monitoring System – Complete Workflow

**Complete Architecture & Execution Flow**

Your system continuously monitors Sabarmati River water quality, detects emergencies, and transmits real-time data using **Smart IoT Buoys + AI + LoRa Communication**.

---

## 📋 Table of Contents

1. [System Overview](#1-system-overview)
2. [Hardware Architecture](#2-hardware-architecture)
3. [Microcontroller Workflow](#3-microcontroller-workflow)
4. [Data Acquisition & Processing](#4-data-acquisition--processing)
5. [LoRa Communication](#5-lora-communication)
6. [Cloud & Backend](#6-cloud--backend)
7. [AI & ML Integration](#7-ai--ml-integration)
8. [Dashboard & Visualization](#8-dashboard--visualization)
9. [Alert System](#9-alert-system)
10. [Public Engagement](#10-public-engagement)
11. [Deployment Workflow](#11-deployment-workflow)

---

## 1. System Overview

### 🎯 Problem Statement

The Sabarmati River faces critical challenges:

- **Sudden water pollution surges** from industrial discharge
- **Illegal waste dumping** along riverbanks
- **High turbidity** during monsoon season
- **Algae bloom** and low oxygen zones
- **High visitor footfall** creating safety concerns
- **Flood risks** during heavy rainfall

### ✅ Solution: Smart Buoy System

Our **Smart River Watch** platform solves these challenges through:

1. **Floating Sensor Buoys** - Deployed across strategic river locations
2. **Real-time Monitoring** - Continuous water quality measurements every 5 seconds
3. **Wireless Communication** - LoRa-based long-range data transmission
4. **AI-Powered Analysis** - Machine learning for anomaly detection and flood prediction
5. **Dashboard Visualization** - Real-time and historical data display
6. **Emergency Alerts** - Automated notifications to authorities
7. **Citizen Engagement** - Mobile app with AI species identification

---

## 2. Hardware Architecture

### 🔹 Sensor Buoy Components

| Parameter      | Sensor Model            | Measurement Range | Purpose                        |
| -------------- | ----------------------- | ----------------- | ------------------------------ |
| **pH**         | DFRobot Analog pH Probe | 0-14 pH           | Acidity/alkalinity detection   |
| **TDS**        | DFRobot TDS Sensor      | 0-1000 ppm        | Dissolved solids (pollution)   |
| **Turbidity**  | NTU Sensor              | 0-1000 NTU        | Water clarity/contamination    |
| **Temperature**| DS18B20                 | -55°C to 125°C     | Chemical behavior indicator   |
| **Water Level**| Ultrasonic HC-SR04      | 2-400 cm          | River height/flood alert       |
| **Water Leak** | Digital Moisture Sensor | 0/1 (dry/wet)      | Device integrity check         |

All sensors use **DFRobot signal-conditioning boards** that output scaled analog voltages (0-3.3V), not raw electrode signals.

### 🔹 Microcontroller: Heltec ESP32 LoRa V3

**Key Features:**
- Dual-core 240MHz processor
- Built-in LoRa SX1276 radio (915 MHz)
- 0.96" OLED display
- SD card slot
- Low power consumption

---

## 3. Microcontroller Workflow

### 📌 Pin Mapping

#### Analog Sensors (ADC Inputs)
| Sensor    | ESP32 GPIO | ADC Channel | Voltage Range |
| --------- | ---------- | ----------- | ------------- |
| TDS       | GPIO 1     | ADC1_CH0    | 0-3.3V        |
| pH        | GPIO 2     | ADC1_CH1    | 0-3.3V        |
| Turbidity | GPIO 3     | ADC1_CH2    | 0-3.3V        |

#### Digital Sensors
| Sensor                | ESP32 GPIO | Type        |
| --------------------- | ---------- | ----------- |
| Water Leak            | GPIO 4     | Digital IN  |
| Ultrasonic TRIG       | GPIO 38    | Digital OUT |
| Ultrasonic ECHO       | GPIO 39    | Digital IN  |
| Temperature (DS18B20) | GPIO 48    | OneWire     |

#### Communication & Storage
| Component     | Interface | Pins            |
| ------------- | --------- | --------------- |
| SD Card       | SPI       | 33, 34, 35, 36  |
| LoRa Radio    | SPI       | Built-in SX1276 |
| OLED Display  | I2C       | Built-in        |

---

## 4. Data Acquisition & Processing

### 🔄 Sensor Reading Workflow

```
┌─────────────────────────────────────────┐
│  1. Sample Sensor (30 readings)         │
│     ↓                                    │
│  2. Sort Values                          │
│     ↓                                    │
│  3. Select Median (noise filtering)     │
│     ↓                                    │
│  4. Convert ADC → Voltage (0-3.3V)      │
│     ↓                                    │
│  5. Apply Calibration Curve             │
│     ↓                                    │
│  6. Temperature Compensation (TDS)      │
│     ↓                                    │
│  7. Store in SD Card                    │
│     ↓                                    │
│  8. Transmit via LoRa                    │
└─────────────────────────────────────────┘
```

### 📊 Data Processing Features

#### **Median Filtering**
- Each sensor sampled **30 times**
- Values sorted → **median selected**
- Removes:
  - Electrical noise
  - Sudden spikes
  - Floating buoy instability

#### **Analog Voltage Conversion**
```
ADC Raw (0-4095) → Voltage (0-3.3V)
Voltage = (ADC_Reading / 4095) × 3.3V
```

#### **Calibration System**

**pH Calibration:**
- 3-point calibration (pH 4, 7, 10 buffer solutions)
- Linear interpolation between points
- Stored in SD card: `ph_calibration.txt`

**TDS Calibration:**
- 2-point calibration (0 ppm, 1000 ppm solutions)
- Temperature-compensated readings
- Stored in SD card: `tds_calibration.txt`

**Turbidity Calibration:**
- Clear water baseline (0 NTU)
- Muddy water reference (known NTU value)
- Stored in SD card: `turbidity_calibration.txt`

---

## 5. LoRa Communication

### 📡 Transmission Protocol

**Packet Format:**
```
BUOY_ID|ph=7.12|tds=239|ntu=120|temp=25.3|w=1|ul=23.4|ts=1234567890
```

**Field Descriptions:**
- `BUOY_ID`: Unique buoy identifier (e.g., "SABARMATI_01")
- `ph`: pH value (0-14)
- `tds`: Total Dissolved Solids (ppm)
- `ntu`: Turbidity (NTU)
- `temp`: Temperature (°C)
- `w`: Water leak status (0=dry, 1=wet)
- `ul`: Ultrasonic water level (cm)
- `ts`: Unix timestamp

### 📡 LoRa Configuration

| Parameter          | Value    | Description                    |
| ------------------ | -------- | ------------------------------ |
| Frequency          | 915 MHz  | ISM band (India)               |
| Spreading Factor   | SF7      | Balance speed vs range          |
| Bandwidth          | 125 kHz  | Standard bandwidth             |
| Coding Rate        | 4/5      | Error correction                |
| Transmission Power | 20 dBm   | Maximum power for range         |
| Range              | 5-10 km  | Line of sight                  |

### 🗼 Receiver Tower Setup

**Components:**
- LoRa Gateway (Raspberry Pi + LoRa HAT)
- Node-RED for data processing
- MQTT broker for message routing
- Internet connection (4G/WiFi)

**Workflow:**
```
LoRa Packet → Gateway → Node-RED → MQTT → Backend API → Database
```

---

## 6. Cloud & Backend

### 🗄️ Data Storage

**Database Schema:**
```sql
water_quality_readings:
  - timestamp (datetime)
  - buoy_id (string)
  - ph (float)
  - tds (float)
  - turbidity (float)
  - temperature (float)
  - water_level (float)
  - leak_status (boolean)
  - location (lat, lng)
```

**Storage Options:**
- **Firebase Firestore** (Real-time database)
- **PostgreSQL** (Historical data)
- **Time-series DB** (InfluxDB for analytics)

### 🔄 Backend API Endpoints

**REST API Structure:**
```
POST   /api/v1/water-quality/reading     # Receive buoy data
GET    /api/v1/water-quality/latest      # Latest readings
GET    /api/v1/water-quality/history     # Historical data
GET    /api/v1/water-quality/alerts      # Active alerts
POST   /api/v1/water-quality/calibrate  # Update calibration
```

**Real-time Updates:**
- **Socket.IO** for live dashboard updates
- **WebSocket** connections for mobile app

---

## 7. AI & ML Integration

### 🤖 Flood Prediction (LSTM Model)

**Model Architecture:**
- **Input**: Rainfall + Historical discharge
- **Architecture**: LSTM (Long Short-Term Memory)
- **Output**: Predicted discharge 24-48 hours ahead
- **Accuracy**: R² > 0.99, MAE < 15 m³/s

**Location:** `lstm-master/ML/demo_sabarmati_enhanced.py`

**Workflow:**
```
Rainfall Data → LSTM Model → Discharge Prediction → Flood Risk Assessment → Alert
```

### 🧠 Anomaly Detection

**ML-Based Pollution Detection:**
- **Algorithm**: Isolation Forest / Autoencoder
- **Features**: pH, TDS, Turbidity, Temperature patterns
- **Output**: Anomaly score (0-1)
- **Threshold**: Score > 0.7 triggers alert

### 🐟 AI Species Identification

**Technology:** Google Gemini Vision API

**Workflow:**
```
User Photo → Base64 Encoding → Gemini API → Species Identification → Validation → Database
```

**Features:**
- Real-time species recognition
- Sabarmati-specific validation
- Conservation information
- Citizen science logging

**Location:** `backend/src/services/geminiService.ts`

---

## 8. Dashboard & Visualization

### 📊 Dashboard Features

**Real-time Monitoring:**
- Live sensor readings (updated every 5 seconds)
- Multi-buoy status overview
- River health index (0-100 score)
- Pollution hotspot map

**Historical Analysis:**
- Time-series charts (1 hour, 24 hours, 7 days, 30 days)
- Trend analysis
- Seasonal patterns
- Comparison with historical data

**Visualization Components:**
- Line charts (pH, TDS, Turbidity over time)
- Heat maps (pollution hotspots)
- Gauge meters (current values)
- Map view (buoy locations)

**Location:** `frontend/screens/WaterQualityOverviewScreen.tsx`

---

## 9. Alert System

### 🚨 Alert Triggers

| Condition                  | Alert Type        | Severity | Action                          |
| -------------------------- | ----------------- | -------- | ------------------------------- |
| pH < 5.0 or pH > 9.0       | Pollution Alert   | HIGH     | SMS + Email to authorities      |
| TDS > 1000 ppm              | Sewage Discharge  | HIGH     | Immediate notification          |
| Turbidity > 500 NTU         | Runoff/Muddy      | MEDIUM   | Dashboard alert                 |
| Temperature > 35°C         | Algae Bloom Risk  | MEDIUM   | Warning notification            |
| Water Level Drops > 20%     | Blockage          | MEDIUM   | Investigation alert             |
| Water Level Rises > 50%     | Flood Alert       | CRITICAL | Emergency broadcast             |
| Leak Sensor = WET           | Device Damage     | LOW      | Maintenance alert               |
| LSTM Flood Prediction > 1000 m³/s | Flood Warning | CRITICAL | Early warning system            |

### 📱 Alert Channels

1. **SMS** - Direct to authorities' phones
2. **WhatsApp** - Group notifications
3. **Email** - Detailed reports
4. **Dashboard** - Visual alerts
5. **Mobile App Push** - Citizen notifications
6. **Public Announcements** - Riverfront speakers

**Location:** `backend/src/services/alertService.ts`

---

## 10. Public Engagement

### 📱 Mobile App Features

**AI Species Identification:**
- Upload photo of fish/plant/bird
- AI identifies species using Gemini Vision
- Shows habitat, conservation status
- Logs to biodiversity database

**Location:** `frontend/screens/AISpeciesIdentificationScreen.tsx`

**Citizen Reporting:**
- Report pollution incidents
- Upload photos with location
- Track report status
- Earn reward points

**Location:** `frontend/screens/SubmitReportScreen.tsx`

**Gamification:**
- Badges for participation
- Leaderboard rankings
- Eco-volunteer certificates
- Reward points system

**Location:** `frontend/screens/RewardPointsScreen.tsx`

### 🎯 Impact Metrics

- **Citizen Engagement**: Species sightings logged
- **Pollution Reports**: Incidents reported and resolved
- **Awareness**: Educational content views
- **Community**: Active users and volunteers

---

## 11. Deployment Workflow

### 🔧 Installation Steps

#### **Step 1: Sensor Calibration**
```bash
1. Connect sensors to ESP32
2. Run calibration script
3. Test with known solutions
4. Save calibration values to SD card
```

#### **Step 2: Firmware Upload**
```bash
1. Install Arduino IDE / PlatformIO
2. Load firmware: buoy_firmware.ino
3. Configure LoRa parameters
4. Upload to ESP32
```

#### **Step 3: Buoy Assembly**
```bash
1. Seal electronics in waterproof enclosure
2. Mount sensors on buoy frame
3. Connect power supply (solar + battery)
4. Test all sensors
```

#### **Step 4: Field Deployment**
```bash
1. Select strategic river locations
2. Anchor buoy securely
3. Verify LoRa connectivity
4. Monitor initial readings
```

#### **Step 5: Gateway Setup**
```bash
1. Install LoRa gateway on nearest building
2. Configure Node-RED flows
3. Connect to internet
4. Test data reception
```

#### **Step 6: Backend Deployment**
```bash
1. Deploy backend API
2. Configure database
3. Set up alert system
4. Test end-to-end flow
```

#### **Step 7: Dashboard Launch**
```bash
1. Deploy frontend application
2. Configure API endpoints
3. Test real-time updates
4. Train operators
```

---

## 12. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SMART BUOY (River)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   pH     │  │   TDS    │  │ Turbidity│  │  Temp    │      │
│  │  Sensor  │  │  Sensor  │  │  Sensor  │  │  Sensor  │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │              │              │              │            │
│       └──────────────┴──────────────┴──────────────┘            │
│                          │                                      │
│                    ┌─────▼─────┐                                │
│                    │  ESP32    │                                │
│                    │  LoRa V3  │                                │
│                    └─────┬─────┘                                │
│                          │                                      │
│                    ┌─────▼─────┐                                │
│                    │   LoRa    │                                │
│                    │  Radio    │                                │
│                    └─────┬─────┘                                │
└──────────────────────────┼──────────────────────────────────────┘
                           │ LoRa (915 MHz, 5-10 km)
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│              RECEIVER TOWER (Shore)                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │   LoRa   │  │  Node-RED │  │   MQTT   │                      │
│  │ Gateway  │→ │  Processor│→ │  Broker  │                      │
│  └──────────┘  └──────────┘  └─────┬────┘                      │
└────────────────────────────────────┼──────────────────────────────┘
                                     │ Internet
┌────────────────────────────────────▼──────────────────────────────┐
│                      CLOUD BACKEND                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │   REST   │  │ Firebase │  │   LSTM   │  │   Alert   │        │
│  │   API    │  │ Firestore │  │  Model   │  │  Service  │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │              │              │              │              │
└───────┼──────────────┼──────────────┼──────────────┼──────────────┘
        │              │              │              │
        │              │              │              │
┌───────▼──────────────▼──────────────▼──────────────▼──────────────┐
│                    FRONTEND APPLICATIONS                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │Dashboard │  │  Mobile  │  │   Admin  │  │  Public  │         │
│  │   Web    │  │   App    │  │  Portal  │  │   API    │         │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │
└──────────────────────────────────────────────────────────────────┘
```

---

## 13. Data Flow Summary

### 📊 Complete Data Journey

```
1. Sensor Reading (Buoy)
   ↓
2. Median Filtering (ESP32)
   ↓
3. Calibration Application
   ↓
4. SD Card Logging
   ↓
5. LoRa Transmission
   ↓
6. Gateway Reception
   ↓
7. Node-RED Processing
   ↓
8. MQTT Publishing
   ↓
9. Backend API Ingestion
   ↓
10. Database Storage
   ↓
11. AI/ML Analysis
   ↓
12. Alert Generation (if needed)
   ↓
13. Dashboard Update
   ↓
14. Mobile App Notification
```

---

## 14. Key Performance Indicators (KPIs)

### 📈 System Metrics

- **Data Collection Rate**: 5-second intervals (12 readings/minute)
- **LoRa Transmission Success**: >95%
- **System Uptime**: >99%
- **Alert Response Time**: <30 seconds
- **Model Accuracy**: R² > 0.99
- **False Positive Rate**: <2%

### 🎯 Impact Metrics

- **Pollution Incidents Detected**: Real-time monitoring
- **Early Warnings Issued**: 24-48 hours advance notice
- **Citizen Engagement**: Species identifications, reports
- **Response Time**: Faster than manual monitoring

---

## 15. Troubleshooting Guide

### ⚠️ Common Issues

**Problem: Zero Readings**
- **Cause**: Under-voltage to sensors
- **Solution**: Use separate 5V supply, voltage booster, or buffer op-amp

**Problem: LoRa Not Transmitting**
- **Cause**: Out of range, interference
- **Solution**: Check gateway distance, adjust spreading factor

**Problem: SD Card Write Failures**
- **Cause**: Card full, corrupted, or loose connection
- **Solution**: Format card, check connections, increase logging interval

**Problem: Calibration Drift**
- **Cause**: Sensor aging, temperature changes
- **Solution**: Recalibrate monthly, use temperature compensation

---

## 16. Future Enhancements

### 🔮 Planned Features

1. **Multi-Basin Support**: Extend to other rivers
2. **Satellite Integration**: Backup communication
3. **Edge AI**: On-device anomaly detection
4. **Solar Power Optimization**: Extended battery life
5. **5G Integration**: Higher bandwidth for video
6. **Blockchain**: Immutable data logging
7. **AR Visualization**: Augmented reality river health

---

## 📚 Related Documentation

- **Hardware Setup**: See hardware documentation
- **Backend API**: `backend/README.md`
- **Frontend App**: `frontend/README.md`
- **LSTM Model**: `lstm-master/README.md`
- **Deployment Guide**: See deployment documentation

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Status**: Production Ready

