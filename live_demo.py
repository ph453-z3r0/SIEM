import time
import random
import json
import requests
import sys
from datetime import datetime

API_URL = "http://localhost:8000/api/v1/logs"

# Configuration
SCENARIO_PROBABILITY = 0.3 # 30% chance to trigger a scenario per cycle
CYCLE_DELAY = 1.0 # Seconds between cycles

def send_log(log_data):
    try:
        response = requests.post(API_URL, json=log_data, timeout=2)
        # response.raise_for_status()
    except Exception as e:
        print(f"❌ Error sending log: {e}")

# --- Generators for Background Noise ---

def generate_noise_network():
    src_ip = f"192.168.1.{random.randint(1, 200)}"
    return {
        "source": "firewall",
        "category": "network",
        "event_type": "traffic_flow",
        "entity_id": src_ip,
        "raw_data": json.dumps({
            "source_ip": src_ip,
            "dest_ip": f"10.0.0.{random.randint(1, 50)}",
            "dest_port": random.choice([80, 443, 53, 22]),
            "bytes_in": random.randint(100, 5000),
            "bytes_out": random.randint(100, 5000),
            "protocol": "TCP"
        })
    }

def generate_noise_app():
    users = ["alice", "bob", "charlie", "admin", "service_acct"]
    return {
        "source": "web_server",
        "category": "application",
        "event_type": "http_request",
        "entity_id": random.choice(users),
        "raw_data": json.dumps({
            "method": random.choice(["GET", "POST"]),
            "path": random.choice(["/home", "/api/data", "/profile"]),
            "status_code": 200,
            "response_time": random.randint(20, 200)
        })
    }

def generate_noise_hardware():
    rack = f"RACK-{random.randint(1, 5):02d}"
    return {
        "source": "iot_sensor",
        "category": "hardware",
        "event_type": "telemetry",
        "entity_id": rack,
        "raw_data": json.dumps({
            "temp": random.randint(40, 65),
            "cpu_load": random.randint(10, 60),
            "fan_speed": random.randint(2000, 4000),
            "status": "optimal"
        })
    }

# --- Specific Attack/Failure Scenarios ---

def scenario_ddos():
    """Simulates a DDoS attack: High volume traffic from one IP"""
    attacker_ip = f"203.0.113.{random.randint(1, 255)}"
    print(f"\n⚠️  TRIGGERING SCENARIO: DDoS Attack from {attacker_ip}")
    print("   -> Flooding network logs...")
    
    # Send 120 logs in quick succession
    for _ in range(120):
        log = {
            "source": "firewall",
            "category": "network",
            "event_type": "traffic_flow",
            "entity_id": attacker_ip,
            "raw_data": json.dumps({
                "source_ip": attacker_ip,
                "dest_ip": "10.0.0.5",
                "dest_port": 80,
                "bytes_in": 128,
                "protocol": "UDP" # UDP Flood
            })
        }
        send_log(log)
    print("   -> DDoS Simulation Complete.")

def scenario_sqli():
    """Simulates SQL Injection attempts"""
    attacker_ip = "192.168.1.105"
    print(f"\n⚠️  TRIGGERING SCENARIO: SQL Injection Attack")
    
    payloads = ["' OR 1=1 --", "UNION SELECT user, password FROM users", "Waitfor delay '0:0:5'"]
    
    for payload in payloads:
        log = {
            "source": "waf",
            "category": "application",
            "event_type": "input_validation_failure",
            "entity_id": attacker_ip,
            "raw_data": json.dumps({
                "input": payload,
                "query": f"SELECT * FROM items WHERE id = {payload}",
                "method": "GET",
                "path": "/api/search"
            })
        }
        send_log(log)
        time.sleep(0.5)
        print(f"   -> Injected: {payload}")
    print("   -> SQLi Simulation Complete.")

def scenario_brute_force():
    """Simulates Brute Force Login"""
    target = "admin"
    print(f"\n⚠️  TRIGGERING SCENARIO: Brute Force on user '{target}'")
    
    for i in range(8):
        log = {
            "source": "auth_service",
            "category": "security",
            "event_type": "login",
            "entity_id": target,
            "raw_data": json.dumps({
                "status": "failed",
                "ip": "10.10.10.10",
                "reason": "invalid_credentials"
            })
        }
        send_log(log)
        if i == 7:
            # Successful login at the end (optional, to show breach)
            log["raw_data"] = json.dumps({"status": "success", "ip": "10.10.10.10"})
            send_log(log)
            print("   -> Login Breached!")
        time.sleep(0.2)
    print("   -> Brute Force Simulation Complete.")

def scenario_hardware_failure():
    """Simulates Hardware Overheating and Disk Failure"""
    rack = "RACK-CRITICAL-01"
    print(f"\n⚠️  TRIGGERING SCENARIO: Critical Hardware Failure on {rack}")
    
    # 1. Rising Temp
    for temp in range(70, 95, 5):
        log = {
            "source": "iot_sensor",
            "category": "hardware",
            "event_type": "telemetry",
            "entity_id": rack,
            "raw_data": json.dumps({
                "temp": temp,
                "cpu_load": 95,
                "fan_speed": 5000
            })
        }
        send_log(log)
        print(f"   -> Temp rising: {temp}°C")
        time.sleep(1)
        
    # 2. Disk Fail
    log = {
        "source": "storage_array",
        "category": "hardware",
        "event_type": "disk_error",
        "entity_id": rack,
        "raw_data": json.dumps({
            "status": "smart_fail",
            "drive_id": "sda1",
            "error": "Sector damage detected"
        })
    }
    send_log(log)
    print("   -> Disk Failure Event Sent.")
    print("   -> Hardware Simulation Complete.")

def scenario_port_scan():
    """Simulates Port Scan"""
    attacker = "45.33.22.11"
    target = "10.0.0.5"
    print(f"\n⚠️  TRIGGERING SCENARIO: Port Scan from {attacker} -> {target}")
    
    ports = [21, 22, 23, 25, 53, 80, 443, 3306, 8080, 8443]
    for port in ports:
        log = {
            "source": "firewall",
            "category": "network",
            "event_type": "connection_attempt",
            "entity_id": attacker,
            "raw_data": json.dumps({
                "source_ip": attacker,
                "dest_ip": target,
                "dest_port": port,
                "protocol": "TCP"
            })
        }
        send_log(log)
    print("   -> Port Scan Simulation Complete.")
    
def scenario_app_error_spike():
    """Simulates Application Error Spike (500s)"""
    print(f"\n⚠️  TRIGGERING SCENARIO: Application 500 Error Spike")
    
    for _ in range(15):
        log = {
            "source": "backend_api",
            "category": "application",
            "event_type": "exception",
            "entity_id": "service_01",
            "raw_data": json.dumps({
                "status_code": 500,
                "path": "/api/v1/checkout",
                "error": "DatabaseConnectionTimeout"
            })
        }
        send_log(log)
        time.sleep(0.1)
    print("   -> Error Spike Simulation Complete.")

SCENARIOS = [
    scenario_ddos,
    scenario_sqli,
    scenario_brute_force,
    scenario_hardware_failure,
    scenario_port_scan,
    scenario_app_error_spike
]

def run_simulation():
    print("🚀 Starting ENHANCED Real-Time SIEM Simulation")
    print("   Press Ctrl+C to stop.")
    print("   Generating background noise and random attacks...")
    
    try:
        while True:
            # 1. Background Noise (Always happens)
            send_log(generate_noise_network())
            # send_log(generate_noise_network())
            send_log(generate_noise_app())
            if random.random() < 0.5:
                send_log(generate_noise_hardware())
                
            print(".", end="", flush=True)
            
            # 2. Random Scenario Trigger
            if random.random() < SCENARIO_PROBABILITY:
                print("") # Newline
                scenario = random.choice(SCENARIOS)
                scenario()
                # Wait a bit after a major scenario to let user see it
                time.sleep(2)
                
            time.sleep(CYCLE_DELAY)
            
    except KeyboardInterrupt:
        print("\n\n🛑 Simulation stopped.")

if __name__ == "__main__":
    run_simulation()
