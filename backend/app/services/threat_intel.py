from typing import List

class ThreatIntelService:
    def __init__(self):
        # Mock database of known malicious indicators
        self.malicious_ips = {
            "192.168.1.100": "Known C2 Server",
            "10.0.0.5": "Botnet Node",
            "172.16.0.20": "Phishing Source"
        }
        self.malicious_hashes = {
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855": "Empty File (Test)",
            "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8": "Ransomware.WannaCry"
        }

    def check_ip(self, ip: str) -> str:
        """Returns the threat type if found, else None"""
        return self.malicious_ips.get(ip)

    def check_file_hash(self, file_hash: str) -> str:
        """Returns the threat type if found, else None"""
        return self.malicious_hashes.get(file_hash)

threat_intel = ThreatIntelService()
