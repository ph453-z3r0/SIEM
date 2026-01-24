from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session
from app.core.database import get_session
from app.models.models import Log, Alert
from typing import List
import json

router = APIRouter()

from app.services.analysis import analyze_log_task
from app.core.database import engine
from sqlmodel import Session as SQLSession

def get_session_factory():
    return lambda: SQLSession(engine)

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

@router.get("/alerts", response_model=List[Alert])
def read_alerts(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    return session.query(Alert).offset(skip).limit(limit).all()

@router.get("/logs", response_model=List[Log])
def read_logs(skip: int = 0, limit: int = 50, session: Session = Depends(get_session)):
    return session.query(Log).order_by(Log.timestamp.desc()).offset(skip).limit(limit).all()
