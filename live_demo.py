import requests
import time
import json
import random
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

USERS = ["user_123", "admin", "alice", "bob", "charlie"]
LOCATIONS = ["office", "vpn_ny", "vpn_london", "unknown_ip"]
EVENTS = ["login", "file_access", "process_start", "network_connection"]

def generate_log(is_anomaly=False):
    user = random.choice(USERS)
    event = random.choice(EVENTS)
    
    if is_anomaly:
        # Anomalous behavior pattern
        location = "unknown_ip"
        hour = random.randint(0, 4) # Night time
        details = "failed login" if event == "login" else "unauthorized access"
        print(f"⚠️  Injecting ANOMALY: {user} | {event} | {location}")
    else:
        # Normal behavior pattern
        location = "office"
        hour = random.randint(9, 17) # Work hours
        details = "success"
        print(f"✅  Normal Traffic: {user} | {event} | {location}")

    log = {
        "source": "simulator",
        "event_type": event,
        "entity_id": user,
        "raw_data": json.dumps({
            "location": location, 
            "hour": hour, 
            "details": details,
            "timestamp": datetime.utcnow().isoformat()
        })
    }
    
    try:
        requests.post(f"{BASE_URL}/logs", json=log)
    except Exception as e:
        print(f"Error sending log: {e}")

def run_live_demo():
    print("🚀 Starting Sentinel-X Live Demo Mode")
    print("Press Ctrl+C to stop...")
    print("-" * 50)

    try:
        while True:
            # 90% chance of normal traffic, 10% chance of anomaly
            is_anomaly = random.random() > 0.9
            
            generate_log(is_anomaly)
            
            # Random delay between 0.5s and 2s
            time.sleep(random.uniform(0.5, 2.0))
            
    except KeyboardInterrupt:
        print("\n🛑 Live Demo Stopped")

if __name__ == "__main__":
    run_live_demo()
