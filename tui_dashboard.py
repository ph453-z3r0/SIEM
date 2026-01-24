import time
import requests
from rich.live import Live
from rich.layout import Layout
from rich.panel import Panel
from rich.table import Table
from rich.console import Console
from rich.text import Text
from rich.align import Align
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"
console = Console()

def fetch_stats():
    try:
        response = requests.get(f"{BASE_URL}/dashboard/stats")
        if response.status_code == 200:
            return response.json()
    except:
        pass
    return None

def make_header():
    grid = Table.grid(expand=True)
    grid.add_column(justify="left")
    grid.add_column(justify="right")
    grid.add_row(
        "[b cyan]Sentinel-X SIEM[/b cyan] | AI-Powered Threat Detection",
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    return Panel(grid, style="white on blue")

def make_stats_table(data):
    if not data:
        return Panel("Loading...", title="System Stats")
    
    stats = data.get("stats", {})
    table = Table(expand=True, show_header=False, box=None)
    table.add_row("[bold]Monitored Users:[/]", str(stats.get("monitored_users", 0)))
    table.add_row("[bold]High Risk Users:[/]", f"[red]{stats.get('high_risk_users', 0)}[/]")
    table.add_row("[bold]Events (1h):[/]", str(stats.get("events_last_hour", 0)))
    table.add_row("[bold]Offenses (1h):[/]", str(stats.get("offenses_last_hour", 0)))
    
    return Panel(table, title="Quick Insights", border_style="green")

def make_risk_users_table(data):
    if not data:
        return Panel("Loading...", title="High Risk Users")
    
    users = data.get("lists", {}).get("high_risk_users", [])
    table = Table(expand=True, show_header=True)
    table.add_column("User", style="cyan")
    table.add_column("Risk Score", justify="right", style="red")
    
    for user in users:
        table.add_row(user["username"], str(user["score"]))
        
    return Panel(table, title="Top High Risk Users", border_style="red")

def make_offenses_table(data):
    if not data:
        return Panel("Loading...", title="Recent Offenses")
    
    offenses = data.get("lists", {}).get("recent_offenses", [])
    table = Table(expand=True, show_header=True)
    table.add_column("ID", style="dim")
    table.add_column("User", style="cyan")
    table.add_column("Time", justify="right")
    table.add_column("Magnitude", justify="right", style="magenta")
    
    for off in offenses:
        table.add_row(str(off["id"]), off["user"], off["time"], f"{off['magnitude']}/10")
        
    return Panel(table, title="Recent Offenses", border_style="yellow")

def make_layout():
    layout = Layout()
    layout.split(
        Layout(name="header", size=3),
        Layout(name="main", ratio=1),
    )
    layout["main"].split_row(
        Layout(name="left", ratio=1),
        Layout(name="right", ratio=2),
    )
    layout["left"].split(
        Layout(name="stats", ratio=1),
        Layout(name="risk_users", ratio=2),
    )
    layout["right"].split(
        Layout(name="offenses", ratio=1),
        Layout(name="logs", ratio=1) # Placeholder for logs if needed
    )
    return layout

def fetch_logs():
    try:
        response = requests.get(f"{BASE_URL}/logs?limit=10")
        if response.status_code == 200:
            return response.json()
    except:
        pass
    return []

def make_logs_panel(logs):
    if not logs:
        return Panel("Waiting for logs...", title="Live Logs")
    
    table = Table(expand=True, show_header=False, box=None)
    table.add_column("Time", style="dim", width=10)
    table.add_column("Source", style="cyan", width=10)
    table.add_column("Event", style="white")
    
    for log in logs:
        # Parse timestamp to just time
        try:
            ts = log["timestamp"].split("T")[1].split(".")[0]
        except:
            ts = log["timestamp"]
            
        event_style = "green"
        if "failed" in str(log.get("raw_data", "")).lower() or "unknown" in str(log.get("raw_data", "")).lower():
            event_style = "red"
            
        table.add_row(
            ts, 
            log["source"], 
            f"[{event_style}]{log['event_type']} - {log['entity_id']}[/{event_style}]"
        )
        
    return Panel(table, title="Live Logs", border_style="blue")

def run_tui():
    layout = make_layout()
    
    with Live(layout, refresh_per_second=2, screen=True):
        while True:
            data = fetch_stats()
            logs = fetch_logs()
            
            layout["header"].update(make_header())
            layout["stats"].update(make_stats_table(data))
            layout["risk_users"].update(make_risk_users_table(data))
            layout["offenses"].update(make_offenses_table(data))
            layout["logs"].update(make_logs_panel(logs))
            
            time.sleep(0.5)

if __name__ == "__main__":
    try:
        run_tui()
    except KeyboardInterrupt:
        pass
