"""
Decision History, Audit Trail & Procurement Memory Manager for SAP Supplier Decision Intelligence Platform.
Tracks historical sourcing decisions, records baseline expectations at award time,
and logs empirical post-award procurement outcomes (Expected vs Actual Closed-Loop Learning).
"""

import json
import os
import threading
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.config import settings

class DecisionHistoryManager:
    def __init__(self, history_file: Optional[str] = None):
        self.history_file = history_file or settings.HISTORY_FILE
        self._lock = threading.Lock()
        self._init_file()

    def _init_file(self):
        # Always ensure rich procurement memory records exist
        should_seed = False
        if not os.path.exists(self.history_file):
            should_seed = True
        else:
            try:
                with open(self.history_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    has_outcome = any(d.get("actual_outcome", {}).get("has_outcome_data", False) for d in data)
                    should_seed = not has_outcome
            except Exception:
                should_seed = True

        if should_seed:
            initial_history = [
                {
                    "decision_id": "DEC-2026-0091",
                    "timestamp": "2026-09-18T14:22:10",
                    "material_id": "MAT-001",
                    "material_description": "Hydraulic Directional Control Valve HSV-40",
                    "quantity": 10000,
                    "plant_id": "P001",
                    "scenario": "Standard Sourcing (Balanced)",
                    "weights_applied": {"price": 0.25, "delivery": 0.25, "quality": 0.20, "lead_time": 0.15, "contract": 0.10, "risk": 0.05},
                    "recommended_supplier_id": "SUP-006",
                    "recommended_supplier_name": "Helios Werkzeuge & Antriebstechnik AG",
                    "decision_score": 93.4,
                    "effective_unit_cost_eur": 190.67,
                    "total_cost_eur": 1906700.0,
                    "status": "Approved by Procurement Lead",
                    "action_taken": "PO Release Simulation Completed",
                    "user_notes": "Selected due to active framework contract CTR-4600001001 with 5.7% rebate.",
                    "expected_metrics": {
                        "expected_otif_pct": 96.0,
                        "expected_unit_price_eur": 190.67,
                        "expected_lead_time_days": 10,
                        "expected_defect_rate_pct": 0.45,
                        "expected_contract_status": "Active (CTR-4600001001)"
                    },
                    "actual_outcome": {
                        "has_outcome_data": True,
                        "observation_date": "2026-09-28",
                        "actual_otif_pct": 95.2,
                        "actual_avg_unit_price_eur": 190.67,
                        "actual_lead_time_days": 10,
                        "actual_defect_rate_pct": 0.41,
                        "otif_variance_pct": -0.8,
                        "price_variance_pct": 0.0,
                        "outcome_status": "Met Expectations",
                        "procurement_lesson": "Contract CTR-4600001001 provided price stability; lead time was honored precisely at 10 days."
                    }
                },
                {
                    "decision_id": "DEC-2026-0090",
                    "timestamp": "2026-09-12T09:45:00",
                    "material_id": "MAT-003",
                    "material_description": "Precision Ceramic Hybrid Ball Bearing 6205-2RS",
                    "quantity": 1200,
                    "plant_id": "P001",
                    "scenario": "Quality-Critical Sourcing",
                    "weights_applied": {"price": 0.10, "delivery": 0.20, "quality": 0.50, "lead_time": 0.10, "contract": 0.05, "risk": 0.05},
                    "recommended_supplier_id": "SUP-003",
                    "recommended_supplier_name": "Valbruna Precision Metals S.p.A.",
                    "decision_score": 96.2,
                    "effective_unit_cost_eur": 82.00,
                    "total_cost_eur": 98400.0,
                    "status": "Audited & Archived",
                    "action_taken": "Outline Agreement Call-off",
                    "user_notes": "High criticality powertrain bearing requiring zero defect tolerance (0.18% historical defect rate).",
                    "expected_metrics": {
                        "expected_otif_pct": 94.0,
                        "expected_unit_price_eur": 82.00,
                        "expected_lead_time_days": 12,
                        "expected_defect_rate_pct": 0.20,
                        "expected_contract_status": "Active (CTR-4600001003)"
                    },
                    "actual_outcome": {
                        "has_outcome_data": True,
                        "observation_date": "2026-09-25",
                        "actual_otif_pct": 96.5,
                        "actual_avg_unit_price_eur": 82.00,
                        "actual_lead_time_days": 11,
                        "actual_defect_rate_pct": 0.15,
                        "otif_variance_pct": +2.5,
                        "price_variance_pct": 0.0,
                        "outcome_status": "Exceeded Expectations",
                        "procurement_lesson": "Premium metallurgical supplier delivered zero lot rejects across 1,200 units with 1 day early dock arrival."
                    }
                },
                {
                    "decision_id": "DEC-2026-0089",
                    "timestamp": "2026-08-28T16:10:45",
                    "material_id": "MAT-002",
                    "material_description": "High-Tensile Structural Fastener M16x80 Grade 10.9",
                    "quantity": 50000,
                    "plant_id": "P001",
                    "scenario": "Commodity Cost Optimization",
                    "weights_applied": {"price": 0.50, "delivery": 0.15, "quality": 0.15, "lead_time": 0.10, "contract": 0.05, "risk": 0.05},
                    "recommended_supplier_id": "SUP-001",
                    "recommended_supplier_name": "Rheinland Industrietechnik GmbH",
                    "decision_score": 88.6,
                    "effective_unit_cost_eur": 4.26,
                    "total_cost_eur": 213000.0,
                    "status": "Completed",
                    "action_taken": "Standard PO Issue",
                    "user_notes": "SUP-002 rejected due to severe delivery volatility; SUP-001 chosen for balanced reliability.",
                    "expected_metrics": {
                        "expected_otif_pct": 92.0,
                        "expected_unit_price_eur": 4.26,
                        "expected_lead_time_days": 7,
                        "expected_defect_rate_pct": 0.80,
                        "expected_contract_status": "No Contract (Spot PIR)"
                    },
                    "actual_outcome": {
                        "has_outcome_data": True,
                        "observation_date": "2026-09-15",
                        "actual_otif_pct": 84.0,
                        "actual_avg_unit_price_eur": 4.58,
                        "actual_lead_time_days": 10,
                        "actual_defect_rate_pct": 1.15,
                        "otif_variance_pct": -8.0,
                        "price_variance_pct": +7.5,
                        "outcome_status": "Underperformed (Delivery & Cost)",
                        "procurement_lesson": "Spot purchase was vulnerable to transport surcharges (+7.5% price spike) and supplier priority queueing (+3 days delay). In the future, lock in outline agreement CTR."
                    }
                },
                {
                    "decision_id": "DEC-2026-0088",
                    "timestamp": "2026-08-15T11:05:00",
                    "material_id": "MAT-003",
                    "material_description": "Precision Ceramic Hybrid Ball Bearing 6205-2RS",
                    "quantity": 2500,
                    "plant_id": "P001",
                    "scenario": "Lowest Cost Sourcing",
                    "weights_applied": {"price": 0.60, "delivery": 0.15, "quality": 0.10, "lead_time": 0.10, "contract": 0.05, "risk": 0.00},
                    "recommended_supplier_id": "SUP-004",
                    "recommended_supplier_name": "AeroTech Components GmbH",
                    "decision_score": 84.1,
                    "effective_unit_cost_eur": 102.00,
                    "total_cost_eur": 255000.0,
                    "status": "Completed",
                    "action_taken": "Standard PO Release",
                    "user_notes": "Selected on aggressive pricing despite slight delivery variance in Q2.",
                    "expected_metrics": {
                        "expected_otif_pct": 94.0,
                        "expected_unit_price_eur": 102.00,
                        "expected_lead_time_days": 8,
                        "expected_defect_rate_pct": 0.60,
                        "expected_contract_status": "No Contract"
                    },
                    "actual_outcome": {
                        "has_outcome_data": True,
                        "observation_date": "2026-09-10",
                        "actual_otif_pct": 81.0,
                        "actual_avg_unit_price_eur": 118.00,
                        "actual_lead_time_days": 12,
                        "actual_defect_rate_pct": 1.40,
                        "otif_variance_pct": -13.0,
                        "price_variance_pct": +15.7,
                        "outcome_status": "Severe Underperformance (Delivery & Price Escalation)",
                        "procurement_lesson": "SUP-004 performed 13.0 percentage points below delivery expectation while actual purchase price escalated +15.7% due to lack of contract ceiling. Led to the M-003 price anomaly flag."
                    }
                }
            ]
            with open(self.history_file, "w", encoding="utf-8") as f:
                json.dump(initial_history, f, indent=2)

    def get_all_decisions(self) -> List[Dict[str, Any]]:
        with self._lock:
            if not os.path.exists(self.history_file):
                return []
            try:
                with open(self.history_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return []

    def get_decision_by_id(self, decision_id: str) -> Optional[Dict[str, Any]]:
        all_d = self.get_all_decisions()
        for d in all_d:
            if d.get("decision_id") == decision_id:
                return d
        return None

    def record_decision(self, decision_data: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            all_d = self.get_all_decisions()
            new_id = f"DEC-2026-{len(all_d) + 92:04d}"
            
            # Extract expected metrics from recommended_option if available
            rec = decision_data.get("recommended_option", {})
            expected_metrics = {
                "expected_otif_pct": rec.get("delivery_reliability_pct", 90.0),
                "expected_unit_price_eur": rec.get("effective_unit_cost_eur", 0.0),
                "expected_lead_time_days": rec.get("offered_lead_time_days", 14),
                "expected_defect_rate_pct": rec.get("quality_rejection_rate_pct", 0.5),
                "expected_contract_status": rec.get("contract_status", "Standard PIR")
            }

            record = {
                "decision_id": new_id,
                "timestamp": datetime.now().isoformat(),
                "expected_metrics": expected_metrics,
                "actual_outcome": {
                    "has_outcome_data": False,
                    "observation_date": None,
                    "actual_otif_pct": None,
                    "actual_avg_unit_price_eur": None,
                    "actual_lead_time_days": None,
                    "actual_defect_rate_pct": None,
                    "otif_variance_pct": None,
                    "price_variance_pct": None,
                    "outcome_status": "Pending Execution & Goods Receipt",
                    "procurement_lesson": "Outcome telemetry will populate following SAP Goods Receipts (MIGO) and Invoicing (MIRO)."
                },
                **decision_data
            }
            all_d.insert(0, record)
            with open(self.history_file, "w", encoding="utf-8") as f:
                json.dump(all_d, f, indent=2)
            return record

    def record_outcome(self, decision_id: str, outcome_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with self._lock:
            all_d = self.get_all_decisions()
            target = None
            for d in all_d:
                if d.get("decision_id") == decision_id:
                    target = d
                    break
            if not target:
                return None

            exp = target.get("expected_metrics", {})
            act_otif = outcome_data.get("actual_otif_pct", exp.get("expected_otif_pct", 90.0))
            act_price = outcome_data.get("actual_avg_unit_price_eur", exp.get("expected_unit_price_eur", 0.0))
            
            otif_var = round(act_otif - exp.get("expected_otif_pct", act_otif), 1)
            exp_p = exp.get("expected_unit_price_eur", act_price)
            price_var = round(((act_price - exp_p) / max(0.01, exp_p)) * 100.0, 1)

            target["actual_outcome"] = {
                "has_outcome_data": True,
                "observation_date": datetime.now().strftime("%Y-%m-%d"),
                "actual_otif_pct": act_otif,
                "actual_avg_unit_price_eur": act_price,
                "actual_lead_time_days": outcome_data.get("actual_lead_time_days", exp.get("expected_lead_time_days", 14)),
                "actual_defect_rate_pct": outcome_data.get("actual_defect_rate_pct", exp.get("expected_defect_rate_pct", 0.5)),
                "otif_variance_pct": otif_var,
                "price_variance_pct": price_var,
                "outcome_status": outcome_data.get("outcome_status", "Outcome Evaluated"),
                "procurement_lesson": outcome_data.get("procurement_lesson", f"Observed OTIF variance of {otif_var}% and price variance of {price_var}%.")
            }

            with open(self.history_file, "w", encoding="utf-8") as f:
                json.dump(all_d, f, indent=2)
            return target

    def get_procurement_memory_summary(self) -> Dict[str, Any]:
        """
        Computes closed-loop Procurement Memory analytics:
        Compares expected metrics at award time with actual observed post-award telemetry.
        Synthesizes empirical lessons learned and decision accuracy.
        """
        all_d = self.get_all_decisions()
        evaluated = [d for d in all_d if d.get("actual_outcome", {}).get("has_outcome_data", False)]
        
        total_eval = len(evaluated)
        if total_eval == 0:
            return {
                "total_decisions": len(all_d),
                "evaluated_decisions_count": 0,
                "decision_accuracy_pct": 0.0,
                "average_otif_variance_pct": 0.0,
                "average_price_variance_pct": 0.0,
                "lessons_learned": [],
                "recent_evaluations": []
            }

        met_count = sum(1 for d in evaluated if "Met" in d["actual_outcome"].get("outcome_status", "") or "Exceeded" in d["actual_outcome"].get("outcome_status", ""))
        accuracy_pct = round((met_count / total_eval) * 100.0, 1)

        otif_vars = [d["actual_outcome"].get("otif_variance_pct", 0.0) for d in evaluated if d["actual_outcome"].get("otif_variance_pct") is not None]
        avg_otif_var = round(sum(otif_vars) / max(1, len(otif_vars)), 1)

        price_vars = [d["actual_outcome"].get("price_variance_pct", 0.0) for d in evaluated if d["actual_outcome"].get("price_variance_pct") is not None]
        avg_price_var = round(sum(price_vars) / max(1, len(price_vars)), 1)

        lessons = [
            {
                "decision_id": d["decision_id"],
                "material_id": d.get("material_id"),
                "supplier_name": d.get("recommended_supplier_name"),
                "outcome_status": d["actual_outcome"].get("outcome_status"),
                "lesson": d["actual_outcome"].get("procurement_lesson")
            }
            for d in evaluated if d["actual_outcome"].get("procurement_lesson")
        ]

        return {
            "total_decisions": len(all_d),
            "evaluated_decisions_count": total_eval,
            "decision_accuracy_pct": accuracy_pct,
            "average_otif_variance_pct": avg_otif_var,
            "average_price_variance_pct": avg_price_var,
            "lessons_learned": lessons,
            "recent_evaluations": evaluated
        }

# Singleton
_history_mgr: Optional[DecisionHistoryManager] = None

def get_history_manager() -> DecisionHistoryManager:
    global _history_mgr
    if _history_mgr is None:
        _history_mgr = DecisionHistoryManager()
    return _history_mgr
