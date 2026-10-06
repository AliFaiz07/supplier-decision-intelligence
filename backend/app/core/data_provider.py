"""
Data Provider Abstraction Layer for SAP Supplier Decision Intelligence Platform.
Enables transparent switching between MockDataProvider (current local POC),
FutureSAPProvider (S/4HANA OData/REST/BTP), and FutureS21Provider.
"""

import json
import os
import threading
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from app.config import settings

class DataProvider(ABC):
    """Abstract Interface defining canonical procurement data access."""

    @abstractmethod
    def get_suppliers(self) -> List[Dict[str, Any]]: ...
    @abstractmethod
    def get_supplier_by_id(self, supplier_id: str) -> Optional[Dict[str, Any]]: ...
    @abstractmethod
    def get_materials(self) -> List[Dict[str, Any]]: ...
    @abstractmethod
    def get_material_by_id(self, material_id: str) -> Optional[Dict[str, Any]]: ...
    @abstractmethod
    def get_plants(self) -> List[Dict[str, Any]]: ...
    @abstractmethod
    def get_contracts(self, supplier_id: Optional[str] = None, material_id: Optional[str] = None) -> List[Dict[str, Any]]: ...
    @abstractmethod
    def get_pushed_pos(self, supplier_id: Optional[str] = None, material_id: Optional[str] = None) -> List[Dict[str, Any]]: ...
    @abstractmethod
    def get_goods_receipts(self, supplier_id: Optional[str] = None, material_id: Optional[str] = None) -> List[Dict[str, Any]]: ...
    @abstractmethod
    def get_quality_records(self, supplier_id: Optional[str] = None, material_id: Optional[str] = None) -> List[Dict[str, Any]]: ...
    @abstractmethod
    def get_invoices(self, supplier_id: Optional[str] = None) -> List[Dict[str, Any]]: ...
    @abstractmethod
    def get_price_history(self, supplier_id: Optional[str] = None, material_id: Optional[str] = None) -> List[Dict[str, Any]]: ...
    @abstractmethod
    def get_quotations(self, material_id: Optional[str] = None, rfq_number: Optional[str] = None) -> List[Dict[str, Any]]: ...
    @abstractmethod
    def get_risk_events(self, supplier_id: Optional[str] = None) -> List[Dict[str, Any]]: ...
    @abstractmethod
    def get_requirements(self) -> List[Dict[str, Any]]: ...
    @abstractmethod
    def get_scenarios(self) -> List[Dict[str, Any]]: ...
    @abstractmethod
    def get_quota_arrangements(self, material_id: Optional[str] = None) -> List[Dict[str, Any]]: ...
    @abstractmethod
    def get_source_list(self, material_id: Optional[str] = None) -> List[Dict[str, Any]]: ...
    @abstractmethod
    def get_puchase_info_records(self, material_id: Optional[str] = None) -> List[Dict[str, Any]]: ...
    @abstractmethod
    def reload_data(self) -> None: ...


class MockDataProvider(DataProvider):
    """
    Local JSON-based synthetic data provider for POC execution.
    Loads and validates all 22 datasets in memory with thread safety.
    """

    def __init__(self, data_dir: Optional[str] = None):
        self.data_dir = data_dir or settings.DATA_DIR
        self._cache: Dict[str, Any] = {}
        self._lock = threading.Lock()
        self.reload_data()

    def reload_data(self) -> None:
        with self._lock:
            self._cache.clear()
            files = [
                "suppliers.json", "materials.json", "plants.json", "contracts.json",
                "purchasing_info_records.json", "source_list.json", "quota_arrangements.json",
                "purchase_orders.json", "goods_receipts.json", "delivery_history.json",
                "quality_records.json", "invoices.json", "price_history.json",
                "risk_events.json", "supplier_performance.json", "purchase_requisitions.json",
                "rfqs.json", "supplier_quotations.json", "procurement_requirements.json",
                "scenario_definitions.json", "country_information.json", "currency_information.json"
            ]
            for f in files:
                path = os.path.join(self.data_dir, f)
                if os.path.exists(path):
                    with open(path, "r", encoding="utf-8") as fp:
                        self._cache[f] = json.load(fp)
                else:
                    self._cache[f] = []

    def get_raw_dataset(self, filename: str) -> Any:
        return self._cache.get(filename, [])

    def get_suppliers(self) -> List[Dict[str, Any]]:
        return self._cache.get("suppliers.json", [])

    def get_supplier_by_id(self, supplier_id: str) -> Optional[Dict[str, Any]]:
        for s in self.get_suppliers():
            if s.get("supplier_id") == supplier_id:
                return s
        return None

    def get_materials(self) -> List[Dict[str, Any]]:
        return self._cache.get("materials.json", [])

    def get_material_by_id(self, material_id: str) -> Optional[Dict[str, Any]]:
        for m in self.get_materials():
            if m.get("material_id") == material_id:
                return m
        return None

    def get_plants(self) -> List[Dict[str, Any]]:
        return self._cache.get("plants.json", [])

    def get_contracts(self, supplier_id: Optional[str] = None, material_id: Optional[str] = None) -> List[Dict[str, Any]]:
        items = self._cache.get("contracts.json", [])
        if supplier_id:
            items = [c for c in items if c.get("supplier_id") == supplier_id]
        if material_id:
            items = [c for c in items if c.get("material_id") == material_id]
        return items

    def get_pushed_pos(self, supplier_id: Optional[str] = None, material_id: Optional[str] = None) -> List[Dict[str, Any]]:
        items = self._cache.get("purchase_orders.json", [])
        if supplier_id:
            items = [p for p in items if p.get("supplier_id") == supplier_id]
        if material_id:
            items = [p for p in items if p.get("material_id") == material_id]
        return items

    def get_goods_receipts(self, supplier_id: Optional[str] = None, material_id: Optional[str] = None) -> List[Dict[str, Any]]:
        items = self._cache.get("goods_receipts.json", [])
        if supplier_id:
            items = [g for g in items if g.get("supplier_id") == supplier_id]
        if material_id:
            items = [g for g in items if g.get("material_id") == material_id]
        return items

    def get_quality_records(self, supplier_id: Optional[str] = None, material_id: Optional[str] = None) -> List[Dict[str, Any]]:
        items = self._cache.get("quality_records.json", [])
        if supplier_id:
            items = [q for q in items if q.get("supplier_id") == supplier_id]
        if material_id:
            items = [q for q in items if q.get("material_id") == material_id]
        return items

    def get_invoices(self, supplier_id: Optional[str] = None) -> List[Dict[str, Any]]:
        items = self._cache.get("invoices.json", [])
        if supplier_id:
            items = [inv for inv in items if inv.get("supplier_id") == supplier_id]
        return items

    def get_price_history(self, supplier_id: Optional[str] = None, material_id: Optional[str] = None) -> List[Dict[str, Any]]:
        items = self._cache.get("price_history.json", [])
        if supplier_id:
            items = [p for p in items if p.get("supplier_id") == supplier_id]
        if material_id:
            items = [p for p in items if p.get("material_id") == material_id]
        return items

    def get_quotations(self, material_id: Optional[str] = None, rfq_number: Optional[str] = None) -> List[Dict[str, Any]]:
        items = self._cache.get("supplier_quotations.json", [])
        if material_id:
            items = [q for q in items if q.get("material_id") == material_id]
        if rfq_number:
            items = [q for q in items if q.get("rfq_number") == rfq_number]
        return items

    def get_risk_events(self, supplier_id: Optional[str] = None) -> List[Dict[str, Any]]:
        items = self._cache.get("risk_events.json", [])
        if supplier_id:
            items = [r for r in items if r.get("supplier_id") == supplier_id]
        return items

    def get_requirements(self) -> List[Dict[str, Any]]:
        return self._cache.get("procurement_requirements.json", [])

    def get_scenarios(self) -> List[Dict[str, Any]]:
        return self._cache.get("scenario_definitions.json", [])

    def get_quota_arrangements(self, material_id: Optional[str] = None) -> List[Dict[str, Any]]:
        items = self._cache.get("quota_arrangements.json", [])
        if material_id:
            items = [q for q in items if q.get("material_id") == material_id]
        return items

    def get_source_list(self, material_id: Optional[str] = None) -> List[Dict[str, Any]]:
        items = self._cache.get("source_list.json", [])
        if material_id:
            items = [sl for sl in items if sl.get("material_id") == material_id]
        return items

    def get_puchase_info_records(self, material_id: Optional[str] = None) -> List[Dict[str, Any]]:
        items = self._cache.get("purchasing_info_records.json", [])
        if material_id:
            items = [pir for pir in items if pir.get("material_id") == material_id]
        return items

    def get_purchasing_info_records(self, material_id: Optional[str] = None) -> List[Dict[str, Any]]:
        return self.get_puchase_info_records(material_id)

    def get_pirs(self, material_id: Optional[str] = None) -> List[Dict[str, Any]]:
        return self.get_puchase_info_records(material_id)

    def get_pir(self, supplier_id: str, material_id: str) -> Optional[Dict[str, Any]]:
        for pir in self._cache.get("purchasing_info_records.json", []):
            if pir.get("supplier_id") == supplier_id and pir.get("material_id") == material_id:
                return pir
        return None

    def get_countries(self) -> List[Dict[str, Any]]:
        return self._cache.get("country_information.json", [])

    def get_currencies(self) -> List[Dict[str, Any]]:
        return self._cache.get("currency_information.json", [])


class FutureSAPProvider(DataProvider):
    """
    Architectural abstraction for future SAP S/4HANA integration.
    Will connect via SAP BTP Integration Suite / Cloud Connector / OData V4 services:
    - API_BUSINESS_PARTNER
    - API_PURCHASEORDER_PROCESS_SRV
    - API_PURCHASING_CONTRACT_SRV
    - API_PURCHASE_REQUISITION
    - Quality Management Notification APIs
    """
    def __init__(self, destination_name: str = "S4HANA_PRD"):
        self.destination_name = destination_name

    def _not_connected(self):
        raise NotImplementedError("FutureSAPProvider is an architectural placeholder. Connect S/4HANA BTP Destination.")

    def get_suppliers(self): self._not_connected()
    def get_supplier_by_id(self, supplier_id: str): self._not_connected()
    def get_materials(self): self._not_connected()
    def get_material_by_id(self, material_id: str): self._not_connected()
    def get_plants(self): self._not_connected()
    def get_contracts(self, supplier_id=None, material_id=None): self._not_connected()
    def get_pushed_pos(self, supplier_id=None, material_id=None): self._not_connected()
    def get_goods_receipts(self, supplier_id=None, material_id=None): self._not_connected()
    def get_quality_records(self, supplier_id=None, material_id=None): self._not_connected()
    def get_invoices(self, supplier_id=None): self._not_connected()
    def get_price_history(self, supplier_id=None, material_id=None): self._not_connected()
    def get_quotations(self, material_id=None, rfq_number=None): self._not_connected()
    def get_risk_events(self, supplier_id=None): self._not_connected()
    def get_requirements(self): self._not_connected()
    def get_scenarios(self): self._not_connected()
    def get_quota_arrangements(self, material_id=None): self._not_connected()
    def get_source_list(self, material_id=None): self._not_connected()
    def get_puchase_info_records(self, material_id=None): self._not_connected()
    def reload_data(self): pass


class FutureS21Provider(DataProvider):
    """
    Architectural abstraction for future internal S21 enterprise system integration.
    Feeds proprietary plant-level scheduling, work center capacities, and telemetry.
    """
    def __init__(self, endpoint_url: str = ""):
        self.endpoint_url = endpoint_url

    def _not_connected(self):
        raise NotImplementedError("FutureS21Provider is an architectural placeholder for internal S21 integration.")

    def get_suppliers(self): self._not_connected()
    def get_supplier_by_id(self, supplier_id: str): self._not_connected()
    def get_materials(self): self._not_connected()
    def get_material_by_id(self, material_id: str): self._not_connected()
    def get_plants(self): self._not_connected()
    def get_contracts(self, supplier_id=None, material_id=None): self._not_connected()
    def get_pushed_pos(self, supplier_id=None, material_id=None): self._not_connected()
    def get_goods_receipts(self, supplier_id=None, material_id=None): self._not_connected()
    def get_quality_records(self, supplier_id=None, material_id=None): self._not_connected()
    def get_invoices(self, supplier_id=None): self._not_connected()
    def get_price_history(self, supplier_id=None, material_id=None): self._not_connected()
    def get_quotations(self, material_id=None, rfq_number=None): self._not_connected()
    def get_risk_events(self, supplier_id=None): self._not_connected()
    def get_requirements(self): self._not_connected()
    def get_scenarios(self): self._not_connected()
    def get_quota_arrangements(self, material_id=None): self._not_connected()
    def get_source_list(self, material_id=None): self._not_connected()
    def get_puchase_info_records(self, material_id=None): self._not_connected()
    def reload_data(self): pass


# Singleton DataProvider provider instance
_provider_instance: Optional[MockDataProvider] = None

def get_data_provider() -> MockDataProvider:
    global _provider_instance
    if _provider_instance is None:
        _provider_instance = MockDataProvider()
    return _provider_instance
