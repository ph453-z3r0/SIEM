from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True)
    email: str
    hashed_password: str
    role: str = "analyst" # analyst, admin
    is_active: bool = True

class Log(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    source: str # firewall, ad, endpoint
    category: str = "security" # security, network, application, hardware
    event_type: str # login, file_access, process_start
    entity_id: str = Field(index=True) # user_id or ip_address
    raw_data: str # JSON string
    processed: bool = False

class Alert(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    risk_score: float
    title: str
    description: str
    status: str = "new" # new, investigating, resolved
    entity_id: str
    confidence_score: float
    playbook_executed: Optional[str] = None

class Playbook(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    risk_level: str # low, medium, high, critical
    action_script: str # function name to call
    is_active: bool = True
