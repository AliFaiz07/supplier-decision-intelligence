/**
 * Domain Type Definitions for SAP Supplier Decision Intelligence Platform.
 */

export interface Plant {
  plant_id: string;
  name: string;
  company_code: string;
  purchasing_org: string;
  country: string;
  city: string;
  currency: string;
}

export interface Material {
  material_id: string;
  description: string;
  material_group: string;
  base_uom: string;
  procurement_type: string;
  criticality: string;
  quality_sensitivity: string;
  price_behavior: string;
  standard_lead_time_days: number;
  benchmark_price_eur: number;
  plant_relevance: string[];
  sourcing_strategy: string;
  defect_tolerance_ppm: number;
}

export interface Supplier {
  supplier_id: string;
  name: string;
  country: string;
  city: string;
  status: string; // "Active" | "Inactive" | "Under Evaluation"
  strategic_tier: string;
  payment_terms: string;
  incoterms: string;
  annual_spend_eur: number;
  currency: string;
  risk_rating: string;
  profile_summary: string;
  max_capacity_units_per_month: number;
  established_year: number;
  certifications: string[];
  supported_material_groups: string[];
  metrics?: SupplierMetrics;
}

export interface SupplierMetrics {
  supplier_id: string;
  supplier_name: string;
  status: string;
  total_orders: number;
  total_spend_eur: number;
  total_deliveries: number;
  on_time_delivery_rate_pct: number;
  trailing_90d_otd_pct: number;
  delivery_deteriorated: boolean;
  average_delay_days: number;
  max_delay_days: number;
  quantity_fulfillment_rate_pct: number;
  quality_rejection_rate_pct: number;
  trailing_60d_rejection_pct: number;
  quality_deteriorated: boolean;
  ppm: number;
  quality_notifications_count: number;
  latest_price_eur: number;
  min_historical_price_eur: number;
  max_historical_price_eur: number;
  avg_historical_price_eur: number;
  price_position_pct: number;
  price_band_status: string;
  spend_concentration_pct: number;
  is_concentrated: boolean;
  evidence_sufficient: boolean;
  is_new_supplier: boolean;
  active_risks_count: number;
  has_critical_risk: boolean;
  has_active_contract: boolean;
  has_expiring_contract: boolean;
  active_risks?: any[];
  active_contracts?: any[];
}

export interface ProcurementRequirement {
  requirement_id: string;
  title: string;
  material_id: string;
  quantity: number;
  plant_id: string;
  purchasing_org: string;
  purchasing_group: string;
  required_date: string;
  currency: string;
  business_priority: string; // "Balanced" | "Cost-Focused" | "Delivery-Focused" | "Quality-Critical" | "Risk-Sensitive" | "Contract-Focused"
  selection_mode: string; // "Single Supplier" | "Multi-Supplier Allocation (Quota)"
  quality_criticality: string;
  delivery_criticality: string;
  cost_sensitivity: string;
  max_acceptable_lead_time_days: number;
  preferred_trade_zone: string;
  contract_preference: string;
  associated_scenario_id?: string;
}

export interface EligibilityResult {
  supplier_id: string;
  supplier_name: string;
  eligibility_status: "ELIGIBLE" | "CONDITIONALLY_ELIGIBLE" | "NOT_ELIGIBLE";
  is_eligible: boolean;
  reasons: string[];
  conditions: string[];
}

export interface CostBreakdown {
  supplier_id: string;
  material_id: string;
  order_quantity: number;
  quoted_unit_price_eur: number;
  synthetic_freight_eur: number;
  synthetic_customs_tariff_eur: number;
  contractual_rebate_eur: number;
  effective_unit_cost_eur: number;
  total_effective_cost_eur: number;
  offered_lead_time_days: number;
  disclosure_notes: string;
}

export interface DimensionScores {
  price_score: number;
  delivery_score: number;
  quality_score: number;
  lead_time_score: number;
  contract_score: number;
  risk_score: number;
}

export interface RankedSupplier {
  supplier_id: string;
  supplier_name: string;
  eligibility_status: string;
  eligibility_conditions: string[];
  country: string;
  strategic_tier: string;
  final_score: number;
  confidence_factor: number;
  evidence_sufficient: boolean;
  dimension_scores: DimensionScores;
  metrics: SupplierMetrics;
  cost_breakdown: CostBreakdown;
  applied_weights: Record<string, number>;
}

export interface QuotaAllocationItem {
  supplier_id: string;
  supplier_name: string;
  allocation_pct: number;
  allocated_quantity: number;
  effective_unit_cost_eur: number;
  subtotal_cost_eur: number;
  score: number;
}

export interface RecommendedOption {
  mode: "Single Supplier" | "Quota Allocation";
  primary_supplier_id: string;
  primary_supplier_name: string;
  decision_score: number;
  effective_unit_cost_eur: number;
  total_estimated_cost_eur: number;
  offered_lead_time_days: number;
  delivery_reliability_pct: number;
  quality_rejection_rate_pct: number;
  contract_status: string;
  allocation_plan?: QuotaAllocationItem[];
}

export interface TradeOffAnalysis {
  runner_up_id?: string;
  runner_up_name?: string;
  runner_up_score?: number;
  score_differential?: number;
  price_differential_eur?: number;
  delivery_differential_otd_pct?: number;
  quality_differential_rejection_pct?: number;
  summary?: string;
}

export interface AIExplanation {
  headline: string;
  decision_summary: string;
  key_strengths: string[];
  identified_risks_and_mitigations: string[];
  comparative_rationale: string;
  disclosure: string;
}

export interface EvidencePackage {
  supplier_id: string;
  material_id: string;
  purchase_orders: {
    source: string;
    period: string;
    records_analyzed: number;
    total_spend_eur: number;
    sample_records: any[];
  };
  goods_receipts: {
    source: string;
    records_analyzed: number;
    on_time_deliveries: number;
    on_time_delivery_rate_pct: number;
    average_delay_days: number;
    sample_deliveries: any[];
  };
  quality_records: {
    source: string;
    inspection_lots_analyzed: number;
    total_inspected_quantity: number;
    total_defective_quantity: number;
    rejection_rate_pct: number;
    ppm: number;
    sample_inspection_lots: any[];
  };
  contracts: {
    source: string;
    active_contracts: any[];
  };
  quotation: {
    source: string;
    quotation_id: string;
    quoted_price_eur: number;
    offered_lead_time_days: number;
    valid_until: string;
    notes: string;
  };
  risk_signals: {
    source: string;
    active_events_count: number;
    events: any[];
  };
}

export interface DecisionResult {
  requirement: ProcurementRequirement;
  weights: Record<string, number>;
  ranked_suppliers: RankedSupplier[];
  recommended_option: RecommendedOption;
  trade_off_analysis: TradeOffAnalysis;
  decision_trace: {
    model_version: string;
    weights_used: Record<string, number>;
    evaluated_supplier_count: number;
    scoring_matrix: any[];
  };
  eligibility_summary: {
    all_results: EligibilityResult[];
    eligible: EligibilityResult[];
    conditionally_eligible: EligibilityResult[];
    not_eligible: EligibilityResult[];
    total_suppliers_evaluated: number;
    total_eligible_or_conditional: number;
  };
  evidence_package?: EvidencePackage;
  ai_explanation?: AIExplanation;
  sensitivity_analysis?: {
    dimension: string;
    dimension_label: string;
    direction: string;
    threshold_weight_pct: number;
    overtaking_supplier_id: string;
    overtaking_supplier_name: string;
    insight: string;
  }[];
  projected_concentration?: {
    scope: string;
    current_spend_eur: number;
    current_concentration_pct: number;
    requirement_spend_eur: number;
    projected_spend_eur: number;
    projected_concentration_pct: number;
    is_concentration_risk: boolean;
    alert_message: string;
  };
  what_if_analysis?: {
    weights_applied: Record<string, number>;
    previous_top_supplier_id?: string;
    new_top_supplier_id: string;
    recommendation_changed: boolean;
    explanation: string;
  };
}

export interface ScenarioDefinition {
  scenario_id: string;
  scenario_number: number;
  title: string;
  description: string;
  recommended_priority: string;
  weights: Record<string, number>;
  requirement_id: string;
  key_trade_off: string;
}

export interface DecisionAuditRecord {
  decision_id: string;
  timestamp: string;
  material_id: string;
  material_description: string;
  quantity: number;
  plant_id: string;
  scenario: string;
  weights_applied: Record<string, number>;
  recommended_supplier_id: string;
  recommended_supplier_name: string;
  decision_score: number;
  effective_unit_cost_eur: number;
  total_cost_eur: number;
  status: string;
  action_taken: string;
  user_notes: string;
}

export interface DecisionTwinSupplier {
  supplier_id: string;
  supplier_name: string;
  country: string;
  strategic_tier: string;
  eligibility_status: string;
  eligibility_conditions: string[];
  composite_score: number;
  rank: number;
  commercial: {
    quoted_unit_price_eur: number;
    effective_unit_cost_eur: number;
    total_effective_cost_eur: number;
    has_active_contract: boolean;
    contract_id?: string;
    contract_price_eur?: number;
    contract_valid_to?: string;
    freight_unit_cost_eur: number;
    tariff_cost_eur: number;
    discount_rebate_unit_eur: number;
  };
  delivery: {
    otd_rate_pct: number;
    average_delay_days: number;
    planned_lead_time_days: number;
    delivery_trajectory: string;
  };
  quality: {
    rejection_rate_pct: number;
    ppm: number;
    quality_trajectory: string;
  };
  risk_and_capacity: {
    risk_rating: string;
    practical_capacity_ea: number;
    capacity_utilization_pct: number;
    is_capacity_constrained: boolean;
    current_concentration_pct: number;
    active_risks_count: number;
  };
  dimension_scores: DimensionScores;
}

export interface DecisionTwin {
  twin_id: string;
  status: string;
  timestamp: string;
  context_requirement: {
    requirement_id: string;
    material_id: string;
    material_name: string;
    material_group: string;
    base_unit: string;
    plant_id: string;
    plant_name: string;
    plant_location: string;
    order_quantity: number;
    required_date: string;
    business_priority: string;
    selection_mode: string;
  };
  market_and_history_corridor: {
    historical_min_price_eur: number;
    historical_avg_price_eur: number;
    historical_max_price_eur: number;
    volatility_score: string;
    reference_currency: string;
  };
  applied_decision_weights: Record<string, number>;
  eligible_suppliers: DecisionTwinSupplier[];
  active_recommendation: RecommendedOption;
  trade_off_vs_runner_up: TradeOffAnalysis;
  evidence_package?: EvidencePackage;
  scenario_sensitivity_matrix: {
    scenario_name: string;
    weights: Record<string, number>;
    winner_supplier_id: string;
    winner_supplier_name: string;
    decision_score: number;
    effective_unit_cost_eur: number;
  }[];
  stress_test_telemetry: {
    robustness_score_pct: number;
    robustness_rating: string;
    stable_tests_count: number;
    total_tests_count: number;
    top_vulnerabilities: string[];
  };
  what_would_change_thresholds: {
    dimension: string;
    dimension_label: string;
    direction: string;
    threshold_weight_pct: number;
    overtaking_supplier_id: string;
    overtaking_supplier_name: string;
    insight: string;
  }[];
  assumptions_metadata: Record<string, string>;
}

export interface LeakageIncident {
  leakage_id: string;
  category: string;
  severity: "Critical" | "High" | "Medium" | "Informational";
  material_id: string;
  material_name: string;
  supplier_id: string;
  supplier_name: string;
  excess_spend_eur: number;
  unit_discrepancy_eur?: number;
  affected_document: string;
  document_date: string;
  quantity: number;
  root_cause: string;
  recommended_action: string;
  assumption_tag: string;
}

export interface LeakageReport {
  status: string;
  total_leakage_incidents: number;
  total_excess_spend_eur: number;
  category_summary: Record<string, { count: number; total_excess_spend_eur: number }>;
  material_leakage_summary: {
    material_id: string;
    material_name: string;
    incidents_count: number;
    total_leakage_eur: number;
    primary_leakage_type: string;
  }[];
  leakage_incidents: LeakageIncident[];
  audit_note: string;
}

export interface AttentionCenterItem {
  id: string;
  title: string;
  category: string;
  priority: "Critical" | "High" | "Medium" | "Informational";
  supplier_id: string;
  supplier_name: string;
  material_id: string;
  summary: string;
  metric_highlight: string;
  actions: {
    investigate: boolean;
    compare: boolean;
    simulate: boolean;
    stress_test: boolean;
    view_evidence: boolean;
    investigate_query: string;
    target_tab: string;
    target_subtab?: string;
    target_id?: string;
  };
}

export interface AttentionCenterReport {
  status: string;
  total_attention_items: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  informational_count: number;
  items: AttentionCenterItem[];
}

export interface EarlyWarningSignal {
  supplier_id: string;
  supplier_name: string;
  severity: "Critical" | "High" | "Medium";
  active_signals_count: number;
  price_signal: boolean;
  delivery_signal: boolean;
  lead_time_signal: boolean;
  quality_signal: boolean;
  ai_pattern_explanation: string;
  recommended_hedge: string;
  action_links: {
    material_id: string;
    investigate_query: string;
  };
}

export interface DecisionSensitivityGridCell {
  cost_level: string;
  delivery_level: string;
  cost_weight: number;
  delivery_weight: number;
  preferred_supplier_id: string;
  preferred_supplier_name: string;
  score: number;
}

export interface DecisionSensitivityMatrix {
  cost_levels: string[];
  delivery_levels: string[];
  grid: DecisionSensitivityGridCell[][];
}

export interface ConcentrationShockResult {
  material_id: string;
  plant_id: string;
  capacity_drop_pct: number;
  current_concentration: {
    supplier_id: string;
    supplier_name: string;
    spend_eur: number;
    share_pct: number;
  }[];
  shocked_supplier_id: string;
  shocked_supplier_name: string;
  baseline_capacity_ea: number;
  reduced_capacity_ea: number;
  spillover_quantity: number;
  absorbed_quantity: number;
  capacity_gap: number;
  additional_cost_eur: number;
  reallocation_plan: {
    supplier_id: string;
    supplier_name: string;
    absorbed_quantity: number;
    effective_unit_cost_eur: number;
  }[];
  delivery_impact: string;
  risk_assessment: string;
}

export interface StructuredInvestigation {
  investigation_id: string;
  query: string;
  status: string;
  target_material_id: string;
  target_material_name: string;
  target_supplier_id: string;
  target_supplier_name: string;
  structured_findings: {
    finding: string;
    primary_driver: string;
    secondary_driver: string;
    operational_impact: string;
    risk_exposure: string;
    suggested_next_analysis: string;
  };
  supporting_evidence: {
    purchase_orders_analyzed_count: number;
    goods_receipts_analyzed_count: number;
    quality_lots_analyzed_count: number;
    contracts_reviewed_count: number;
    citations: string[];
  };
  answer: string;
  suggested_actions: string[];
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: string;
  properties: Record<string, any>;
}

export interface KnowledgeGraphEdge {
  source: string;
  target: string;
  relationship: string;
  label: string;
}

export interface KnowledgeGraphData {
  graph_name: string;
  node_count: number;
  edge_count: number;
  entity_types: string[];
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

