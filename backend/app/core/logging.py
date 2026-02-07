import logging
import sys
from pathlib import Path

# Create logs directory if it doesn't exist
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

# Configure logging
def setup_logging():
    logger = logging.getLogger("sentinel_siem")
    logger.setLevel(logging.INFO)

    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    console_handler.setFormatter(console_formatter)

    # File Handler
    file_handler = logging.FileHandler(LOG_DIR / "siem.log")
    file_handler.setLevel(logging.INFO)
    file_formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s"
    )
    file_handler.setFormatter(file_formatter)

    # Add handlers
    if not logger.handlers:
        logger.addHandler(console_handler)
        logger.addHandler(file_handler)

    return logger

logger = setup_logging()
