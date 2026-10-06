/**
 * Typed API Client for SAP Supplier Decision Intelligence Platform.
 */

import {
  ProcurementRequirement,
  DecisionResult,
  ScenarioDefinition,
  DecisionAuditRecord,
  Supplier,
  EvidencePackage
} from '../types';

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Overview & Analytics
  getOverviewKpis: async () => {
    const res = await fetch(`${BASE_URL}/analytics/overview`);
    return handleResponse<any>(res);
  },

  getSpendAnalytics: async () => {
    const res = await fetch(`${BASE_URL}/analytics/spend`);
    return handleResponse<any>(res);
  },

  getSupplierPerformanceAnalytics: async () => {
    const res = await fetch(`${BASE_URL}/analytics/suppliers`);
    return handleResponse<any>(res);
  },

  getPriceIntelligence: async (materialId?: string) => {
    const url = materialId ? `${BASE_URL}/analytics/prices?material_id=${materialId}` : `${BASE_URL}/analytics/prices`;
    const res = await fetch(url);
    return handleResponse<any>(res);
  },

  getDeliveryIntelligence: async () => {
    const res = await fetch(`${BASE_URL}/analytics/delivery`);
    return handleResponse<any>(res);
  },

  getQualityIntelligence: async () => {
    const res = await fetch(`${BASE_URL}/analytics/quality`);
    return handleResponse<any>(res);
  },

  getContractIntelligence: async () => {
    const res = await fetch(`${BASE_URL}/analytics/contracts`);
    return handleResponse<any>(res);
  },

  getRiskIntelligence: async () => {
    const res = await fetch(`${BASE_URL}/analytics/risk`);
    return handleResponse<any>(res);
  },

  getMaterialIntelligence: async (materialId?: string) => {
    const url = materialId ? `${BASE_URL}/analytics/materials?material_id=${materialId}` : `${BASE_URL}/analytics/materials`;
    const res = await fetch(url);
    return handleResponse<any>(res);
  },

  getPlantIntelligence: async (plantId?: string) => {
    const url = plantId ? `${BASE_URL}/analytics/plants?plant_id=${plantId}` : `${BASE_URL}/analytics/plants`;
    const res = await fetch(url);
    return handleResponse<any>(res);
  },

  // Requirements
  getRequirements: async () => {
    const res = await fetch(`${BASE_URL}/requirements`);
    return handleResponse<ProcurementRequirement[]>(res);
  },

  getRequirement: async (id: string) => {
    const res = await fetch(`${BASE_URL}/requirements/${id}`);
    return handleResponse<ProcurementRequirement>(res);
  },

  // Decision & Analysis
  analyzeDecision: async (requirement: ProcurementRequirement, customWeights?: Record<string, number>) => {
    const res = await fetch(`${BASE_URL}/decision/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirement, custom_weights: customWeights })
    });
    return handleResponse<DecisionResult>(res);
  },

  simulateWhatIf: async (
    requirement: ProcurementRequirement,
    newWeights: Record<string, number>,
    previousTopSupplierId?: string
  ) => {
    const res = await fetch(`${BASE_URL}/decision/what-if`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requirement,
        new_weights: newWeights,
        previous_top_supplier_id: previousTopSupplierId
      })
    });
    return handleResponse<DecisionResult>(res);
  },

  saveDecision: async (
    requirement: ProcurementRequirement,
    recommendedOption: any,
    weightsApplied: Record<string, number>,
    userAction?: string,
    userNotes?: string
  ) => {
    const res = await fetch(`${BASE_URL}/decision/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requirement,
        recommended_option: recommendedOption,
        weights_applied: weightsApplied,
        user_action: userAction,
        user_notes: userNotes
      })
    });
    return handleResponse<any>(res);
  },

  stressTestDecision: async (requirement: any, customWeights?: Record<string, number>) => {
    const res = await fetch(`${BASE_URL}/decision/stress-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirement, custom_weights: customWeights })
    });
    return handleResponse<any>(res);
  },

  simulateSupplierFailure: async (requirement: any, failedSupplierId: string) => {
    const res = await fetch(`${BASE_URL}/decision/supplier-failure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirement, failed_supplier_id: failedSupplierId })
    });
    return handleResponse<any>(res);
  },

  getMaterialAlternatives: async (materialId: string, plantId?: string) => {
    const url = plantId
      ? `${BASE_URL}/decision/alternatives?material_id=${materialId}&plant_id=${plantId}`
      : `${BASE_URL}/decision/alternatives?material_id=${materialId}`;
    const res = await fetch(url);
    return handleResponse<any[]>(res);
  },

  // Suppliers
  getSuppliers: async (materialId?: string) => {
    const url = materialId ? `${BASE_URL}/suppliers?material_id=${materialId}` : `${BASE_URL}/suppliers`;
    const res = await fetch(url);
    return handleResponse<Supplier[]>(res);
  },

  getSupplier360: async (supplierId: string, materialId?: string) => {
    const url = materialId ? `${BASE_URL}/suppliers/${supplierId}?material_id=${materialId}` : `${BASE_URL}/suppliers/${supplierId}`;
    const res = await fetch(url);
    return handleResponse<any>(res);
  },

  getSupplierEvidence: async (supplierId: string, materialId: string) => {
    const res = await fetch(`${BASE_URL}/suppliers/${supplierId}/evidence/${materialId}`);
    return handleResponse<EvidencePackage>(res);
  },

  // Scenarios
  getScenarios: async () => {
    const res = await fetch(`${BASE_URL}/scenarios`);
    return handleResponse<ScenarioDefinition[]>(res);
  },

  runScenario: async (scenarioId: string) => {
    const res = await fetch(`${BASE_URL}/scenarios/${scenarioId}/run`, {
      method: 'POST'
    });
    return handleResponse<any>(res);
  },

  // Decision History
  getDecisionHistory: async () => {
    const res = await fetch(`${BASE_URL}/history`);
    return handleResponse<DecisionAuditRecord[]>(res);
  },

  getDecisionTrace: async (id: string) => {
    const res = await fetch(`${BASE_URL}/history/${id}`);
    return handleResponse<any>(res);
  },

  getProcurementMemory: async () => {
    const res = await fetch(`${BASE_URL}/history/memory`);
    return handleResponse<any>(res);
  },

  recordDecisionOutcome: async (decisionId: string, outcomeData: any) => {
    const res = await fetch(`${BASE_URL}/history/${decisionId}/outcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(outcomeData)
    });
    return handleResponse<any>(res);
  },

  getProcurementAnomalies: async () => {
    const res = await fetch(`${BASE_URL}/analytics/anomalies`);
    return handleResponse<any>(res);
  },

  getWhatChanged: async () => {
    const res = await fetch(`${BASE_URL}/analytics/what-changed`);
    return handleResponse<any>(res);
  },

  getPredictiveForecasts: async (materialId?: string, supplierId?: string) => {
    let url = `${BASE_URL}/analytics/forecasts`;
    const params = [];
    if (materialId) params.push(`material_id=${materialId}`);
    if (supplierId) params.push(`supplier_id=${supplierId}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    const res = await fetch(url);
    return handleResponse<any>(res);
  },

  // Data Explorer
  getDatasetsList: async () => {
    const res = await fetch(`${BASE_URL}/explorer/datasets`);
    return handleResponse<any[]>(res);
  },

  getDatasetRecords: async (filename: string, page: number = 1, pageSize: number = 25, search?: string) => {
    let url = `${BASE_URL}/explorer/dataset/${filename}?page=${page}&page_size=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const res = await fetch(url);
    return handleResponse<any>(res);
  },

  getKnowledgeGraph: async (entityType?: string, entityId?: string, depth: number = 2) => {
    let url = `${BASE_URL}/explorer/knowledge-graph?depth=${depth}`;
    if (entityType) url += `&entity_type=${encodeURIComponent(entityType)}`;
    if (entityId) url += `&entity_id=${encodeURIComponent(entityId)}`;
    const res = await fetch(url);
    return handleResponse<any>(res);
  },

  // Decision Twin
  getDecisionTwin: async (requirement: any, customWeights?: Record<string, number>, simParams?: Record<string, any>) => {
    const res = await fetch(`${BASE_URL}/decision/twin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirement, custom_weights: customWeights, simulation_parameters: simParams })
    });
    return handleResponse<any>(res);
  },

  getDecisionTwinById: async (requirementId: string) => {
    const res = await fetch(`${BASE_URL}/decision/twin/${requirementId}`);
    return handleResponse<any>(res);
  },

  getDecisionSensitivityMatrix: async (requirement: any, baseWeights?: Record<string, number>) => {
    const res = await fetch(`${BASE_URL}/decision/sensitivity-matrix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirement, base_weights: baseWeights })
    });
    return handleResponse<any>(res);
  },

  simulateConcentrationShock: async (materialId: string, plantId: string, capacityDropPct: number = 20.0) => {
    const res = await fetch(`${BASE_URL}/decision/concentration-simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        material_id: materialId,
        plant_id: plantId,
        capacity_drop_pct: capacityDropPct
      })
    });
    return handleResponse<any>(res);
  },

  // Leakage & Early Warning Analytics
  getProcurementLeakage: async () => {
    const res = await fetch(`${BASE_URL}/analytics/leakage`);
    return handleResponse<any>(res);
  },

  getEarlyWarnings: async () => {
    const res = await fetch(`${BASE_URL}/analytics/early-warning`);
    return handleResponse<any>(res);
  },

  getAttentionCenter: async () => {
    const res = await fetch(`${BASE_URL}/analytics/attention-center`);
    return handleResponse<any>(res);
  },

  // System & Health
  getSystemHealth: async () => {
    const res = await fetch(`${BASE_URL}/system/health`);
    return handleResponse<any>(res);
  },

  reloadSystemData: async () => {
    const res = await fetch(`${BASE_URL}/system/reload`, { method: 'POST' });
    return handleResponse<any>(res);
  },

  // AI Assistant
  askAssistant: async (query: string, context?: any) => {
    const res = await fetch(`${BASE_URL}/assistant/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, context })
    });
    return handleResponse<any>(res);
  },

  investigateIssue: async (query: string, context?: any) => {
    const res = await fetch(`${BASE_URL}/assistant/investigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, context })
    });
    return handleResponse<any>(res);
  }
};
