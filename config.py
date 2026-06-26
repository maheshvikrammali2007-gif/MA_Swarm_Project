import os
from dotenv import load_dotenv

# Load key from .env
load_dotenv()

# API Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Model Configuration
DEFAULT_MODEL = "gemini-1.5-flash"

# System Settings
TIMEOUT_SECONDS = 30.0
MAX_RETRIES = 3

# M&A Risk Analysis Thresholds
RISK_THRESHOLD_HIGH = 0.7
RISK_THRESHOLD_MEDIUM = 0.4
