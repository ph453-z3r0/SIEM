from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.models import Alert, User, Log
from typing import Dict, Any, List
from datetime import datetime, timedelta
import random

router = APIRouter()

@router.get("/stats", response_model=Dict[str, Any])
def get_dashboard_stats(session: Session = Depends(get_session)):
    """
    Get aggregated statistics for the dashboard.
    """
    # 1. Top Stats
    total_users = session.exec(select(User)).all()
    monitored_users = len(total_users) if total_users else 3600 # Mock if empty
    
    high_risk_alerts = session.exec(select(Alert).where(Alert.risk_score > 50)).all()
    high_risk_users_count = len(set(a.entity_id for a in high_risk_alerts))
    
    # Mocking high volume data for demo visual
    events_last_hour = 778900 + random.randint(0, 1000) 
    offenses_last_hour = len(session.exec(select(Alert)).all())

    # 2. Charts Data
    # System Score (Mock trend)
    system_score_data = []
    now = datetime.utcnow()
    for i in range(24):
        time_label = (now - timedelta(hours=23-i)).strftime("%H:00")
        score = 2000000 + (i * 100000) + random.randint(-50000, 50000)
        system_score_data.append({"time": time_label, "score": score})

    # Threat Types Distribution (for bar chart)
    threat_types = [
        {"name": "Malware", "count": random.randint(50, 150), "color": "#ef4444"},
        {"name": "Phishing", "count": random.randint(30, 100), "color": "#f59e0b"},
        {"name": "Brute Force", "count": random.randint(20, 80), "color": "#3b82f6"},
        {"name": "Data Exfil", "count": random.randint(10, 50), "color": "#8b5cf6"},
        {"name": "Anomalous", "count": random.randint(15, 60), "color": "#10b981"},
    ]

    # 3. Lists
    # High Risk Users
    high_risk_users = []
    # Aggregate risk by user
    user_risks = {}
    for alert in high_risk_alerts:
        user_risks[alert.entity_id] = user_risks.get(alert.entity_id, 0) + alert.risk_score
    
    sorted_users = sorted(user_risks.items(), key=lambda x: x[1], reverse=True)[:5]
    for uid, score in sorted_users:
        high_risk_users.append({"username": uid, "score": int(score * 1000)}) # Scale up for visual

    if not high_risk_users: # Mock if empty
        high_risk_users = [
            {"username": "QDI", "score": 362344},
            {"username": "admin", "score": 64146},
            {"username": "jimmy", "score": 54980},
            {"username": "matt@google.com", "score": 54888},
            {"username": "UBA", "score": 23807},
        ]

    # Recent Offenses
    recent_offenses = []
    recent_alerts = session.exec(select(Alert).order_by(Alert.timestamp.desc()).limit(5)).all()
    for alert in recent_alerts:
        recent_offenses.append({
            "id": alert.id,
            "user": alert.entity_id,
            "event_count": random.randint(100, 500), # Mock
            "magnitude": int(alert.risk_score / 10),
            "time": alert.timestamp.strftime("%H:%M")
        })

    # Live Logs
    live_logs = []
    recent_logs = session.exec(select(Log).order_by(Log.timestamp.desc()).limit(10)).all()
    for log in recent_logs:
        live_logs.append({
            "id": log.id,
            "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "source": log.source,
            "event_type": log.event_type,
            "entity_id": log.entity_id,
            "status": "processed" if log.processed else "pending"
        })

    # Mock logs if empty
    if not live_logs:
        live_logs = [
            {"id": i, "timestamp": (now - timedelta(minutes=i)).strftime("%Y-%m-%d %H:%M:%S"),
             "source": random.choice(["firewall", "ad", "endpoint"]),
             "event_type": random.choice(["login", "file_access", "network"]),
             "entity_id": f"user{random.randint(1, 100)}",
             "status": random.choice(["processed", "pending"])
            } for i in range(1, 11)
        ]

    # Anomalies
    anomalies = []
    anomaly_alerts = session.exec(select(Alert).where(Alert.risk_score > 50).order_by(Alert.timestamp.desc()).limit(8)).all()
    for alert in anomaly_alerts:
        anomalies.append({
            "id": alert.id,
            "timestamp": alert.timestamp.strftime("%H:%M:%S"),
            "entity_id": alert.entity_id,
            "risk_score": round(alert.risk_score, 1),
            "title": alert.title,
            "status": alert.status
        })

    # Mock anomalies if empty
    if not anomalies:
        anomalies = [
            {
                "id": i,
                "timestamp": (now - timedelta(minutes=i*3)).strftime("%H:%M:%S"),
                "entity_id": random.choice(["admin", "user123", "system", "developer"]),
                "risk_score": round(random.uniform(50, 95), 1),
                "title": random.choice(["Unusual Login Pattern", "High Privilege Access", "Data Transfer Spike", "Suspicious Network Activity"]),
                "status": random.choice(["new", "investigating"])
            } for i in range(1, 9)
        ]

    return {
        "stats": {
            "monitored_users": monitored_users,
            "high_risk_users": high_risk_users_count if high_risk_users_count > 0 else 3500, # Mock default
            "events_last_hour": events_last_hour,
            "offenses_last_hour": offenses_last_hour if offenses_last_hour > 0 else 606
        },
        "charts": {
            "system_score": system_score_data,
            "threat_types": threat_types
        },
        "lists": {
            "high_risk_users": high_risk_users,
            "recent_offenses": recent_offenses,
            "live_logs": live_logs,
            "anomalies": anomalies
        }
    }
