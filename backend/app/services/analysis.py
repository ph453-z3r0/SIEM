from sqlmodel import Session, select
from app.models.models import Log, Alert, User
from app.ml.anomaly_detector import detector
from datetime import datetime
import json
import numpy as np

class AnalysisService:
    def __init__(self, session: Session):
        self.session = session

    def analyze_log(self, log_id: int):
        log = self.session.get(Log, log_id)
        if not log:
            return

        # 1. Feature Extraction (Mock for now)
        # In real app, parse raw_data to get features
        features = np.array([[datetime.utcnow().hour, 1, 1]]) 
        
        # 2. Anomaly Detection
        anomaly_score = detector.score_samples(features)
        is_anomaly = detector.predict(features) == -1

        risk_score = 0.0
        reasons = []

        if is_anomaly:
            risk_score += 50.0
            reasons.append(f"Behavioral Anomaly Detected (Score: {anomaly_score:.2f})")

        # 3. Rule-based Detection
        if log.event_type == "login" and "vpn" in log.raw_data.lower():
            # Check for "Impossible Travel" or "New Location" (Mock)
            risk_score += 20.0
            reasons.append("VPN Access from new location")

        if "failed" in log.raw_data.lower():
             risk_score += 10.0
             reasons.append("Failed operation detected")

        # 4. Threat Intel (Mock)
        # if log.ip in threat_intel_feed: risk_score += 80

        # 5. Create Alert if Risk > Threshold
        if risk_score > 20:
            alert = Alert(
                risk_score=risk_score,
                title=f"High Risk Event: {log.event_type}",
                description="; ".join(reasons),
                entity_id=log.entity_id,
                confidence_score=0.8, # Mock
                status="new"
            )
            self.session.add(alert)
            self.session.commit()
            
            # Trigger SOAR if critical
            if risk_score > 80:
                self.trigger_soar(alert)

    def trigger_soar(self, alert: Alert):
        # Mock SOAR execution
        alert.playbook_executed = "Block IP & Disable User"
        self.session.add(alert)
        self.session.commit()
        print(f"SOAR TRIGGERED: {alert.playbook_executed} for Alert {alert.id}")

def analyze_log_task(log_id: int, session_factory):
    with session_factory() as session:
        service = AnalysisService(session)
        service.analyze_log(log_id)
