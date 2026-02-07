# Titan-SIEM SIEM: Feature & Capability Reference

## 🛡️ System Overview
Titan-SIEM is an advanced Security Information and Event Management (SIEM) platform designed for real-time threat detection, AI-powered anomaly analysis, and automated incident response.

---

## 🚀 Core Features

### 1. Log Ingestion & Management
- **High-Throughput API**: Fast ingestion of logs via `POST /api/v1/logs`.
- **Async Processing**: Logs are processed in the background to ensure API responsiveness.
- **Structured Storage**: All events are stored in a SQLite database with full metadata.

### 2. AI-Powered Anomaly Detection
- **Algorithm**: Isolation Forest (Unsupervised Learning).
- **Behavior**: Automatically detects statistical outliers in user behavior (e.g., unusual login times, location changes).
- **Scoring**: Assigns an anomaly score to every event; high scores contribute to the overall Risk Score.

### 3. Real-Time Visualization
- **Web Dashboard**: React-based UI with live charts, risk breakdowns, and user monitoring.
- **TUI Dashboard**: Terminal-based dashboard (`tui_dashboard.py`) for command-line monitoring.
- **Metrics**: Tracks events per hour, high-risk users, and system health score.

---

## 🧠 Advanced Security Intelligence

### 1. Modular Rule Engine
The system employs a dynamic rule engine with the following active detection rules:

| Rule Name | Description | Risk Score |
|-----------|-------------|------------|
| **Brute Force Detection** | Detects 5+ failed login attempts within 5 minutes. | 40.0 (+5/fail) |
| **Impossible Travel / VPN** | Identifies VPN usage or geographically impossible travel. | 20.0 |
| **Malicious IP** | Checks communication against known malicious IP lists. | 80.0 |
| **Critical Process Tampering** | Detects stopping/killing of critical processes (firewall, antivirus). | 70.0 |
| **Admin Privilege Grant** | Alerts when a user is added to an admin/root group. | 60.0 |
| **Lateral Movement** | Detects a user accessing 3+ different endpoints in 10 minutes. | 60.0 (+10/host) |
| **Data Exfiltration** | Flags data transfers exceeding 100MB. | 75.0 |
| **Port Scan (Network)** | Detects connection attempts to 5+ ports on one host. | 50.0 (+5/port) |
| **DDoS Pattern (Network)** | Detects >100 requests from a single IP in 1 minute. | 85.0 |
| **SQL Injection (App)** | Detects SQLi patterns like `' OR 1=1` or `DROP TABLE`. | 90.0 |
| **Error Rate Spike (App)** | Detects >10 HTTP 500 errors in 1 minute. | 45.0 |
| **High Temp (Hardware)** | Alerts if device temperature > 80°C. | 70.0 |
| **Disk Failure (Hardware)** | Detects SMART errors or disk full events. | 80.0 |

### 2. Contextual Risk Scoring
Risk scores are not static; they adapt based on context:
- **Admin User Boost**: Risk score **x1.5** if the user has `admin` role.
- **Critical Asset Boost**: Risk score **x1.2** if the source is a critical asset (e.g., Payment Gateway).
- **Threat Intel Match**: Adds **+90** to risk score if IP matches the threat feed.

### 3. Threat Intelligence
- **Integrated Feed**: Checks IPs and File Hashes against a local threat database.
- **Coverage**: Includes known C2 servers, botnet nodes, and phishing sources.

---

## 🤖 Automated Response (SOAR)

The SOAR engine automatically executes playbooks based on the type and severity of the threat:

| Trigger Condition | Playbook Name | Action Taken |
|-------------------|---------------|--------------|
| **Threat Intel Match** | `Block IP` | Logs firewall block request for the malicious IP. |
| **Lateral Movement** | `Isolate Endpoint` | Logs EDR request to isolate the compromised host. |
| **Critical Risk (>80)** | `Disable User` | Sets `User.is_active = False` in the database, effectively locking the account. |

---

## 📝 Logging & Auditing

### System Logs
- **Location**: `logs/siem.log`
- **Format**: `YYYY-MM-DD HH:MM:SS - LOGGER_NAME - LEVEL - FILE:LINE - MESSAGE`
- **Levels**: INFO, WARNING, ERROR, DEBUG.

### What is Logged?
1.  **API Requests**: Ingested logs and their sources.
2.  **Analysis Steps**: Detailed breakdown of rule evaluations and ML scores.
3.  **Rule Triggers**: Specific rules that fired and their contribution to risk.
4.  **SOAR Actions**: Audit trail of all automated responses (Blocking, Disabling, Isolating).
5.  **Errors**: Full stack traces for debugging.

---

## 📂 Project Structure
- `backend/app/services/rules.py`: Rule definitions.
- `backend/app/services/analysis.py`: Core analysis logic.
- `backend/app/services/soar.py`: Automated response engine.
- `backend/app/core/logging.py`: Logging configuration.
- `logs/`: Directory containing system logs.
