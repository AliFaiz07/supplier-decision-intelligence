"""
Data Validator Core Module for Backend Health & Startup Check.
"""

import sys
import os
from typing import Dict, Any

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from scripts.validate_mock_data import validate_all

def check_data_health() -> Dict[str, Any]:
    """Execute referential integrity and schema validation checks."""
    return validate_all()
