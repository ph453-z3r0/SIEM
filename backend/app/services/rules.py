from abc import ABC, abstractmethod
from typing import List, Optional, Tuple
from sqlmodel import Session, select
from app.models.models import Log
from datetime import datetime, timedelta
import json
from app.core.logging import logger

class BaseRule(ABC):
    def __init__(self, name: str, description: str, risk_score: float):
        self.name = name
        self.description = description
        self.base_risk_score = risk_score

    @abstractmethod
    def evaluate(self, log: Log, session: Session, parsed_data: dict) -> Tuple[bool, float, str]:
        """
        Evaluate the rule against a log entry.
        Returns: (is_triggered, risk_score, reason)
        """
        pass

class BruteForceRule(BaseRule):
    def __init__(self):
        super().__init__(
            name="Brute Force Detection",
            description="Detects multiple failed login attempts within a short period",
            risk_score=40.0
        )

    def evaluate(self, log: Log, session: Session, parsed_data: dict) -> Tuple[bool, float, str]:
        if log.event_type != "login" or "failed" not in str(parsed_data.get("status", "")).lower():
            return False, 0.0, ""

        # Check for previous failed logins in the last 5 minutes
        five_mins_ago = log.timestamp - timedelta(minutes=5)
        statement = select(Log).where(
            Log.entity_id == log.entity_id,
            Log.event_type == "login",
            Log.timestamp >= five_mins_ago,
            Log.id != log.id
        )
        recent_logs = session.exec(statement).all()
        
        failed_count = 1 # Current one
        for l in recent_logs:
            try:
                data = json.loads(l.raw_data)
                if "failed" in str(data.get("status", "")).lower():
                    failed_count += 1
            except:
                continue

        if failed_count >= 5:
            return True, self.base_risk_score + (failed_count * 5), f"Brute Force: {failed_count} failed logins in 5 mins"
        
        return False, 0.0, ""

class ImpossibleTravelRule(BaseRule):
    def __init__(self):
        super().__init__(
            name="Impossible Travel / VPN",
            description="Detects VPN usage or impossible travel patterns",
            risk_score=20.0
        )

    def evaluate(self, log: Log, session: Session, parsed_data: dict) -> Tuple[bool, float, str]:
        # Mock logic: check for 'vpn' keyword or specific flag
        if "vpn" in log.raw_data.lower() or parsed_data.get("is_vpn", False):
            return True, self.base_risk_score, "VPN Access detected"
        return False, 0.0, ""

class MaliciousIPRule(BaseRule):
    def __init__(self):
        super().__init__(
            name="Malicious IP Communication",
            description="Detects communication with known malicious IPs",
            risk_score=80.0
        )
        self.malicious_ips = ["1.1.1.1", "bad.ip.address", "192.168.1.100"] # Mock list

    def evaluate(self, log: Log, session: Session, parsed_data: dict) -> Tuple[bool, float, str]:
        ip = parsed_data.get("ip") or parsed_data.get("source_ip")
        if ip and ip in self.malicious_ips:
            return True, self.base_risk_score, f"Communication with malicious IP: {ip}"
        return False, 0.0, ""

class CriticalProcessRule(BaseRule):
    def __init__(self):
        super().__init__(
            name="Critical Process Tampering",
            description="Detects stopping or modification of critical system processes",
            risk_score=70.0
        )
        self.critical_processes = ["firewall.exe", "antivirus.exe", "sshd"]

    def evaluate(self, log: Log, session: Session, parsed_data: dict) -> Tuple[bool, float, str]:
        action = parsed_data.get("action", "").lower()
        process = parsed_data.get("process", "").lower()
        
        if action in ["stop", "kill", "terminate", "modify"]:
            if any(cp in process for cp in self.critical_processes):
                return True, self.base_risk_score, f"Critical process {action}: {process}"
        return False, 0.0, ""

class AdminPrivilegeGrantRule(BaseRule):
    def __init__(self):
        super().__init__(
            name="Admin Privilege Grant",
            description="Detects when a user is added to an admin group",
            risk_score=60.0
        )

    def evaluate(self, log: Log, session: Session, parsed_data: dict) -> Tuple[bool, float, str]:
        action = parsed_data.get("action", "").lower()
        group = parsed_data.get("group", "").lower()
        
        if "add" in action and ("admin" in group or "wheel" in group or "root" in group):
            return True, self.base_risk_score, f"User added to privileged group: {group}"
        return False, 0.0, ""

class LateralMovementRule(BaseRule):
    def __init__(self):
        super().__init__(
            name="Lateral Movement",
            description="Detects sequential logins across different entities by the same user",
            risk_score=60.0
        )

    def evaluate(self, log: Log, session: Session, parsed_data: dict) -> Tuple[bool, float, str]:
        if log.event_type != "login":
            return False, 0.0, ""
        
        user_id = log.entity_id
        # Check for logins by this user on DIFFERENT sources/ips in the last 10 minutes
        ten_mins_ago = log.timestamp - timedelta(minutes=10)
        
        # We need to find logs where entity_id is the same (same user) but source or raw_data['ip'] is different
        # For simplicity in this mock, we'll assume 'source' represents the machine/endpoint
        
        statement = select(Log).where(
            Log.entity_id == user_id,
            Log.event_type == "login",
            Log.timestamp >= ten_mins_ago,
            Log.id != log.id
        )
        recent_logs = session.exec(statement).all()
        
        visited_sources = set()
        visited_sources.add(log.source)
        
        for l in recent_logs:
            visited_sources.add(l.source)
            
        if len(visited_sources) >= 3:
            return True, self.base_risk_score + (len(visited_sources) * 10), f"Lateral Movement: User accessed {len(visited_sources)} different sources in 10 mins"
            
        return False, 0.0, ""

class DataExfiltrationRule(BaseRule):
    def __init__(self):
        super().__init__(
            name="Data Exfiltration",
            description="Detects high-volume data transfer events",
            risk_score=75.0
        )

    def evaluate(self, log: Log, session: Session, parsed_data: dict) -> Tuple[bool, float, str]:
        # Check for 'bytes_out' or similar field
        bytes_out = parsed_data.get("bytes_out", 0)
        try:
            bytes_out = int(bytes_out)
        except:
            bytes_out = 0
            
        if bytes_out > 100_000_000: # 100 MB
            return True, self.base_risk_score, f"High Data Transfer Detected: {bytes_out/1_000_000:.2f} MB"
            
        return False, 0.0, ""

class PortScanRule(BaseRule):
    def __init__(self):
        super().__init__(
            name="Port Scan Detected",
            description="Detects connection attempts to multiple ports on the same host",
            risk_score=50.0
        )

    def evaluate(self, log: Log, session: Session, parsed_data: dict) -> Tuple[bool, float, str]:
        if log.category != "network":
            return False, 0.0, ""
        
        target_ip = parsed_data.get("dest_ip") or parsed_data.get("target_ip")
        port = parsed_data.get("dest_port") or parsed_data.get("port")
        
        if not target_ip or not port:
            return False, 0.0, ""

        # Check for multiple ports on same target in last minute
        one_min_ago = log.timestamp - timedelta(minutes=1)
        statement = select(Log).where(
            Log.category == "network",
            Log.timestamp >= one_min_ago,
            Log.id != log.id
        )
        recent_logs = session.exec(statement).all()
        
        ports = set()
        ports.add(port)
        
        for l in recent_logs:
            try:
                data = json.loads(l.raw_data)
                l_target = data.get("dest_ip") or data.get("target_ip")
                l_port = data.get("dest_port") or data.get("port")
                if l_target == target_ip and l_port:
                    ports.add(l_port)
            except:
                continue
                
        if len(ports) >= 5:
            return True, self.base_risk_score + (len(ports) * 5), f"Port Scan: {len(ports)} distinct ports targeted on {target_ip}"
            
        return False, 0.0, ""

class DDoSRule(BaseRule):
    def __init__(self):
        super().__init__(
            name="DDoS Pattern Detected",
            description="Detects high volume of requests from a single IP",
            risk_score=85.0
        )

    def evaluate(self, log: Log, session: Session, parsed_data: dict) -> Tuple[bool, float, str]:
        if log.category != "network":
            return False, 0.0, ""
            
        source_ip = parsed_data.get("source_ip") or parsed_data.get("src_ip")
        if not source_ip:
            return False, 0.0, ""
            
        # Simple count check in last minute
        one_min_ago = log.timestamp - timedelta(minutes=1)
        statement = select(Log).where(
            Log.category == "network",
            Log.timestamp >= one_min_ago,
            Log.entity_id == log.entity_id # Assuming entity_id is source_ip for network logs
        )
        # Note: In real DB, count() is faster. Here we fetch all (mock limitation)
        count = len(session.exec(statement).all())
        
        if count > 100: # Threshold lowered for demo
            return True, self.base_risk_score, f"DDoS Pattern: {count} requests from {source_ip} in 1 min"
            
        return False, 0.0, ""

class SQLInjectionRule(BaseRule):
    def __init__(self):
        super().__init__(
            name="SQL Injection Attempt",
            description="Detects common SQL injection patterns in input",
            risk_score=90.0
        )
        self.patterns = ["' OR 1=1", "UNION SELECT", "--", "/*", "DROP TABLE"]

    def evaluate(self, log: Log, session: Session, parsed_data: dict) -> Tuple[bool, float, str]:
        if log.category != "application":
            return False, 0.0, ""
            
        query = parsed_data.get("query", "") or parsed_data.get("input", "") or str(parsed_data)
        query_upper = query.upper()
        
        for pattern in self.patterns:
            if pattern in query_upper:
                return True, self.base_risk_score, f"SQL Injection detected: {pattern}"
                
        return False, 0.0, ""

class ErrorRateSpikeRule(BaseRule):
    def __init__(self):
        super().__init__(
            name="Error Rate Spike",
            description="Detects high frequency of application errors",
            risk_score=45.0
        )

    def evaluate(self, log: Log, session: Session, parsed_data: dict) -> Tuple[bool, float, str]:
        if log.category != "application":
            return False, 0.0, ""
            
        status = parsed_data.get("status_code") or parsed_data.get("status")
        if str(status) != "500":
            return False, 0.0, ""
            
        # Check for other 500s
        one_min_ago = log.timestamp - timedelta(minutes=1)
        statement = select(Log).where(
            Log.category == "application",
            Log.timestamp >= one_min_ago
        )
        recent_logs = session.exec(statement).all()
        
        error_count = 0
        for l in recent_logs:
            if "500" in l.raw_data:
                error_count += 1
                
        if error_count >= 10:
            return True, self.base_risk_score, f"Application Stability Risk: {error_count} errors in 1 min"
            
        return False, 0.0, ""

class HighTempRule(BaseRule):
    def __init__(self):
        super().__init__(
            name="Hardware Overheating",
            description="Detects critical temperature levels in hardware",
            risk_score=70.0
        )

    def evaluate(self, log: Log, session: Session, parsed_data: dict) -> Tuple[bool, float, str]:
        if log.category != "hardware":
            return False, 0.0, ""
            
        temp = parsed_data.get("temp") or parsed_data.get("temperature")
        if temp and int(temp) > 80:
            return True, self.base_risk_score, f"Critical Temperature: {temp}°C"
            
        return False, 0.0, ""

class DiskFailureRule(BaseRule):
    def __init__(self):
        super().__init__(
            name="Disk Failure Risk",
            description="Detects SMART errors or disk full events",
            risk_score=80.0
        )

    def evaluate(self, log: Log, session: Session, parsed_data: dict) -> Tuple[bool, float, str]:
        if log.category != "hardware":
            return False, 0.0, ""
            
        status = parsed_data.get("status", "").lower()
        error = parsed_data.get("error", "").lower()
        
        if "smart_fail" in status or "disk_full" in status or "io_error" in error:
            return True, self.base_risk_score, f"Hardware Failure Detected: {status or error}"
            
        return False, 0.0, ""

# Registry of all rules
ALL_RULES = [
    BruteForceRule(),
    ImpossibleTravelRule(),
    MaliciousIPRule(),
    CriticalProcessRule(),
    AdminPrivilegeGrantRule(),
    LateralMovementRule(),
    DataExfiltrationRule(),
    PortScanRule(),
    DDoSRule(),
    SQLInjectionRule(),
    ErrorRateSpikeRule(),
    HighTempRule(),
    DiskFailureRule()
]
