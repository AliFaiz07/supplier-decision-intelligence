"""
Tests for Data Validation and Health Check.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.core.data_validator import check_data_health

def test_data_validation_passes():
    health = check_data_health()
    assert health["status"] == "HEALTHY"
    assert health["errors"] == []
    assert health["loaded_datasets"] == 22
    assert health["checks_passed"] >= 8
