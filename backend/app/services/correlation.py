from sqlmodel import Session, select
from app.models.models import Alert
from datetime import datetime, timedelta

class CorrelationService:
    def __init__(self, session: Session):
        self.session = session

    def correlate_alerts(self):
        """
        Group alerts by entity_id within a time window.
        """
        # Find recent alerts that are not yet resolved
        statement = select(Alert).where(Alert.status == "new")
        alerts = self.session.exec(statement).all()
        
        # Simple correlation: Group by Entity ID
        grouped_alerts = {}
        for alert in alerts:
            if alert.entity_id not in grouped_alerts:
                grouped_alerts[alert.entity_id] = []
            grouped_alerts[alert.entity_id].append(alert)
            
        for entity_id, entity_alerts in grouped_alerts.items():
            if len(entity_alerts) > 1:
                print(f"CORRELATION FOUND: {len(entity_alerts)} alerts for {entity_id}")
                # In a real system, we would create an 'Incident' object here
                # For now, we just log it and maybe upgrade severity
                
                # Example: If multiple low alerts, upgrade to High
                total_risk = sum(a.risk_score for a in entity_alerts)
                if total_risk > 50:
                    print(f"ESCALATING INCIDENT for {entity_id} (Total Risk: {total_risk})")
