from sqlmodel import Session
from app.models.models import Alert, Playbook

class SOAREngine:
    def __init__(self, session: Session):
        self.session = session

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
        self.session.add(alert)
        self.session.commit()

    def _block_ip(self, ip: str):
        # Mock Firewall Call
        print(f"FIREWALL: Blocking IP {ip}")

    def _disable_user(self, username: str):
        # Mock IAM Call
        print(f"IAM: Disabling User {username}")
