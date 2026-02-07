from sqlmodel import Session, select
from app.models.models import Log, Alert, User
from app.ml.anomaly_detector import detector
from app.services.rules import ALL_RULES
from app.core.logging import logger
from app.services.threat_intel import threat_intel
from app.services.soar import SOAREngine
from datetime import datetime
import json
import numpy as np
import traceback

class AnalysisService:
    def __init__(self, session: Session):
        self.session = session
        self.soar_engine = SOAREngine(session)

    def analyze_log(self, log_id: int):
        logger.info(f"Starting analysis for Log ID: {log_id}")
        log = self.session.get(Log, log_id)
        if not log:
            logger.warning(f"Log ID {log_id} not found.")
            return

        try:
            # Parse raw data
            try:
                parsed_data = json.loads(log.raw_data)
            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON for Log ID {log_id}")
                parsed_data = {}

            risk_score = 0.0
            reasons = []

            # 0. Context Injection
            user_context = None
            if log.entity_id:
                user_context = self.session.exec(select(User).where(User.username == log.entity_id)).first()

            # 1. Feature Extraction (Mock for now)
            features = np.array([[datetime.utcnow().hour, 1, 1]]) 
            
            # 2. Anomaly Detection
            try:
                anomaly_score = detector.score_samples(features)
                is_anomaly = detector.predict(features) == -1

                if is_anomaly:
                    risk_score += 50.0
                    reasons.append(f"Behavioral Anomaly Detected (Score: {anomaly_score:.2f})")
            except Exception as e:
                logger.error(f"ML Anomaly Detection failed: {e}")

            # 3. Rule-based Detection
            for rule in ALL_RULES:
                try:
                    triggered, score, reason = rule.evaluate(log, self.session, parsed_data)
                    if triggered:
                        risk_score += score
                        reasons.append(reason)
                        logger.info(f"Rule triggered: {rule.name} for Log {log_id}")
                except Exception as e:
                    logger.error(f"Error evaluating rule {rule.name}: {e}")

            # 4. Threat Intel
            ip = parsed_data.get("ip") or parsed_data.get("source_ip")
            if ip:
                threat = threat_intel.check_ip(ip)
                if threat:
                    risk_score += 90.0
                    reasons.append(f"Threat Intel Match: {threat} ({ip})")

            # 5. Contextual Risk Boosting
            if user_context and user_context.role == "admin":
                risk_score *= 1.5
                reasons.append("Risk Score Boosted: Admin User")
            
            # Mock Critical Asset Check
            if log.source == "payment_gateway":
                risk_score *= 1.2
                reasons.append("Risk Score Boosted: Critical Asset (Payment Gateway)")

            logger.info(f"Analysis complete. Total Risk Score: {risk_score}")

            # 6. Create Alert if Risk > Threshold
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
                logger.warning(f"Alert created: {alert.title} (ID: {alert.id})")
                
                # Trigger SOAR if critical
                if risk_score > 80:
                    self.trigger_soar(alert)
            
            # Mark log as processed
            log.processed = True
            self.session.add(log)
            self.session.commit()

        except Exception as e:
            logger.error(f"Critical error in analyze_log: {e}")
            traceback.print_exc()

    def trigger_soar(self, alert: Alert):
        # Determine playbook based on alert context
        playbook = "Disable User" # Default
        
        if "Threat Intel Match" in alert.description:
            playbook = "Block IP"
        elif "Lateral Movement" in alert.description:
            playbook = "Isolate Endpoint"
            
        self.soar_engine.execute_playbook(alert, playbook)

def analyze_log_task(log_id: int, session_factory):
    with session_factory() as session:
        service = AnalysisService(session)
        service.analyze_log(log_id)
