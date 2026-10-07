# GeoSafe: Urban Safety Analytics & Real-Time Emergency Response System

**Academic Final Year Project MVP & Production Architecture**  
*Lead Architect: Principal Mobile & Cloud Architect*

---

## 🌟 Executive Overview
**GeoSafe** is an advanced, production-grade mobile public safety platform designed to protect citizens in dense urban environments. Built using **React Native (TypeScript) + Expo** and **Flutter (Dart)** with **MapTiler / Leaflet**, **Google Maps SDK**, and **Firebase Cloud Services**, GeoSafe combines empirical urban crime analytics (from Mumbai and Delhi ride safety datasets) with intelligent risk-aware transit pathfinding and real-time emergency telemetry:

1. **🧭 Risk-Aware Safe Navigation (Route Navigator)**: Evaluates transit routes between urban zones, comparing the **Safest Route** (bypassing high-risk corridors, prioritizing high CCTV surveillance and police proximity) against the **Direct Route**. Provides turn-by-turn steps, risk breakdown percentages, and interactive navigation simulation.
2. **🗺️ Interactive Spatial Zone Explorer**: Live GPS-enabled map rendering 80 clustered safety zones across Mumbai and Delhi color-coded by composite risk category (🟢 Low Risk, 🟡 Moderate Risk, 🔴 High Risk), with search and category filters.
3. **📊 Dynamic Map Themes**: Powered by **MapTiler** vector tiles with instant switching between Streets, Dark Night Mode, and Outdoor Topographic styles.
4. **📍 Current Area Risk Card (Live HUD)**: Instant floating HUD calculating localized risk scores (1.00 – 5.00), CCTV camera density, and nearby police stations within emergency response radius via Haversine distance.
5. **🚨 One-Tap Guardian SOS & Real-Time Telemetry Streaming**: 5-second countdown with haptic feedback to prevent accidental triggers, broadcasting emergency state and continuous 5-second GPS updates to Cloud Firestore.
6. **📡 Guardian Live Tracker**: Real-time subscriber map allowing designated contacts to follow the victim's moving GPS marker with historical breadcrumbs.
7. **📞 Discreet Fake Call Simulator**: Telephony Web Audio synthesis generating realistic 440 Hz + 480 Hz ring frequencies, customizable countdown delay (Instant, 5s, 10s, 30s), vibration cadence, and active call duration timer.
8. **📈 Urban Crime & Diurnal Analytics**: Deep-dive analytics dashboard evaluating time-of-day risk multipliers, CCTV distribution, and comparative cross-metro safety profiles.

---

## 🧮 Mathematical Formulation & Algorithmic Foundation

### 1. Raw Incident Risk Score Formulation
The model computes a baseline raw risk score for any urban sector based on multi-variate crime characteristics:

$$\text{Raw Risk Score} = \left( 0.4 \cdot S_{\text{crime}} + 0.2 \cdot C_{\text{public}} + 0.2 \cdot (10 - \min(10, N_{\text{cctv}})) + 0.2 \cdot (5 - \min(5, N_{\text{police}})) \right) \cdot W_{\text{time}}$$

Where:
- $S_{\text{crime}}$: Crime Severity Index (1.0 to 10.0 scale)
- $C_{\text{public}}$: Public complaints frequency
- $N_{\text{cctv}}$: Nearby CCTV surveillance camera density
- $N_{\text{police}}$: Number of police stations within emergency response radius
- $W_{\text{time}}$: Diurnal Time-of-Day weight factor:
  - $\text{Morning (05:00 - 11:59)} \implies 1.0$
  - $\text{Afternoon (12:00 - 16:59)} \implies 1.1$
  - $\text{Evening (17:00 - 20:59)} \implies 1.3$
  - $\text{Night (21:00 - 04:59)} \implies 1.6$

### 2. Normalization to 1.0 – 5.0 Safety Score Scale
The raw score is mapped onto a standardized safety score:

$$\text{Calculated Risk Score} = 1 + 4 \cdot \left( \frac{\text{Raw Risk Score} - \min(\text{Raw})}{\max(\text{Raw}) - \min(\text{Raw})} \right)$$

### 3. Risk Category Thresholds
- **🟢 Low Risk (Green):** $\text{Score} < 2.20$
- **🟡 Moderate Risk (Yellow/Amber):** $2.20 \le \text{Score} < 3.50$
- **🔴 High Risk (Red):** $\text{Score} \ge 3.50$

### 4. Haversine Spatial Proximity Metric
To associate any moving user coordinate $(\phi_u, \lambda_u)$ with the closest pre-calculated urban risk centroid $(\phi_z, \lambda_z)$:

$$d = 2 R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_u)\cos(\phi_z)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$

Where $R = 6371\text{ km}$. The client evaluates distance in real time and automatically updates the nearest zone risk context.

### 5. Safe Route Optimization Principle
The routing engine optimizes a composite cost function balancing transit distance $D$ and spatial risk exposure $R_i$:

$$\min \mathcal{C} = \sum_{i=1}^{k} \left( D_i \cdot (1 + \alpha \cdot \text{RiskScore}_i) \right)$$

Where $\alpha$ is the safety priority penalty parameter ($\alpha > 0$). High-risk segments are penalized, dynamically steering waypoints toward well-lit, highly surveyed corridors.

---

## 🏗️ Repository Structure

```
d:\Sem 5\Stats\Project\SRP-Vaidik\SRP-Vaidik\
├── geosafe-mobile/                    # Complete React Native (TypeScript) + Expo Web/Mobile App
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.ts           # Firebase Auth & Firestore client configuration
│   │   ├── types/
│   │   │   └── index.ts              # Domain models & TypeScript interfaces
│   │   ├── services/
│   │   │   ├── RoutingService.ts     # Risk-aware pathfinding & waypoint interpolation
│   │   │   ├── SafetyZoneService.ts  # Haversine spatial indexing & risk centroid filtering
│   │   │   ├── EmergencyService.ts   # Firestore active_emergencies & GPS streaming
│   │   │   ├── LocationService.ts    # Continuous GPS positioning (expo-location)
│   │   │   ├── FakeCallService.ts    # Web Audio dual-tone synthesis & haptic cadences
│   │   │   └── AuthService.ts        # Anonymous / Email Auth & profile management
│   │   ├── context/
│   │   │   ├── AuthContext.tsx       # User profile, emergency contact & session state
│   │   │   ├── SafetyContext.tsx     # Zones, active filters, and nearest-location state
│   │   │   └── EmergencyContext.tsx  # SOS countdown, GPS telemetry & fake call state
│   │   ├── components/
│   │   │   ├── Map/
│   │   │   │   ├── SafeZoneMap.web.tsx    # Leaflet + MapTiler vector map with styles
│   │   │   │   ├── SafeZoneMap.native.tsx # Google Maps SDK (react-native-maps)
│   │   │   │   └── SafeZoneMap.tsx        # Universal cross-platform bridge
│   │   │   ├── RiskCard/
│   │   │   │   └── CurrentAreaRiskCard.tsx # Floating risk metrics HUD
│   │   │   ├── SOS/
│   │   │   │   └── HoldForSOSButton.tsx   # 5-second countdown SOS trigger
│   │   │   ├── FakeCall/
│   │   │   │   └── FakeCallModal.tsx      # Realistic incoming call overlay & talk timer
│   │   │   └── Guardian/
│   │   │       └── GuardianTrackingView.tsx # Real-time moving marker viewer
│   │   ├── screens/
│   │   │   ├── RouteNavigatorScreen.tsx   # Safe Navigation & Route Comparison (Safe vs Direct)
│   │   │   ├── ZoneExplorerScreen.tsx     # Interactive Zone Directory & Map Explorer
│   │   │   ├── SafetyAnalyticsScreen.tsx  # Hotspot distributions & Diurnal time analysis
│   │   │   ├── FakeCallScreen.tsx         # Dedicated Call Simulator trigger & presets
│   │   │   ├── SettingsScreen.tsx         # Contact, caller ID & cloud toggles
│   │   │   ├── HomeScreen.tsx             # Interactive dashboard & live map view
│   │   │   └── AuthScreen.tsx             # Login & emergency profile configuration
│   │   └── data/
│   │       └── safety_zones.json          # 80 pre-calculated urban risk zones (Mumbai & Delhi)
│   ├── App.tsx                            # Root component with responsive navigation shell
│   ├── package.json                       # Dependencies & scripts
│   └── tsconfig.json                      # TypeScript compiler configuration
│
├── flutter_geosafe/                   # Complete Flutter (Dart) Clean Architecture App
│   ├── lib/
│   │   ├── models/                   # UserProfile, SafetyZone, ActiveEmergency
│   │   ├── services/                 # AuthService, SafetyZoneService, EmergencyService
│   │   ├── providers/                # SafetyProvider, EmergencyProvider, AuthProvider
│   │   ├── screens/                  # HomeMapScreen, AuthScreen, GuardianScreen, FakeCallScreen
│   │   ├── widgets/                  # CurrentAreaRiskCard, HoldForSOSButton
│   │   └── main.dart                 # MultiProvider MaterialApp
│   ├── assets/
│   │   └── safety_zones.json         # Bundled offline safety dataset
│   └── pubspec.yaml                  # Flutter dependencies (google_maps_flutter, firebase, etc.)
│
├── firebase_safety_zones.json         # Aggregated urban crime safety zones dataset
├── cleaned_ride_safety_dataset.csv    # Cleaned CSV with calculated risk scores
├── clean_dataset.py                   # Dataset cleaning & score generation pipeline
├── generate_accurate_dataset.py       # High-fidelity synthetic urban dataset generator
├── seed_firestore.py                  # Python batch upload script for Firestore
├── seed_firestore.js                  # Node.js batch upload script for Firestore
├── firestore.rules                    # Production Firestore security rules
├── firestore.indexes.json             # Firestore composite indexes
├── firebase.json                      # Firebase deployment configuration
└── ARCHITECTURE.md                    # Engineering Specification & Mathematical Architecture
```

---

## 🚀 Quick Start Guide

### 1. Run React Native (TypeScript) App

The React Native application runs seamlessly in modern desktop browsers (Chrome, Edge, Firefox, Safari) and on physical mobile devices using Expo Go.

```bash
# Navigate to the mobile project directory
cd geosafe-mobile

# Install dependencies (if not already installed)
npm install

# Start in Web Browser (Recommended for instant desktop evaluation)
npm run web

# Or start the Expo Metro bundler for physical devices (Scan QR code with Expo Go)
npm start
```

> **Zero-Configuration Mode**: The application includes an offline dataset cache of all 80 Mumbai and Delhi risk clusters and an in-memory real-time event pipeline. Every screen (Safe Navigation, Zone Explorer, Fake Call, SOS, and Analytics) functions immediately without requiring external API credentials.

### 2. Run Flutter (Dart) App

```bash
cd flutter_geosafe
flutter pub get
flutter run
```

---

## 🗺️ Map Configuration & Environment Variables

The web map interface utilizes **MapTiler** vector and raster tiles rendered via **Leaflet**:

| Variable | Description | Default / Fallback |
|---|---|---|
| `EXPO_PUBLIC_MAPTILER_API_KEY` | MapTiler Cloud API key for vector basemaps | Built-in fallback provided (`531qvS4fRFPC9WsHeuGE`) |

To configure a custom key:
1. Create a `.env` file in `geosafe-mobile/`:
   ```env
   EXPO_PUBLIC_MAPTILER_API_KEY=your_maptiler_api_key_here
   ```
2. Restart the development server with `npm run web`.

---

## ☁️ Firebase Cloud Setup & Database Seeding

### Step 1: Firebase Project Setup
1. Open the [Firebase Console](https://console.firebase.google.com/) and create a project named `geosafe`.
2. Enable **Authentication** (Anonymous and Email/Password).
3. Enable **Cloud Firestore Database** in Production mode.
4. Deploy security rules from `firestore.rules`.

### Step 2: Seed the 80 Safety Zones into Firestore
Download your `serviceAccountKey.json` from **Firebase Console -> Project Settings -> Service Accounts**, save it in the repository root, and run:

**Using Python:**
```bash
pip install firebase-admin
python seed_firestore.py serviceAccountKey.json
```

**Using Node.js:**
```bash
npm install firebase-admin
node seed_firestore.js serviceAccountKey.json
```

---

## 📊 Database Schema

### Collection: `users`
| Field | Type | Description |
|---|---|---|
| `uid` | String | Unique Firebase user ID (Primary Key) |
| `name` | String | User's full name |
| `phone` | String | User's personal phone number |
| `emergency_contact` | String | Primary emergency guardian phone number |
| `created_at` | Timestamp | Account creation timestamp |

### Collection: `safety_zones`
| Field | Type | Description |
|---|---|---|
| `City` | String | Urban metro name (`"Mumbai"` or `"Delhi"`) |
| `Location` | String | Locality centroid name (e.g. `"Andheri"`, `"Connaught Place"`) |
| `Time_of_Day` | String | Observation interval (`"Morning"`, `"Afternoon"`, `"Evening"`, `"Night"`) |
| `avg_risk_score` | Number | Normalized risk index from `1.00` to `5.00` |
| `risk_category` | String | Categorical risk label (`"Low Risk"`, `"Moderate Risk"`, `"High Risk"`) |
| `center_lat` | Number | Spatial latitude centroid coordinate |
| `center_lng` | Number | Spatial longitude centroid coordinate |
| `avg_cctv` | Number | Average count of operational CCTV cameras in zone |
| `avg_police_stations` | Number | Nearby police stations count |

### Collection: `active_emergencies`
| Field | Type | Description |
|---|---|---|
| `emergency_id` | String | Unique SOS alert token (e.g. `"sos_1709823412"`) |
| `user_id` | String | Reference to the triggering user |
| `status` | String | Current state (`"ACTIVE"` or `"RESOLVED"`) |
| `current_lat` | Number | Real-time streaming GPS latitude |
| `current_lng` | Number | Real-time streaming GPS longitude |
| `last_updated` | Timestamp | Timestamp of the most recent 5-second coordinate update |

---

## 🎓 Academic Defense & Viva Presentation Guide

### Key Questions & Architectural Rationale

1. **How does the Route Navigator calculate the "Safest Route"?**
   * *Answer*: Traditional navigation algorithms optimize exclusively for distance or time. GeoSafe's routing engine factors in safety score, CCTV density, and police presence along candidate route segments. When evaluating path segments, routes with high incident scores incur an algorithmic cost penalty, steering waypoints into well-lit, surveyed corridors even if the trip is slightly longer.

2. **Why does GeoSafe apply a diurnal time-of-day weight factor?**
   * *Answer*: Urban crime incidence is strongly correlated with natural surveillance (Jane Jacobs' "eyes on the street" principle). Night-time hours (21:00 – 04:59) experience lower foot traffic and reduced transit coverage; the model therefore applies a 1.6x multiplier during night hours to reflect elevated vulnerability.

3. **How does real-time GPS streaming minimize battery consumption?**
   * *Answer*: High-frequency GPS streaming (every 5 seconds) only activates when an SOS countdown completes and transitions to `ACTIVE`. During regular standby navigation, GeoSafe employs distance-filtered updates with balanced power accuracy.

4. **How does the system ensure resilience in low-connectivity or offline areas?**
   * *Answer*: GeoSafe embeds the 80 pre-calculated urban risk clusters in client-side storage (`safety_zones.json`). When network connectivity is intermittent, the Haversine distance calculator continues to evaluate local risk offline without network latency.

5. **How does the Fake Call Simulator work on the Web and Mobile?**
   * *Answer*: Rather than relying on external audio files that could fail to load, GeoSafe uses the **Web Audio API** on web and **expo-av** on mobile to synthesize standard telephony ring frequencies ($440\text{ Hz} + 480\text{ Hz}$) dynamically, paired with custom vibration cadences and a full-screen realistic incoming call UI.