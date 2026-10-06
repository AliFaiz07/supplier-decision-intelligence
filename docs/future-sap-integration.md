# Future SAP & S21 Integration Architecture | Enterprise Integration Design

## 1. Executive Integration Strategy

The current Proof of Concept executes against a local **`MockDataProvider`**. However, the domain models and data access interfaces were designed from the ground up to support direct transition to enterprise systems without modifying the core Multi-Criteria Decision Engine.

```
+----------------------------------------------------------------------------------+
|                     CANONICAL PROCUREMENT DOMAIN MODEL                           |
|       (Supplier, Material, Plant, PO, GoodsReceipt, Contract, QM, Risk)          |
+----------------------------------------+-----------------------------------------+
                                         |
               +-------------------------+-------------------------+
               |                                                   |
+--------------v---------------+                   +--------------v---------------+
|    FutureSAPProvider         |                   |    FutureS21Provider         |
|  (SAP S/4HANA & SAP BTP)     |                   | (Internal Plant Capacity)    |
+--------------+---------------+                   +--------------+---------------+
               |                                                  |
+--------------v---------------+                   +--------------v---------------+
| SAP BTP Integration Suite    |                   | Internal S21 Enterprise API  |
| • Cloud Connector            |                   | • Shop floor telemetry       |
| • SAP Event Mesh             |                   | • Work center bottlenecks    |
| • Principal Propagation / SSO|                   | • Line scheduling            |
+--------------+---------------+                   +------------------------------+
               |
+--------------v---------------+
| SAP S/4HANA Private / Cloud  |
| • API_BUSINESS_PARTNER       |
| • API_PURCHASEORDER_PROCESS  |
| • API_PURCHASING_CONTRACT    |
| • API_PURCHASING_INFORECORD  |
| • QM Quality Notifications   |
+------------------------------+
```

---

## 2. SAP S/4HANA Standard API Mappings

When connecting to an SAP S/4HANA landscape (2020+ on-premise, RISE with SAP, or S/4HANA Cloud Public Edition), the `FutureSAPProvider` will consume standard OData V4 services:

| Domain Entity | SAP S/4HANA OData API / CDS View | Service Name | Operations |
|---|---|---|---|
| Supplier Profiles | `API_BUSINESS_PARTNER` | `A_BusinessPartner` / `A_Supplier` | Read supplier master, payment terms, blocking status |
| Purchase Orders | `API_PURCHASEORDER_PROCESS_SRV` | `A_PurchaseOrder` / `A_PurchaseOrderItem` | Read historical order quantities, net prices, release dates |
| Goods Receipts | Material Document API | `A_MaterialDocumentHeader` / `A_MaterialDocumentItem` | Read actual delivery dates, movement type 101, deviations |
| Quality Records | Quality Management API | `A_QualityInspectionLot` / `A_QualityNotification` | Read defect classes, sample sizes, usage decisions |
| Contracts | `API_PURCHASING_CONTRACT_SRV` | `A_PurchasingContract` / `A_PurchasingContractItem` | Read target values, validity horizons, discount conditions |
| Purchasing Info Records | `API_PURCHASING_INFORECORD` | `A_PurchasingInfoRecord` | Read planned delivery lead times, standard lot sizes |
| Source List & Quota | `API_SOURCELIST` | `A_SourceList` / `A_QuotaArrangement` | Verify approved source status and target quota splits |

---

## 3. SAP BTP Connectivity Architecture

The production architecture recommends deploying the decision intelligence backend on **SAP Business Technology Platform (SAP BTP) Cloud Foundry or Kyma runtime**:
- **SAP BTP Destination Service**: Securely manages connection endpoints, mutual TLS (mTLS), and SAP S/4HANA credentials.
- **SAP Cloud Connector**: Bridges on-premise S/4HANA landscapes to BTP without exposing internal IP ranges.
- **SAP Event Mesh**: Subscribes to real-time events (`PurchaseOrder.Created`, `GoodsReceipt.Posted`, `QualityNotification.Created`) to dynamically refresh analytical telemetry.

---

## 4. Internal S21 Integration

The platform includes a dedicated architectural abstraction (`FutureS21Provider`) to interface with proprietary plant scheduling and manufacturing execution systems (S21).
- **Scope**: Ingests real-time plant capacity, machine downtime, and tool wear rates.
- **Integration**: Feeds dynamic capacity limits into the Supplier Eligibility Engine and Quota Allocation Solver to prevent routing orders to bottlenecked facilities.
