import time
import requests
from rich.live import Live
from rich.layout import Layout
from rich.panel import Panel
from rich.table import Table
from rich.console import Console
from rich.text import Text
from rich.align import Align
from rich.bar import Bar
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
    grid.add_column(justify="center")
    grid.add_column(justify="right")
    
    grid.add_row(
        "[b cyan]Titan-SIEM[/b cyan] | Industrial Grade Security",
        "[b yellow]SYSTEM STATUS: ONLINE[/b yellow]",
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    return Panel(grid, style="white on blue")

def make_category_panel(data):
    if not data:
        return Panel("Loading...", title="Event Categories")
    
    stats = data.get("stats", {}).get("by_category", {})
    total = sum(stats.values())
    if total == 0:
        total = 1
    
    table = Table(expand=True, show_header=False, box=None)
    
    colors = {"security": "red", "network": "blue", "application": "green", "hardware": "yellow"}
    
    for cat, count in stats.items():
        percent = (count / total) * 100
        bar = "█" * int(percent / 5)
        color = colors.get(cat, "white")
        table.add_row(
            f"[{color}]{cat.upper()}[/{color}]",
            f"{count}",
            f"[{color}]{bar}[/{color}]"
        )
        
    return Panel(table, title="Event Categories", border_style="cyan")

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

def make_offenses_table(data):
    if not data:
        return Panel("Loading...", title="Active Threats")
    
    offenses = data.get("lists", {}).get("recent_offenses", [])
    table = Table(expand=True, show_header=True)
    table.add_column("Risk", justify="right", style="bold")
    table.add_column("Title", style="white")
    table.add_column("User/Entity", style="cyan")
    table.add_column("Time", justify="right", style="dim")
    
    for off in offenses:
        risk = off.get("risk_score", 0)
        color = "red" if risk > 80 else "yellow"
        table.add_row(
            f"[{color}]{risk}[/{color}]",
            off.get("title", "Unknown"),
            off.get("user", "Unknown"),
            off.get("time", "")
        )
        
    return Panel(table, title="Active Threats", border_style="red")

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
        Layout(name="categories", ratio=1),
    )
    layout["right"].split(
        Layout(name="offenses", ratio=1)
    )
    return layout

def run_tui():
    layout = make_layout()
    
    with Live(layout, refresh_per_second=2, screen=True):
        while True:
            data = fetch_stats()
            
            layout["header"].update(make_header())
            layout["stats"].update(make_stats_table(data))
            layout["categories"].update(make_category_panel(data))
            layout["offenses"].update(make_offenses_table(data))
            
            time.sleep(1)

if __name__ == "__main__":
    try:
        run_tui()
    except KeyboardInterrupt:
        pass
