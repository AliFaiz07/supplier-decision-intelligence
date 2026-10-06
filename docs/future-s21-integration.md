# Future S21 Integration Architecture

## 1. Overview of S21 Integration

In addition to standard SAP S/4HANA core procurement data, enterprise manufacturing environments frequently operate specialized supply chain execution and supplier communication layers such as **S21** (custom shop-floor replenishment, direct supplier EDI dispatch, and advanced Kanban fulfillment systems).

This specification details the adapter architecture required to integrate S21 streaming signals alongside standard SAP procurement master data.

---

## 2. Canonical Data Model Mapping

The system utilizes an abstract `DataProvider` interface. To incorporate S21 data streams, an `S21DataProvider` adapter normalizes S21-specific payload formats into the platform's Canonical Procurement Data Model:

```text
+-------------------------+          +-------------------------+
|    SAP S/4HANA Core     |          |       S21 System        |
|  (BAPIs / OData APIs)   |          |  (EDI / REST / Webhook) |
+-------------------------+          +-------------------------+
             │                                    │
             ▼                                    ▼
+-------------------------+          +-------------------------+
|     SAPDataProvider     |          |     S21DataProvider     |
+-------------------------+          +-------------------------+
             │                                    │
             └──────────────────┬─────────────────┘
                                │
                                ▼
               +----------------------------------+
               |  Canonical Data Provider Aggregator
               +----------------------------------+
                                │
                                ▼
               +----------------------------------+
               |    Decision Intelligence Engine  |
               +----------------------------------+
```

---

## 3. S21 Telemetry Signal Types

1. **Real-Time Kanban Dispatch Signals**: Granular replenishment trigger events enabling near-instantaneous lead time tracking.
2. **Advance Shipping Notices (ASN) with GPS / Carrier Telemetry**: Enhances delivery predictability beyond static PO delivery dates.
3. **Supplier Capacity Utilization Feeds**: Real-time visibility into supplier production line loading, enabling pre-emptive warning before a vendor accepts an order exceeding physical capacity.
4. **Dock Receipt Inspection Timestamps**: Precise dock-to-stock duration logging, isolating logistics carrier delays from vendor manufacturing lead time.

---

## 4. Security & Data Sovereignty

* **SAP Business Technology Platform (BTP) Destination Service**: Secure tunneling from on-premise S21 instances using Cloud Connector.
* **Mutual TLS (mTLS) Authentication**: Cryptographic verification of all outbound EDI/REST telemetry exchanges.
* **Audit Trail**: Every data packet ingested from S21 is stamped with an immutable source hash and receipt timestamp.
