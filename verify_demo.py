import requests
import time
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

def run_demo():
    print("🚀 Starting Titan-SIEM Demo Scenario: Insider Threat")
    
    # 1. Simulate Normal Traffic (Training)
    print("\n[1/4] Simulating Normal Traffic...")
    for i in range(10):
        log = {
            "source": "endpoint",
            "event_type": "login",
            "entity_id": "user_123",
            "raw_data": json.dumps({"location": "office", "hour": 9})
        }
        requests.post(f"{BASE_URL}/logs", json=log)
    print("✅ Normal traffic ingested.")

    # 2. Simulate Attack
    print("\n[2/4] Simulating Insider Attack...")
    attack_log = {
        "source": "vpn",
        "event_type": "login",
        "entity_id": "user_123",
        "raw_data": json.dumps({"location": "unknown_vpn", "hour": 2, "details": "failed login"})
    }
    response = requests.post(f"{BASE_URL}/logs", json=attack_log)
    print(f"⚠️ Attack Log Ingested: {response.status_code}")

    # 3. Wait for Analysis
    print("\n[3/4] Waiting for AI Analysis...")
    time.sleep(2) 

    # 4. Verify Alert & SOAR
    print("\n[4/4] Verifying Response...")
    alerts = requests.get(f"{BASE_URL}/alerts").json()
    
    found = False
    for alert in alerts:
        if alert['entity_id'] == "user_123":
            print(f"🚨 ALERT FOUND: {alert['title']}")
            print(f"   Risk Score: {alert['risk_score']}")
            print(f"   Reasons: {alert['description']}")
            if alert.get('playbook_executed'):
                print(f"   🔒 SOAR ACTION: {alert['playbook_executed']}")
            found = True
            break
    
    if not found:
        print("❌ No alert found for user_123")
    else:
        print("\n✅ DEMO SUCCESSFUL: Threat Detected & Mitigated!")

if __name__ == "__main__":
    run_demo()
