from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.models import Alert, User, Log
from typing import Dict, Any, List
from datetime import datetime, timedelta
import json
import random

router = APIRouter()

@router.get("/stats", response_model=Dict[str, Any])
def get_dashboard_stats(session: Session = Depends(get_session)):
    """
    Get aggregated statistics for the dashboard from REAL DB DATA.
    """
    now = datetime.utcnow()
    one_hour_ago = now - timedelta(hours=1)
    one_day_ago = now - timedelta(days=1)

    # 1. Top Stats
    total_users = session.exec(select(User)).all()
    monitored_users = len(total_users)
    
    high_risk_alerts = session.exec(select(Alert).where(Alert.risk_score > 50)).all()
    high_risk_users_count = len(set(a.entity_id for a in high_risk_alerts))
    
    # Real Event Count (Last Hour)
    events_last_hour = len(session.exec(select(Log).where(Log.timestamp >= one_hour_ago)).all())
    
    # Real Offense Count (Last Hour)
    offenses_last_hour = len(session.exec(select(Alert).where(Alert.timestamp >= one_hour_ago)).all())

    # 2. Charts Data
    # System Score (Derived from recent risk)
    # We'll calculate a score for each hour of the last 24h
    system_score_data = []
    for i in range(24):
        start_time = now - timedelta(hours=24-i)
        end_time = start_time + timedelta(hours=1)
        
        # Get alerts in this window
        alerts_in_window = session.exec(select(Alert).where(
            Alert.timestamp >= start_time, 
            Alert.timestamp < end_time
        )).all()
        
        total_risk = sum(a.risk_score for a in alerts_in_window)
        # Base score 100, minus risk. Clamped at 0.
        # Visual scale: 0-100
        score = max(0, 100 - (total_risk / 10)) 
        
        time_label = start_time.strftime("%H:00")
        system_score_data.append({"time": time_label, "score": round(score, 1)})

    # Threat Types Distribution
    # Group alerts by title
    all_alerts = session.exec(select(Alert)).all()
    threat_counts = {}
    for alert in all_alerts:
        # Simplify title for grouping (e.g. "Port Scan Detected" -> "Port Scan")
        title = alert.title.split(":")[0] if ":" in alert.title else alert.title
        threat_counts[title] = threat_counts.get(title, 0) + 1
    
    threat_types = []
    colors = ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#10b981"]
    for i, (name, count) in enumerate(threat_counts.items()):
        threat_types.append({
            "name": name, 
            "count": count, 
            "color": colors[i % len(colors)]
        })
    
    if not threat_types:
        threat_types = [{"name": "No Threats", "count": 0, "color": "#10b981"}]

    # 3. Lists
    # High Risk Users
    high_risk_users = []
    user_risks = {}
    for alert in high_risk_alerts:
        user_risks[alert.entity_id] = user_risks.get(alert.entity_id, 0) + alert.risk_score
    
    sorted_users = sorted(user_risks.items(), key=lambda x: x[1], reverse=True)[:5]
    for uid, score in sorted_users:
        high_risk_users.append({"username": uid, "score": int(score)})

    # 1.5 Category Stats
    categories = ["security", "network", "application", "hardware"]
    category_stats = {cat: 0 for cat in categories}
    
    all_logs = session.exec(select(Log)).all()
    for log in all_logs:
        cat = log.category if log.category in categories else "security"
        category_stats[cat] += 1

    # Recent Offenses
    recent_offenses = []
    recent_alerts = session.exec(select(Alert).order_by(Alert.timestamp.desc()).limit(10)).all()
    for alert in recent_alerts:
        recent_offenses.append({
            "id": alert.id,
            "user": alert.entity_id,
            "title": alert.title,
            "risk_score": alert.risk_score,
            "category": "security", 
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
            "category": log.category,
            "event_type": log.event_type,
            "entity_id": log.entity_id,
            "status": "processed" if log.processed else "pending"
        })

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

    return {
        "stats": {
            "monitored_users": monitored_users,
            "high_risk_users": high_risk_users_count,
            "events_last_hour": events_last_hour,
            "offenses_last_hour": offenses_last_hour,
            "by_category": category_stats
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

@router.get("/network-stats", response_model=Dict[str, Any])
def get_network_stats(session: Session = Depends(get_session)):
    """
    Get real-time network statistics.
    """
    now = datetime.utcnow()
    # 1. Traffic Volume (Last 24h)
    traffic_data = []
    for i in range(12): # 2-hour intervals
        start_time = now - timedelta(hours=(12-i)*2)
        end_time = start_time + timedelta(hours=2)
        
        logs = session.exec(select(Log).where(
            Log.category == "network",
            Log.timestamp >= start_time,
            Log.timestamp < end_time
        )).all()
        
        inbound = 0
        outbound = 0
        for log in logs:
            try:
                data = json.loads(log.raw_data)
                inbound += data.get("bytes_in", 0)
                outbound += data.get("bytes_out", 0)
            except:
                pass
                
        time_label = start_time.strftime("%H:%M")
        # Convert to MB for display
        traffic_data.append({
            "time": time_label, 
            "inbound": round(inbound / 1024 / 1024, 2), 
            "outbound": round(outbound / 1024 / 1024, 2)
        })

    # 2. Top Ports
    port_counts = {}
    recent_network_logs = session.exec(select(Log).where(Log.category == "network").limit(1000)).all()
    for log in recent_network_logs:
        try:
            data = json.loads(log.raw_data)
            port = data.get("dest_port") or data.get("port")
            if port:
                port_counts[port] = port_counts.get(port, 0) + 1
        except:
            pass
            
    top_ports = []
    colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']
    sorted_ports = sorted(port_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    
    for i, (port, count) in enumerate(sorted_ports):
        top_ports.append({
            "name": f"Port {port}",
            "count": count,
            "color": colors[i % len(colors)]
        })

    return {
        "traffic_data": traffic_data,
        "top_ports": top_ports
    }

@router.get("/hardware-stats", response_model=Dict[str, Any])
def get_hardware_stats(session: Session = Depends(get_session)):
    """
    Get real-time hardware statistics.
    """
    now = datetime.utcnow()
    
    # 1. Temp Trend (Last 12h)
    temp_data = []
    for i in range(12):
        start_time = now - timedelta(hours=12-i)
        end_time = start_time + timedelta(hours=1)
        
        logs = session.exec(select(Log).where(
            Log.category == "hardware",
            Log.timestamp >= start_time,
            Log.timestamp < end_time
        )).all()
        
        temps = []
        for log in logs:
            try:
                data = json.loads(log.raw_data)
                if "temp" in data:
                    temps.append(data["temp"])
            except:
                pass
        
        avg_temp = sum(temps) / len(temps) if temps else 0
        time_label = start_time.strftime("%H:%M")
        temp_data.append({"time": time_label, "temp": int(avg_temp)})

    # 2. Rack Status
    # We'll infer status from the latest log for each rack
    racks = {}
    # Get recent hardware logs
    hw_logs = session.exec(select(Log).where(Log.category == "hardware").order_by(Log.timestamp.desc()).limit(100)).all()
    
    for log in hw_logs:
        rack_id = log.entity_id
        if rack_id not in racks:
            try:
                data = json.loads(log.raw_data)
                temp = data.get("temp", 0)
                load = data.get("cpu_load", 0)
                
                status = "optimal"
                if temp > 80 or load > 90:
                    status = "critical"
                elif temp > 60 or load > 70:
                    status = "warning"
                    
                racks[rack_id] = {
                    "id": rack_id,
                    "status": status,
                    "load": load,
                    "temp": temp
                }
            except:
                pass
                
    return {
        "temp_data": temp_data,
        "racks": list(racks.values())[:6] # Limit to 6 racks
    }

@router.get("/app-stats", response_model=Dict[str, Any])
def get_app_stats(session: Session = Depends(get_session)):
    """
    Get real-time application security statistics.
    """
    now = datetime.utcnow()
    
    # 1. Request Volume (Last 24h)
    request_data = []
    for i in range(24):
        start_time = now - timedelta(hours=24-i)
        end_time = start_time + timedelta(hours=1)
        
        count = len(session.exec(select(Log).where(
            Log.category == "application",
            Log.timestamp >= start_time,
            Log.timestamp < end_time
        )).all())
        
        time_label = start_time.strftime("%H:00")
        request_data.append({"time": time_label, "requests": count})

    # 2. Top Active Users
    user_activity = {}
    recent_app_logs = session.exec(select(Log).where(Log.category == "application").limit(1000)).all()
    
    error_count = 0
    total_requests = len(recent_app_logs)
    
    for log in recent_app_logs:
        user = log.entity_id
        user_activity[user] = user_activity.get(user, 0) + 1
        
        try:
            data = json.loads(log.raw_data)
            if data.get("status_code", 200) >= 500:
                error_count += 1
        except:
            pass
            
    top_users = []
    sorted_users = sorted(user_activity.items(), key=lambda x: x[1], reverse=True)[:5]
    for user, count in sorted_users:
        top_users.append({"name": user, "requests": count})

    # 3. Recent App Alerts (SQLi, etc.)
    app_alerts = []
    # Alert model doesn't have category, so we fetch recent high risks
    alerts = session.exec(select(Alert).order_by(Alert.timestamp.desc()).limit(20)).all()
    
    for alert in alerts:
        # Simple heuristic to filter for app-related alerts
        # In a real app, we'd add a category column to Alert
        is_app = False
        if "SQL" in alert.title or "SQL" in alert.description:
            is_app = True
        elif "Application" in alert.title or "Application" in alert.description:
            is_app = True
        elif "http" in alert.description.lower():
            is_app = True
            
        if is_app:
            app_alerts.append({
                "id": alert.id,
                "title": alert.title,
                "risk": alert.risk_score,
                "time": alert.timestamp.strftime("%H:%M")
            })
            
        if len(app_alerts) >= 10:
            break

    return {
        "request_data": request_data,
        "top_users": top_users,
        "error_rate": round((error_count / total_requests * 100) if total_requests > 0 else 0, 2),
        "total_requests": total_requests,
        "app_alerts": app_alerts
    }
