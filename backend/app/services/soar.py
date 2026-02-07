from sqlmodel import Session, select
from app.models.models import Alert, Playbook, User
from app.core.logging import logger

class SOAREngine:
    def __init__(self, session: Session):
        self.session = session

    def execute_playbook(self, alert: Alert, playbook_name: str):
        """
        Execute a defined playbook.
        """
        logger.warning(f"EXECUTING PLAYBOOK: {playbook_name} for Alert {alert.id}")
        
        if playbook_name == "Block IP":
            self._block_ip(alert.entity_id)
        elif playbook_name == "Disable User":
            self._disable_user(alert.entity_id)
        elif playbook_name == "Isolate Endpoint":
            self._isolate_endpoint(alert.entity_id)
            
        alert.playbook_executed = playbook_name
        alert.status = "resolved"
        self.session.add(alert)
        self.session.commit()

    def _block_ip(self, ip: str):
        # Mock Firewall Call
        logger.info(f"FIREWALL ACTION: Blocking IP {ip}")
        # In a real system, this would call a firewall API

    def _disable_user(self, username: str):
        # Mock IAM Call
        logger.info(f"IAM ACTION: Disabling User {username}")
        
        # Update User in DB if exists
        statement = select(User).where(User.username == username)
        user = self.session.exec(statement).first()
        if user:
            user.is_active = False
            self.session.add(user)
            self.session.commit()
            logger.info(f"User {username} disabled in local database.")
        else:
            logger.warning(f"User {username} not found in local database.")

    def _isolate_endpoint(self, entity_id: str):
        # Mock EDR Call
        logger.info(f"EDR ACTION: Isolating Endpoint {entity_id}")
