# Sentinel-X SIEM System

> **Advanced Security Information and Event Management Platform**  
> Real-time threat detection, ML-powered anomaly analysis, and automated incident response

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-green.svg)
![React](https://img.shields.io/badge/react-19.2.0-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-latest-teal.svg)

---

## 📑 Table of Contents
- [Architecture Overview](#architecture-overview)
- [Backend Features](#backend-features)
- [Frontend Features](#frontend-features)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [Code Reference Guide](#code-reference-guide)

---

## 🏗️ Architecture Overview

```
Sentinel-X SIEM
├── Backend (FastAPI + Python)
│   ├── REST API Layer
│   ├── Machine Learning Engine
│   ├── SOAR Automation
│   └── SQLite Database
└── Frontend (React + Vite)
    ├── Real-time Dashboard
    ├── Data Visualizations
    └── Interactive UI
```

---

## 🔧 Backend Features

### 1. **Core Application Framework**

#### FastAPI Application Setup
**File:** `backend/app/main.py`

| Feature | Lines | Description |
|---------|-------|-------------|
| **FastAPI Instance** | 13-16 | Application initialization with OpenAPI docs |
| **CORS Middleware** | 18-24 | Cross-origin resource sharing for frontend |
| **Database Lifespan** | 6-8 | Async context manager for DB initialization |
| **API Routers** | 27-28 | Endpoint and dashboard route registration |
| **Health Check** | 31-32 | Root endpoint returning system status |

```python
# backend/app/main.py:13-16
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)
```

---

### 2. **Data Models & Schema**

#### Database Models
**File:** `backend/app/models/models.py`

| Model | Lines | Fields | Purpose |
|-------|-------|--------|---------|
| **User** | 5-11 | username, email, role, is_active | User authentication & authorization |
| **Log** | 13-19 | timestamp, source, event_type, raw_data | Raw security event ingestion |
| **Alert** | 21-29 | risk_score, title, status, confidence | Security alert management |
| **Playbook** | 31-36 | name, risk_level, action_script | SOAR automation rules |

```python
# backend/app/models/models.py:21-29
class Alert(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    risk_score: float
    title: str
    description: str
    status: str = "new"  # new, investigating, resolved
    entity_id: str
    confidence_score: float
```

---

### 3. **API Endpoints**

#### Log Ingestion Endpoint
**File:** `backend/app/api/endpoints.py`

| Endpoint | Lines | Method | Functionality |
|----------|-------|--------|---------------|
| **POST /logs** | 17-28 | POST | Ingest logs + trigger background analysis |
| **GET /logs** | 34-35 | GET | Retrieve paginated logs (sorted by timestamp) |
| **GET /alerts** | 30-31 | GET | Fetch security alerts with pagination |

```python
# backend/app/api/endpoints.py:17-28
@router.post("/logs", response_model=Log)
def ingest_log(log: Log, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    """
    Ingest a new log entry.
    Trigger async analysis here.
    """
    session.add(log)
    session.commit()
    session.refresh(log)
    
    background_tasks.add_task(analyze_log_task, log.id, get_session_factory())
    
    return log
```

#### Dashboard Statistics Endpoint
**File:** `backend/app/api/dashboard.py`

| Endpoint | Lines | Response Data |
|----------|-------|---------------|
| **GET /dashboard/stats** | 12-96 | Stats, charts, high-risk users, recent offenses |
| - Monitored Users | 15-16 | Total users count or mock 3600 |
| - High Risk Users | 18-19 | Users with risk_score > 50 |
| - Events/Hour | 23 | Mock 778,900+ events |
| - System Score Chart | 26-31 | 24-hour trend data |
| - Risk Breakdown | 34-39 | 4-category pie chart data |
| - High Risk Users List | 42-52 | Top 5 users by aggregated risk |
| - Recent Offenses | 66-74 | Latest 5 alerts with metadata |

```python
# backend/app/api/dashboard.py:26-31
system_score_data = []
now = datetime.utcnow()
for i in range(24):
    time_label = (now - timedelta(hours=23-i)).strftime("%H:00")
    score = 2000000 + (i * 100000) + random.randint(-50000, 50000)
    system_score_data.append({"time": time_label, "score": score})
```

---

### 4. **Machine Learning & Anomaly Detection**

#### Isolation Forest Model
**File:** `backend/app/ml/anomaly_detector.py`

| Component | Lines | Functionality |
|-----------|-------|---------------|
| **Model Initialization** | 6-9 | IsolationForest with 5% contamination rate |
| **Training Method** | 11-16 | Fit model and persist to disk |
| **Model Loading** | 18-21 | Load pre-trained model from file |
| **Anomaly Prediction** | 23-31 | Returns -1 (anomaly) or 1 (normal) |
| **Anomaly Scoring** | 33-41 | Continuous anomaly score (lower = more anomalous) |
| **Global Detector** | 43 | Singleton detector instance |

```python
# backend/app/ml/anomaly_detector.py:6-9
def __init__(self, model_path="model.pkl"):
    self.model_path = model_path
    self.model = IsolationForest(contamination=0.05, random_state=42)
    self.is_trained = False
```

---

### 5. **Analysis Service**

#### Log Analysis Engine
**File:** `backend/app/services/analysis.py`

| Feature | Lines | Risk Points | Description |
|---------|-------|-------------|-------------|
| **Feature Extraction** | 17-19 | - | Extract hour, location, access patterns |
| **Anomaly Detection** | 21-29 | +50 | ML-based behavioral anomaly detection |
| **VPN Detection** | 32-35 | +20 | New location VPN access detection |
| **Failed Operation** | 37-39 | +10 | Failed login/access detection |
| **Threat Intel** | 41-42 | +80 | IP reputation checking (framework) |
| **Alert Creation** | 45-54 | Threshold: 20+ | Generate alert if risk exceeds threshold |
| **SOAR Trigger** | 57-58 | Threshold: 80+ | Automatic response for critical alerts |
| **Background Task** | 68-71 | - | Async log processing |

```python
# backend/app/services/analysis.py:21-29
# 2. Anomaly Detection
anomaly_score = detector.score_samples(features)
is_anomaly = detector.predict(features) == -1

risk_score = 0.0
reasons = []

if is_anomaly:
    risk_score += 50.0
    reasons.append(f"Behavioral Anomaly Detected (Score: {anomaly_score:.2f})")
```

**Risk Scoring System:**
```
Total Risk Score = Anomaly (50) + VPN (20) + Failed Op (10) + Threat Intel (80)
├── Low Risk: 0-20 (No alert)
├── Medium Risk: 21-50 (Alert generated)
├── High Risk: 51-80 (Alert + Investigation)
└── Critical: 81+ (Alert + SOAR Automation)
```

---

### 6. **Alert Correlation Engine**

**File:** `backend/app/services/correlation.py`

| Feature | Lines | Functionality |
|---------|-------|---------------|
| **Alert Grouping** | 12-18 | Group alerts by entity_id |
| **Time Window Analysis** | 10 | Filter alerts with status="new" |
| **Incident Detection** | 20-22 | Detect multiple alerts per entity |
| **Risk Aggregation** | 26-28 | Sum risk scores for escalation |
| **Incident Escalation** | 27-28 | Escalate when total risk > 50 |

```python
# backend/app/services/correlation.py:26-28
total_risk = sum(a.risk_score for a in entity_alerts)
if total_risk > 50:
    print(f"ESCALATING INCIDENT for {entity_id} (Total Risk: {total_risk})")
```

---

### 7. **SOAR (Security Orchestration & Response)**

**File:** `backend/app/services/soar.py`

| Component | Lines | Action | Integration |
|-----------|-------|--------|-------------|
| **Playbook Executor** | 6-17 | Execute automated responses | Main orchestration |
| **IP Blocking** | 19-21 | Block malicious IPs | Firewall API (mock) |
| **User Disabling** | 23-25 | Disable compromised accounts | IAM API (mock) |
| **Status Update** | 13-16 | Mark alert as resolved | Database update |

```python
# backend/app/services/soar.py:6-17
def execute_playbook(self, alert: Alert, playbook_name: str):
    """
    Execute a defined playbook.
    """
    print(f"EXECUTING PLAYBOOK: {playbook_name} for Alert {alert.id}")
    
    if playbook_name == "Block IP":
        self._block_ip(alert.entity_id)
    elif playbook_name == "Disable User":
        self._disable_user(alert.entity_id)
        
    alert.playbook_executed = playbook_name
    alert.status = "resolved"
```

---

### 8. **Configuration Management**

**File:** `backend/app/core/config.py`

| Setting | Line | Default Value | Purpose |
|---------|------|---------------|---------|
| **PROJECT_NAME** | 4 | "Sentinel-X" | Application name |
| **API_V1_STR** | 5 | "/api/v1" | API version prefix |
| **DATABASE_URL** | 6 | "sqlite:///./sentinel.db" | SQLite connection |
| **SECRET_KEY** | 7 | "supersecretkey" | JWT signing key |
| **ALGORITHM** | 8 | "HS256" | JWT algorithm |
| **TOKEN_EXPIRE** | 9 | 30 minutes | Session duration |

---

### 9. **Database Layer**

**File:** `backend/app/core/database.py`

| Component | Lines | Functionality |
|-----------|-------|---------------|
| **Engine Creation** | 4 | SQLite engine with thread-safe config |
| **Table Creation** | 6-7 | Create all SQLModel tables |
| **Session Factory** | 9-11 | Dependency injection for DB sessions |

---

## 🎨 Frontend Features

### 1. **Main Application**

**File:** `frontend/src/App.jsx`

| Component | Lines | Purpose |
|-----------|-------|---------|
| **Dashboard Import** | 1 | Main dashboard component |
| **App Container** | 4-8 | Root component with Tailwind styling |

---

### 2. **Dashboard Component**

**File:** `frontend/src/components/Dashboard.jsx`

#### State Management
| State | Lines | Purpose |
|-------|-------|---------|
| **data** | 7 | Stores dashboard statistics from API |
| **loading** | 8 | Controls loading state display |

#### Data Fetching
| Function | Lines | Interval | Description |
|----------|-------|----------|-------------|
| **fetchData** | 10-17 | On-demand | Axios GET request to backend API |
| **useEffect Hook** | 19-23 | 5 seconds | Real-time polling with auto-refresh |

```javascript
// frontend/src/components/Dashboard.jsx:19-23
useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Real-time polling
    return () => clearInterval(interval);
}, []);
```

#### UI Sections

**Header Section** (Lines 30-46)
```javascript
// Lines 32-33: Page title
<h1 className="text-2xl font-bold text-gray-100">Quick Insights</h1>

// Lines 34-41: User search bar
<Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
<input type="text" placeholder="Search for User" ... />

// Lines 44-45: Auto-refresh timer + manual refresh button
<RefreshCw className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white" onClick={fetchData} />
```

**Statistics Cards** (Lines 49-53)
| Card | Data Source | Display Format |
|------|-------------|----------------|
| Monitored Users | `data.stats.monitored_users` | Thousands separator |
| High Risk Users | `data.stats.high_risk_users` | Thousands separator |
| Events (Last Hour) | `data.stats.events_last_hour` | Thousands separator |
| Offenses (Last Hour) | `data.stats.offenses_last_hour` | Thousands separator |

**System Score Chart** (Lines 56-82)
```javascript
// Lines 56-58: Chart container (2/3 grid width)
<div className="lg:col-span-2 bg-surface p-4 rounded-xl border border-gray-700">

// Lines 63-81: Recharts AreaChart
<AreaChart data={data.charts.system_score}>
    // Lines 65-69: Gradient definition
    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
    </linearGradient>
    
    // Lines 70-71: Grid styling
    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
    
    // Lines 79: Area with gradient fill
    <Area type="monotone" dataKey="score" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScore)" />
</AreaChart>
```

**Risk Breakdown Donut Chart** (Lines 85-111)
```javascript
// Lines 90-100: PieChart with inner radius
<PieChart>
    <Pie
        data={data.charts.risk_breakdown}
        innerRadius={60}
        outerRadius={80}
        paddingAngle={5}
        dataKey="value"
    >
        {data.charts.risk_breakdown.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
    </Pie>
</PieChart>

// Lines 103-110: Legend with color indicators
{data.charts.risk_breakdown.map((item, idx) => (
    <div key={idx} className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
        {item.name}
    </div>
))}
```

**High Risk Users List** (Lines 117-141)
```javascript
// Lines 124-137: User list mapping
{data.lists.high_risk_users.map((user, idx) => (
    <div key={idx} className="flex items-center justify-between ...">
        // Lines 126-129: User avatar
        <div className="w-8 h-8 bg-gray-700 rounded-full ...">
            {user.username.substring(0, 2).toUpperCase()}
        </div>
        
        // Lines 130: Username display
        <span className="text-sm font-medium">{user.username}</span>
        
        // Lines 133-134: Risk score + investigation icon
        <span className="font-bold text-gray-200">{user.score.toLocaleString()}</span>
        <Eye className="w-4 h-4 text-danger cursor-pointer" />
    </div>
))}
```

**Recent Offenses List** (Lines 144-173)
```javascript
// Lines 150-169: Offense cards mapping
{data.lists.recent_offenses.map((offense, idx) => (
    <div key={idx} className="flex items-center justify-between ...">
        // Lines 152-153: Offense ID
        <div className="text-xs text-gray-400">Offense #{offense.id}</div>
        
        // Lines 154: Associated user
        <div className="font-medium text-primary">User: {offense.user}</div>
        
        // Lines 155: Event/Flow counts
        <div className="text-xs text-gray-500">Event Count: {offense.event_count} | Flow Count: 0</div>
        
        // Lines 160-165: Magnitude progress bar
        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
                className="h-full bg-gradient-to-r from-yellow-500 to-red-500"
                style={{ width: `${offense.magnitude * 10}%` }}
            ></div>
        </div>
    </div>
))}
```

**StatCard Component** (Lines 178-183)
```javascript
// Reusable card component for top statistics
const StatCard = ({ label, value }) => (
    <div className="bg-surface p-6 rounded-xl border border-gray-700">
        <p className="text-sm text-gray-400 mb-2">{label}</p>
        <p className="text-4xl font-bold text-gray-100">{value}</p>
    </div>
);
```

---

### 3. **Styling Configuration**

**File:** `frontend/src/index.css`

Custom Tailwind theme with cybersecurity-focused color palette:
- Dark background colors
- Surface colors for cards
- Primary/danger accent colors
- Border styling with gray-700

---

### 4. **Build Configuration**

**File:** `frontend/vite.config.js`

| Configuration | Purpose |
|---------------|---------|
| React plugin | JSX transformation and fast refresh |
| Port 5173 | Default development server |
| HMR | Hot module replacement for instant updates |

**File:** `frontend/package.json`

| Script | Command | Purpose |
|--------|---------|---------|
| dev | `vite` | Start development server |
| build | `vite build` | Production build |
| preview | `vite preview` | Preview production build |

---

## 📦 Installation & Setup

### Prerequisites
```bash
# Backend
Python 3.8+
pip package manager

# Frontend
Node.js 16+
npm or yarn
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Dependencies (requirements.txt)
# - fastapi: Web framework
# - uvicorn: ASGI server
# - sqlmodel: ORM with Pydantic integration
# - scikit-learn: ML library for anomaly detection
# - pandas, numpy: Data processing
# - python-jose: JWT token handling
# - passlib: Password hashing
```

**Start Backend Server:**
```bash
# Run from /backend directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Server runs on: http://localhost:8000
# API docs: http://localhost:8000/docs
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Key dependencies (package.json)
# - react 19.2.0: UI framework
# - axios: HTTP client
# - recharts: Chart library
# - lucide-react: Icon library
# - tailwindcss 4.1.18: CSS framework
# - vite 7.2.4: Build tool
```

**Start Frontend Server:**
```bash
# Run from /frontend directory
npm run dev

# Dev server runs on: http://localhost:5173
```

---

## 🔗 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Endpoints Reference

#### 1. Health Check
```http
GET /
Response: {"message": "Sentinel-X SIEM Active"}
Location: backend/app/main.py:31-32
```

#### 2. Log Ingestion
```http
POST /api/v1/logs
Content-Type: application/json

Request Body:
{
  "source": "firewall",
  "event_type": "login",
  "entity_id": "user123",
  "raw_data": "{\"ip\":\"192.168.1.1\",\"action\":\"vpn_login\"}"
}

Response: Log object with ID
Location: backend/app/api/endpoints.py:17-28
```

#### 3. Retrieve Logs
```http
GET /api/v1/logs?skip=0&limit=50
Response: Array of Log objects (sorted by timestamp desc)
Location: backend/app/api/endpoints.py:34-35
```

#### 4. Retrieve Alerts
```http
GET /api/v1/alerts?skip=0&limit=100
Response: Array of Alert objects
Location: backend/app/api/endpoints.py:30-31
```

#### 5. Dashboard Statistics
```http
GET /api/v1/dashboard/stats

Response:
{
  "stats": {
    "monitored_users": 3600,
    "high_risk_users": 3500,
    "events_last_hour": 778900,
    "offenses_last_hour": 606
  },
  "charts": {
    "system_score": [...],
    "risk_breakdown": [...]
  },
  "lists": {
    "high_risk_users": [...],
    "recent_offenses": [...]
  }
}

Location: backend/app/api/dashboard.py:12-96
```

---

## 📚 Code Reference Guide

### Quick File Lookup

#### Backend Core Files
```
backend/app/
├── main.py                    # FastAPI app, CORS, routers (35 lines)
├── core/
│   ├── config.py             # Settings, env vars (13 lines)
│   └── database.py           # SQLite engine, sessions (11 lines)
├── models/
│   └── models.py             # User, Log, Alert, Playbook (36 lines)
├── api/
│   ├── endpoints.py          # Log/Alert CRUD (38 lines)
│   └── dashboard.py          # Dashboard stats API (96 lines)
├── ml/
│   └── anomaly_detector.py   # Isolation Forest ML (43 lines)
└── services/
    ├── analysis.py           # Risk scoring engine (73 lines)
    ├── correlation.py        # Alert correlation (33 lines)
    └── soar.py              # Playbook execution (25 lines)
```

#### Frontend Core Files
```
frontend/src/
├── App.jsx                   # Root component (8 lines)
├── main.jsx                  # React entry point
├── index.css                 # Tailwind styles
└── components/
    └── Dashboard.jsx         # Main dashboard UI (189 lines)
```

### Key Algorithm Locations

#### Risk Scoring Algorithm
**File:** `backend/app/services/analysis.py`
```
Lines 24-42: Risk calculation logic
  - Line 28: Anomaly detection (+50 points)
  - Line 34: VPN detection (+20 points)
  - Line 38: Failed operation (+10 points)
  - Line 46: Alert threshold check (>20)
  - Line 58: SOAR trigger threshold (>80)
```

#### ML Model Usage
**File:** `backend/app/ml/anomaly_detector.py`
```
Lines 23-31: Anomaly prediction
Lines 33-41: Anomaly scoring
```

#### Dashboard Data Processing
**File:** `backend/app/api/dashboard.py`
```
Lines 15-23: Top stats calculation
Lines 26-31: System score time series
Lines 34-39: Risk breakdown categories
Lines 42-57: High-risk user aggregation
Lines 66-74: Recent offenses formatting
```

#### Frontend Real-Time Updates
**File:** `frontend/src/components/Dashboard.jsx`
```
Lines 10-17: Data fetching function
Lines 19-23: 5-second polling interval
Lines 44-45: Manual refresh button
```

---

## 🚀 Feature Implementation Matrix

| Feature | Backend File | Backend Lines | Frontend File | Frontend Lines |
|---------|--------------|---------------|---------------|----------------|
| **Log Ingestion** | `api/endpoints.py` | 17-28 | - | - |
| **Background Analysis** | `services/analysis.py` | 12-58 | - | - |
| **ML Anomaly Detection** | `ml/anomaly_detector.py` | 23-41 | - | - |
| **Risk Scoring** | `services/analysis.py` | 24-42 | - | - |
| **Alert Generation** | `services/analysis.py` | 45-54 | - | - |
| **SOAR Automation** | `services/soar.py` | 6-25 | - | - |
| **Alert Correlation** | `services/correlation.py` | 12-28 | - | - |
| **Dashboard Stats** | `api/dashboard.py` | 12-96 | `Dashboard.jsx` | 10-17 |
| **Real-Time Polling** | - | - | `Dashboard.jsx` | 19-23 |
| **Stats Display** | - | - | `Dashboard.jsx` | 49-53 |
| **System Score Chart** | `api/dashboard.py` | 26-31 | `Dashboard.jsx` | 63-81 |
| **Risk Donut Chart** | `api/dashboard.py` | 34-39 | `Dashboard.jsx` | 90-110 |
| **High Risk Users** | `api/dashboard.py` | 42-57 | `Dashboard.jsx` | 124-137 |
| **Recent Offenses** | `api/dashboard.py` | 66-74 | `Dashboard.jsx` | 150-169 |
| **User Search** | - | - | `Dashboard.jsx` | 34-41 |
| **Manual Refresh** | - | - | `Dashboard.jsx` | 44-45 |

---

## 🔍 Key Design Patterns

### 1. **Background Task Processing**
```python
# backend/app/api/endpoints.py:26
background_tasks.add_task(analyze_log_task, log.id, get_session_factory())
```
Non-blocking log analysis for high-throughput ingestion

### 2. **Dependency Injection**
```python
# backend/app/api/endpoints.py:17
def ingest_log(log: Log, session: Session = Depends(get_session)):
```
Clean session management with FastAPI dependencies

### 3. **Singleton Pattern**
```python
# backend/app/ml/anomaly_detector.py:43
detector = AnomalyDetector()
```
Global ML model instance for consistent predictions

### 4. **Real-Time Polling**
```javascript
// frontend/src/components/Dashboard.jsx:21
const interval = setInterval(fetchData, 5000);
```
5-second intervals for live dashboard updates

### 5. **Responsive Grid Layout**
```jsx
// frontend/src/components/Dashboard.jsx:49
<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
```
Mobile-first design with breakpoint optimization

---

## 📊 Data Flow Diagram

```
┌─────────────────┐
│  Security Event │
│   (Log Source)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              POST /api/v1/logs                          │
│              (endpoints.py:17-28)                       │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│         Background Task: analyze_log_task               │
│         (analysis.py:68-71)                             │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              AnalysisService.analyze_log                │
│              (analysis.py:12-58)                        │
│                                                          │
│  1. Feature Extraction (L17-19)                         │
│  2. ML Anomaly Detection (L21-29) ──► detector.predict  │
│  3. Rule-Based Analysis (L32-42)                        │
│  4. Risk Score Calculation (L24-42)                     │
│  5. Alert Creation if risk > 20 (L45-54)               │
│  6. SOAR Trigger if risk > 80 (L57-58)                 │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              Alert Stored in Database                   │
│              (models.py:21-29)                          │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│          GET /api/v1/dashboard/stats                    │
│          (dashboard.py:12-96)                           │
│                                                          │
│  • Aggregate alerts by entity_id (L18-19)              │
│  • Calculate metrics (L15-23)                           │
│  • Generate chart data (L26-39)                         │
│  • Format lists (L42-74)                                │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│         Frontend Dashboard Component                    │
│         (Dashboard.jsx:10-173)                          │
│                                                          │
│  • Fetch data via Axios (L10-17)                        │
│  • Poll every 5 seconds (L21)                           │
│  • Render visualizations (L63-110)                      │
│  • Display lists (L124-169)                             │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Risk Threshold Configuration

| Threshold | Value | Action | Code Location |
|-----------|-------|--------|---------------|
| **Alert Creation** | 20 | Generate alert | `analysis.py:45` |
| **SOAR Trigger** | 80 | Execute playbook | `analysis.py:58` |
| **Incident Escalation** | 50 | Correlate alerts | `correlation.py:27` |
| **Anomaly Detection** | -1 | Flag as anomaly | `anomaly_detector.py:23` |
| **High Risk User** | 50 | Dashboard highlight | `dashboard.py:18` |

---

## 🛠️ Technology Stack Summary

### Backend
| Technology | Version | Purpose | Files |
|------------|---------|---------|-------|
| FastAPI | Latest | Web framework | `main.py` |
| SQLModel | Latest | ORM + Pydantic | `models/models.py` |
| Scikit-learn | Latest | ML algorithms | `ml/anomaly_detector.py` |
| Uvicorn | Latest | ASGI server | - |
| SQLite | 3 | Database | `core/database.py` |

### Frontend
| Technology | Version | Purpose | Files |
|------------|---------|---------|-------|
| React | 19.2.0 | UI framework | `App.jsx` |
| Vite | 7.2.4 | Build tool | `vite.config.js` |
| TailwindCSS | 4.1.18 | Styling | `index.css` |
| Recharts | 3.7.0 | Visualizations | `Dashboard.jsx` |
| Axios | 1.13.2 | HTTP client | `Dashboard.jsx` |
| Lucide React | 0.563.0 | Icons | `Dashboard.jsx` |

---

## 📝 License

This project is for educational and demonstration purposes.

---

## 👥 Contributing

Contributions welcome! Key areas for enhancement:
- **Authentication**: User login implementation (`models.py:5-11`)
- **Threat Intel**: External feed integration (`analysis.py:41-42`)
- **Advanced Correlation**: Time-series analysis (`correlation.py`)
- **Custom Playbooks**: Dynamic SOAR rules (`soar.py`)
- **WebSocket**: Real-time alerts (`main.py`)

---

## 📞 Support

For issues or questions, please refer to the code reference guide above with specific line numbers.

**Quick Reference:**
- Main API: `backend/app/main.py`
- ML Engine: `backend/app/ml/anomaly_detector.py`
- Dashboard UI: `frontend/src/components/Dashboard.jsx`
- Risk Scoring: `backend/app/services/analysis.py:24-42`

---

**Built with ❤️ for Security Operations Centers**