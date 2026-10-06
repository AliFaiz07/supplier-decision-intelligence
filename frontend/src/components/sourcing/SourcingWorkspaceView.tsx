import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  ProcurementRequirement,
  DecisionResult,
  RankedSupplier
} from '../../types';
import { DEFAULT_REQUIREMENTS } from '../../data/defaultRequirements';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { PageHeader } from '../common/PageHeader';
import { BackNavigation } from '../common/BackNavigation';
import { DecisionStressTestView } from '../decisions/DecisionStressTestView';
import { DecisionEvidenceGraphView } from './DecisionEvidenceGraphView';
import { DecisionTwinView } from './DecisionTwinView';
import {
  LayersIcon,
  CheckIcon,
  AlertTriangleIcon,
  SlidersIcon,
  FileTextIcon,
  ScaleIcon,
  ShieldAlertIcon,
  BuildingIcon,
  ChevronDownIcon,
  ActivityIcon,
  ChatIcon,
  AlertOctagonIcon
} from '../common/Icons';

interface SourcingWorkspaceViewProps {
  initialRequirementId?: string;
  onNavigateToSupplier360: (supplierId: string) => void;
  onNavigateToHistory: () => void;
  onOpenAssistantWithQuery?: (query: string, context?: any) => void;
  onOpenSupplierDrawer?: (supplierId: string) => void;
}

export const SourcingWorkspaceView: React.FC<SourcingWorkspaceViewProps> = ({
  initialRequirementId = 'REQ-001',
  onNavigateToSupplier360,
  onNavigateToHistory,
  onOpenAssistantWithQuery,
  onOpenSupplierDrawer
}) => {
  const initialMatch = DEFAULT_REQUIREMENTS.find((r) => r.requirement_id === initialRequirementId) || DEFAULT_REQUIREMENTS[0];
  const [requirements, setRequirements] = useState<ProcurementRequirement[]>(DEFAULT_REQUIREMENTS);
  const [selectedReqId, setSelectedReqId] = useState<string>(initialRequirementId);
  const [activeReq, setActiveReq] = useState<ProcurementRequirement | null>(initialMatch);
  const [backendOffline, setBackendOffline] = useState<boolean>(false);
  const [backendErrorMsg, setBackendErrorMsg] = useState<string | null>(null);

  // Editable requirement fields
  const [reqQuantity, setReqQuantity] = useState<number>(initialMatch.quantity);
  const [reqPlant, setReqPlant] = useState<string>(initialMatch.plant_id);
  const [reqDate, setReqDate] = useState<string>(initialMatch.required_date);
  const [reqPriority, setReqPriority] = useState<string>(initialMatch.business_priority || 'Balanced');
  const [reqMode, setReqMode] = useState<string>(initialMatch.selection_mode || 'Single Supplier');

  // Progressive Disclosure for Advanced Sourcing Constraints
  const [showAdvancedParams, setShowAdvancedParams] = useState<boolean>(false);
  const [showAllCandidates, setShowAllCandidates] = useState<boolean>(false);
  const [showAIExplanationDetails, setShowAIExplanationDetails] = useState<boolean>(false);
  const [reqMaxDefectRate, setReqMaxDefectRate] = useState<number>(2.0);
  const [reqLeadTimeMax, setReqLeadTimeMax] = useState<number>(30);
  const [reqDeliveryToleranceDays, setReqDeliveryToleranceDays] = useState<number>(3);
  const [inlineAiQuestion, setInlineAiQuestion] = useState<string>('');

  // Engine state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [decisionResult, setDecisionResult] = useState<DecisionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'recommendation' | 'twin' | 'evidence' | 'whatif' | 'eligibility' | 'stresstest' | 'trace'>('recommendation');

  // What-If weights state
  const [whatIfWeights, setWhatIfWeights] = useState<Record<string, number>>({
    price: 25,
    delivery: 25,
    quality: 20,
    lead_time: 15,
    contract: 10,
    risk: 5
  });
  const [isWhatIfRunning, setIsWhatIfRunning] = useState<boolean>(false);
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  // Load live requirements on mount
  useEffect(() => {
    loadRequirements();
  }, []);

  // Sync if initialRequirementId prop changes
  useEffect(() => {
    if (initialRequirementId && initialRequirementId !== selectedReqId) {
      handleSelectRequirement(initialRequirementId);
    }
  }, [initialRequirementId]);

  const loadRequirements = async () => {
    try {
      const reqs = await api.getRequirements();
      if (reqs && reqs.length > 0) {
        setRequirements(reqs);
        setBackendOffline(false);
        setBackendErrorMsg(null);
        const found = reqs.find((r) => r.requirement_id === selectedReqId) || reqs[0];
        setActiveReq(found);
        runInitialAnalysis(found);
      }
    } catch (err: any) {
      console.warn('Backend unavailable, operating in pre-configured mode:', err);
      setBackendOffline(true);
      setBackendErrorMsg(err?.message || 'Connection refused to backend API on port 8000');
      // Ensure activeReq is populated from default requirements
      const fallbackReq = DEFAULT_REQUIREMENTS.find((r) => r.requirement_id === selectedReqId) || DEFAULT_REQUIREMENTS[0];
      setActiveReq(fallbackReq);
    }
  };

  const handleSelectRequirement = (reqId: string) => {
    setSelectedReqId(reqId);
    const targetList = requirements.length > 0 ? requirements : DEFAULT_REQUIREMENTS;
    const match = targetList.find((r) => r.requirement_id === reqId) || targetList[0];
    if (match) {
      setActiveReq(match);
      setReqQuantity(match.quantity);
      setReqPlant(match.plant_id);
      setReqDate(match.required_date);
      setReqPriority(match.business_priority || 'Balanced');
      setReqMode(match.selection_mode || 'Single Supplier');
      // Automatically run analysis if backend is online, or attempt
      runInitialAnalysis(match);
    }
  };

  const runInitialAnalysis = async (req: ProcurementRequirement) => {
    setIsAnalyzing(true);
    try {
      const result = await api.analyzeDecision(req);
      setDecisionResult(result);
      setBackendOffline(false);
      setBackendErrorMsg(null);
      if (result.weights) {
        setWhatIfWeights({
          price: Math.round(result.weights.price * 100),
          delivery: Math.round(result.weights.delivery * 100),
          quality: Math.round(result.weights.quality * 100),
          lead_time: Math.round(result.weights.lead_time * 100),
          contract: Math.round(result.weights.contract * 100),
          risk: Math.round(result.weights.risk * 100)
        });
      }
    } catch (err: any) {
      console.warn('Initial analysis could not connect to backend:', err);
      setBackendOffline(true);
      setBackendErrorMsg(err?.message || 'Could not connect to FastAPI decision engine on http://127.0.0.1:8000');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!activeReq) return;
    setIsAnalyzing(true);
    setSavedNotification(null);

    const composedReq: ProcurementRequirement = {
      ...activeReq,
      quantity: reqQuantity,
      plant_id: reqPlant,
      required_date: reqDate,
      business_priority: reqPriority,
      selection_mode: reqMode
    };

    try {
      const result = await api.analyzeDecision(composedReq);
      setDecisionResult(result);
      if (result.weights) {
        // sync what-if sliders to result weights
        setWhatIfWeights({
          price: Math.round(result.weights.price * 100),
          delivery: Math.round(result.weights.delivery * 100),
          quality: Math.round(result.weights.quality * 100),
          lead_time: Math.round(result.weights.lead_time * 100),
          contract: Math.round(result.weights.contract * 100),
          risk: Math.round(result.weights.risk * 100)
        });
      }
      setActiveTab('recommendation');
    } catch (err: any) {
      alert(`Decision engine error: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSimulateWhatIf = async () => {
    if (!decisionResult) return;
    setIsWhatIfRunning(true);

    const normalizedWeights: Record<string, number> = {
      price: whatIfWeights.price / 100,
      delivery: whatIfWeights.delivery / 100,
      quality: whatIfWeights.quality / 100,
      lead_time: whatIfWeights.lead_time / 100,
      contract: whatIfWeights.contract / 100,
      risk: whatIfWeights.risk / 100
    };

    try {
      const prevTop = decisionResult.recommended_option?.primary_supplier_id;
      const updated = await api.simulateWhatIf(decisionResult.requirement, normalizedWeights, prevTop);
      setDecisionResult(updated);
    } catch (err: any) {
      alert(`What-If error: ${err.message}`);
    } finally {
      setIsWhatIfRunning(false);
    }
  };

  const handleSaveDecision = async () => {
    if (!decisionResult) return;
    try {
      await api.saveDecision(
        decisionResult.requirement,
        decisionResult.recommended_option,
        decisionResult.weights,
        'Approved by User',
        `Evaluated via Sourcing Workspace with score ${decisionResult.recommended_option.decision_score}`
      );
      setSavedNotification('Decision successfully recorded in Decision History audit log.');
      setTimeout(() => setSavedNotification(null), 5000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Standard SAP PageHeader answering: "Which supplier should I consider?" */}
      <PageHeader
        title="Sourcing Workspace"
        subtitle="Which supplier provides the best balance of cost, delivery, and quality?"
        breadcrumbs={[
          { label: 'Supplier Decision Intelligence' },
          { label: 'Sourcing Workspace' },
          { label: selectedReqId }
        ]}
        badges={[
          { label: activeReq?.material_id ? `${activeReq.material_id} (${reqQuantity.toLocaleString()} Units)` : 'Requirement', variant: 'info' },
          { label: `Plant ${reqPlant}`, variant: 'neutral' },
          { label: `${reqPriority} Priority`, variant: 'info' }
        ]}
        actions={
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="sap-btn sap-btn-primary text-xs space-x-1.5 shadow-sm"
          >
            <SlidersIcon className="w-3.5 h-3.5" />
            <span>{isAnalyzing ? 'Evaluating...' : 'Re-Run Decision Engine'}</span>
          </button>
        }
        onAskAI={() => onOpenAssistantWithQuery && onOpenAssistantWithQuery(`Analyze sourcing options for ${selectedReqId}`)}
      />

      {/* Step 1: Procurement Requirement Selection Bar */}
      <div className="sap-card p-4">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#edf0f3]">
          <div className="flex items-center space-x-2.5">
            <span className="w-5 h-5 rounded-full bg-[#0070f2] text-white flex items-center justify-center text-xs font-bold">
              1
            </span>
            <h2 className="text-xs font-semibold text-[#1d2d3e] uppercase tracking-wider">
              Procurement Requirement Specification
            </h2>
          </div>
          <span className="text-[11px] text-[#556b82] font-mono">
            SAP PR Reference & Business Constraints
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          {/* Requirement Selector */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-[#556b82]">
                Select Pre-Configured Requirement
              </label>
              {backendOffline && (
                <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-mono">
                  Offline Mode
                </span>
              )}
            </div>
            <select
              value={selectedReqId}
              onChange={(e) => handleSelectRequirement(e.target.value)}
              className="sap-select w-full font-medium"
            >
              {requirements.length === 0 ? (
                <option value={selectedReqId}>{selectedReqId}: Loading...</option>
              ) : (
                requirements.map((r) => (
                  <option key={r.requirement_id} value={r.requirement_id}>
                    {r.requirement_id}: {r.title}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-[11px] font-semibold text-[#556b82] mb-1">
              Quantity (Units)
            </label>
            <input
              type="number"
              value={reqQuantity}
              onChange={(e) => setReqQuantity(Number(e.target.value))}
              className="sap-input w-full font-mono"
            />
          </div>

          {/* Plant */}
          <div>
            <label className="block text-[11px] font-semibold text-[#556b82] mb-1">
              Target Plant
            </label>
            <select
              value={reqPlant}
              onChange={(e) => setReqPlant(e.target.value)}
              className="sap-select w-full"
            >
              <option value="P001">P001 - Munich Assembly</option>
              <option value="P002">P002 - Katowice Works</option>
              <option value="P003">P003 - Linz Works</option>
            </select>
          </div>

          {/* Required Delivery Date */}
          <div>
            <label className="block text-[11px] font-semibold text-[#556b82] mb-1">
              Required Delivery Date
            </label>
            <input
              type="date"
              value={reqDate}
              onChange={(e) => setReqDate(e.target.value)}
              className="sap-input w-full font-mono"
            />
          </div>

          {/* Business Priority */}
          <div>
            <label className="block text-[11px] font-semibold text-[#556b82] mb-1">
              Business Priority
            </label>
            <select
              value={reqPriority}
              onChange={(e) => setReqPriority(e.target.value)}
              className="sap-select w-full"
            >
              <option value="Balanced">Balanced Sourcing</option>
              <option value="Cost-Focused">Cost-Focused</option>
              <option value="Delivery-Focused">Delivery-Focused</option>
              <option value="Quality-Critical">Quality-Critical</option>
              <option value="Risk-Sensitive">Risk-Sensitive</option>
              <option value="Contract-Focused">Contract-Focused</option>
            </select>
          </div>
        </div>

        {/* Progressive Disclosure Toggle */}
        <div className="mt-3 pt-2 flex items-center justify-between border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAdvancedParams(!showAdvancedParams)}
            className="text-xs text-[#0a6ed1] hover:text-[#0854a0] font-medium flex items-center space-x-1"
          >
            <span>{showAdvancedParams ? 'Hide Advanced Constraints & Quality Tolerances' : 'Show Advanced Constraints & Quality Tolerances'}</span>
            <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${showAdvancedParams ? 'transform rotate-180' : ''}`} />
          </button>
          <span className="text-[11px] text-slate-400 font-mono">
            {showAdvancedParams ? 'Custom SAP tolerance thresholds active' : 'Standard dock receipt & tolerance limits'}
          </span>
        </div>

        {/* Collapsible Advanced Parameters */}
        {showAdvancedParams && (
          <div className="mt-3 p-3 bg-[#f8fafc] border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Max Defect Rate Tolerance (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={reqMaxDefectRate}
                onChange={(e) => setReqMaxDefectRate(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-[2px] px-2.5 py-1.5 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:border-[#0a6ed1]"
              />
              <span className="text-[10px] text-slate-400">Rejects above threshold flag quality risk</span>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Max Allowed Lead Time (Days)
              </label>
              <input
                type="number"
                value={reqLeadTimeMax}
                onChange={(e) => setReqLeadTimeMax(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-[2px] px-2.5 py-1.5 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:border-[#0a6ed1]"
              />
              <span className="text-[10px] text-slate-400">Dock receipt deadline limit</span>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Delivery Window Tolerance (± Days)
              </label>
              <input
                type="number"
                value={reqDeliveryToleranceDays}
                onChange={(e) => setReqDeliveryToleranceDays(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-[2px] px-2.5 py-1.5 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:border-[#0a6ed1]"
              />
              <span className="text-[10px] text-slate-400">Acceptable GR window without variance penalty</span>
            </div>
          </div>
        )}

        {/* Second row options: Selection Mode & Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-4 text-xs">
            <span className="text-slate-600 font-medium">Sourcing Mode:</span>
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="radio"
                name="selection_mode"
                checked={reqMode === 'Single Supplier'}
                onChange={() => setReqMode('Single Supplier')}
                className="text-[#0a6ed1]"
              />
              <span className="text-slate-800">Single Supplier</span>
            </label>
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="radio"
                name="selection_mode"
                checked={reqMode === 'Multi-Supplier Allocation (Quota)'}
                onChange={() => setReqMode('Multi-Supplier Allocation (Quota)')}
                className="text-[#0a6ed1]"
              />
              <span className="text-slate-800">Multi-Supplier Allocation (Quota Arrangement)</span>
            </label>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="sap-btn sap-btn-primary text-xs shadow-xs"
          >
            <LayersIcon className="w-3.5 h-3.5" />
            <span>{isAnalyzing ? 'Analyzing Suppliers...' : 'Analyze Suppliers'}</span>
          </button>
        </div>
      </div>

      {/* Processing State */}
      {isAnalyzing && <ProcessingIndicator operation="analyze" />}

      {/* Decision Results Workspace */}
      {decisionResult && !isAnalyzing && (
        <div className="space-y-6">
          {savedNotification && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <CheckIcon className="w-4 h-4 text-emerald-600" />
                <span>{savedNotification}</span>
              </span>
              <button
                onClick={onNavigateToHistory}
                className="underline hover:text-emerald-950 font-medium"
              >
                View History
              </button>
            </div>
          )}

          {/* Back Navigation when drilled into subviews */}
          {activeTab !== 'recommendation' && (
            <BackNavigation
              onBack={() => setActiveTab('recommendation')}
              customLabel="Sourcing Recommendation"
            />
          )}

          {/* Sub-Navigation Tabs as Modern Enterprise Pills */}
          <div className="bg-white border border-[#e2e8f0] p-1.5 flex space-x-1.5 text-xs overflow-x-auto rounded-xl">
            <button
              onClick={() => setActiveTab('recommendation')}
              className={`py-2 px-3.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'recommendation'
                  ? 'bg-[#0066cc] text-white shadow-xs font-semibold'
                  : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#f8fafc]'
              }`}
            >
              Recommendation & AI Explanation
            </button>
            <button
              onClick={() => setActiveTab('twin')}
              className={`py-2 px-3.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'twin'
                  ? 'bg-[#0066cc] text-white shadow-xs font-semibold'
                  : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#f8fafc]'
              }`}
            >
              Procurement Decision Twin
            </button>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`py-2 px-3.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'evidence'
                  ? 'bg-[#0066cc] text-white shadow-xs font-semibold'
                  : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#f8fafc]'
              }`}
            >
              Decision Evidence Graph
            </button>
            <button
              onClick={() => setActiveTab('whatif')}
              className={`py-2 px-3.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'whatif'
                  ? 'bg-[#0066cc] text-white shadow-xs font-semibold'
                  : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#f8fafc]'
              }`}
            >
              What-If Analysis
            </button>
            <button
              onClick={() => setActiveTab('eligibility')}
              className={`py-2 px-3.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'eligibility'
                  ? 'bg-[#0066cc] text-white shadow-xs font-semibold'
                  : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#f8fafc]'
              }`}
            >
              Eligibility Matrix ({decisionResult.eligibility_summary?.total_eligible_or_conditional} Eligible)
            </button>
            <button
              onClick={() => setActiveTab('stresstest')}
              className={`py-2 px-3.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'stresstest'
                  ? 'bg-[#0066cc] text-white shadow-xs font-semibold'
                  : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#f8fafc]'
              }`}
            >
              Decision Stress Testing & Outage
            </button>
            <button
              onClick={() => setActiveTab('trace')}
              className={`py-2 px-3.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'trace'
                  ? 'bg-[#0066cc] text-white shadow-xs font-semibold'
                  : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#f8fafc]'
              }`}
            >
              Decision Trace
            </button>
          </div>

          {/* Tab 1: Recommendation & Alternatives (Answers: "Which supplier should I consider?") */}
          {activeTab === 'recommendation' && (
            <div className="space-y-4">
              {/* LEVEL 1: Primary Answer & Hero Recommendation Card (Decision-First Pattern) */}
              <div className="sap-card p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-[#edf0f3]">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="sap-badge sap-badge-success font-semibold text-[11px]">
                        {decisionResult.recommended_option?.mode === 'Quota Allocation'
                          ? 'Quota Split Recommended'
                          : 'Recommended Option'}
                      </span>
                      <span className="text-[11px] text-[#556b82] font-mono">
                        {decisionResult.requirement?.material_id} • {reqQuantity.toLocaleString()} Units • {reqPlant}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#1d2d3e] mt-1.5 flex items-center space-x-2">
                      <span>{decisionResult.recommended_option?.primary_supplier_name}</span>
                      <span className="text-xs font-mono font-normal text-[#556b82]">
                        ({decisionResult.recommended_option?.primary_supplier_id})
                      </span>
                    </h3>
                    <p className="text-xs text-[#1d2d3e] mt-1.5 max-w-2xl leading-relaxed">
                      {decisionResult.ai_explanation?.decision_summary ||
                        `${decisionResult.recommended_option?.primary_supplier_name} provides the strongest balance between effective cost, delivery reliability, and quality conformance.`}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right bg-[#edf5ff] px-3.5 py-2 rounded border border-[#c4dcfc]">
                      <p className="text-[10px] uppercase tracking-wider text-[#0070f2] font-bold">
                        Decision Score
                      </p>
                      <div className="text-2xl font-bold text-[#0070f2]">
                        {decisionResult.recommended_option?.decision_score}
                        <span className="text-xs font-normal text-[#556b82]"> / 100</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigateToSupplier360(decisionResult.recommended_option.primary_supplier_id)}
                      className="sap-btn sap-btn-secondary text-xs"
                    >
                      Supplier 360
                    </button>
                  </div>
                </div>

                {/* 4 Primary Metrics (Level 1) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                  <div className="bg-[#f5f6f8] border border-[#d9dcdf] rounded p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold text-[#556b82] uppercase">Effective Unit Cost</p>
                      <span className="text-[10px] text-[#556b82]" title="Includes quoted price + freight + expected operational delay/quality cost">ℹ️</span>
                    </div>
                    <p className="text-base font-bold text-[#1d2d3e] mt-0.5 font-mono">
                      €{decisionResult.recommended_option?.effective_unit_cost_eur?.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-[#556b82] font-mono">
                      Total: €{decisionResult.recommended_option?.total_estimated_cost_eur?.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-[#f5f6f8] border border-[#d9dcdf] rounded p-3">
                    <p className="text-[10px] font-semibold text-[#556b82] uppercase">Delivery Reliability</p>
                    <p className="text-base font-bold text-[#1d2d3e] mt-0.5 font-mono">
                      {decisionResult.recommended_option?.delivery_reliability_pct}% OTD
                    </p>
                    <p className="text-[10px] text-[#107e3e] font-medium">30+ Verified GRs</p>
                  </div>

                  <div className="bg-[#f5f6f8] border border-[#d9dcdf] rounded p-3">
                    <p className="text-[10px] font-semibold text-[#556b82] uppercase">Quality Defect Rate</p>
                    <p className="text-base font-bold text-[#1d2d3e] mt-0.5 font-mono">
                      {decisionResult.recommended_option?.quality_rejection_rate_pct}% Rejection
                    </p>
                    <p className="text-[10px] text-[#556b82]">Tolerance ≤ {reqMaxDefectRate}%</p>
                  </div>

                  <div className="bg-[#f5f6f8] border border-[#d9dcdf] rounded p-3">
                    <p className="text-[10px] font-semibold text-[#556b82] uppercase">Contract & Risk</p>
                    <p className="text-xs font-bold text-[#1d2d3e] mt-1 truncate">
                      {decisionResult.recommended_option?.contract_status}
                    </p>
                    <p className="text-[10px] text-[#107e3e] font-medium">Low Disruption Risk</p>
                  </div>
                </div>

                {/* LEVEL 2: Decision Summary Story (WHY, WATCH, WHAT COULD CHANGE THIS) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-[#edf0f3]">
                  {/* WHY */}
                  <div className="bg-[#ffffff] border border-[#d9dcdf] rounded p-3 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[11px] font-bold text-[#1d2d3e] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                        <CheckIcon className="w-3.5 h-3.5 text-[#107e3e]" />
                        <span>Why This Supplier?</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-[#1d2d3e]">
                        {decisionResult.ai_explanation?.key_strengths?.slice(0, 3).map((driver, idx) => (
                          <li key={idx} className="flex items-start space-x-1.5">
                            <span className="text-[#0070f2] font-bold">•</span>
                            <span>{driver}</span>
                          </li>
                        )) || (
                          <>
                            <li className="flex items-start space-x-1.5">
                              <span className="text-[#0070f2] font-bold">•</span>
                              <span>Lowest effective landed cost with volume terms.</span>
                            </li>
                            <li className="flex items-start space-x-1.5">
                              <span className="text-[#0070f2] font-bold">•</span>
                              <span>Stable dock receipts with 96%+ verified reliability.</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* WATCH */}
                  <div className="bg-[#f8fafc] border border-[#d9dcdf] rounded p-3 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[11px] font-bold text-[#556b82] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                        <ShieldAlertIcon className="w-3.5 h-3.5 text-[#556b82]" />
                        <span>Watch (Potential Concern)</span>
                      </h4>
                      <p className="text-xs text-[#556b82] leading-relaxed">
                        Supplier facility capacity is expected to tighten next month. Verify production slot booking early to prevent lead-time drift.
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[11px]">
                      <span className="text-[#556b82]">Capacity utilization:</span>
                      <span className="font-semibold text-[#1d2d3e]">84% Normal</span>
                    </div>
                  </div>

                  {/* WHAT COULD CHANGE THIS? */}
                  <div className="bg-[#fff9f0] border border-[#f5b041]/40 rounded p-3 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[11px] font-bold text-[#964b00] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                        <ActivityIcon className="w-3.5 h-3.5 text-[#e9730c]" />
                        <span>What Could Change This?</span>
                      </h4>
                      {decisionResult.sensitivity_analysis && decisionResult.sensitivity_analysis.length > 0 ? (
                        <div className="space-y-1 text-xs text-[#556b82]">
                          <p className="font-semibold text-[#1d2d3e]">
                            {decisionResult.sensitivity_analysis[0].dimension_label.toUpperCase()} Shift (Threshold: {decisionResult.sensitivity_analysis[0].threshold_weight_pct}%)
                          </p>
                          <p className="text-[11px]">
                            {decisionResult.sensitivity_analysis[0].insight}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-[#556b82]">
                          A delivery delay exceeding 3 days would shift ranking to secondary supplier.
                        </p>
                      )}
                    </div>
                    <div className="mt-2 pt-2 border-t border-[#f5b041]/20 flex items-center justify-between text-[11px]">
                      <span className="text-[#964b00] font-medium">Test sensitivity:</span>
                      <button
                        onClick={() => setActiveTab('twin')}
                        className="text-[#0070f2] hover:underline font-semibold"
                      >
                        Simulate in Twin →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Level 2 Quick Action Bar (Section 10) */}
                <div className="mt-4 pt-3 border-t border-[#edf0f3] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 text-[11px] text-[#556b82]">
                    <ShieldAlertIcon className="w-3.5 h-3.5 text-[#556b82]" />
                    <span>Deterministic MCDA Model • Full Evidence & Audit Trail Logged</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setActiveTab('evidence')}
                      className="sap-btn sap-btn-secondary text-xs"
                    >
                      View Evidence
                    </button>
                    <button
                      onClick={() => setActiveTab('stresstest')}
                      className="sap-btn sap-btn-secondary text-xs"
                    >
                      Test Decision
                    </button>
                    <button
                      onClick={() => setActiveTab('twin')}
                      className="sap-btn sap-btn-secondary text-xs"
                    >
                      Decision Twin
                    </button>
                    <button
                      onClick={handleSaveDecision}
                      className="sap-btn sap-btn-primary text-xs"
                    >
                      Save Decision
                    </button>
                  </div>
                </div>
              </div>

              {/* LEVEL 3: Ranked Candidate Comparison Matrix */}
              {decisionResult.ranked_suppliers && decisionResult.ranked_suppliers.length > 0 && (
                <div className="sap-card p-4">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#edf0f3]">
                    <div>
                      <h4 className="text-xs font-semibold text-[#1d2d3e] uppercase tracking-wider">
                        Ranked Supplier Candidates Comparison
                      </h4>
                      <p className="text-[11px] text-[#556b82]">
                        Evaluating top candidates for {decisionResult.requirement?.material_id} across cost, delivery, quality, and lead time
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAllCandidates(!showAllCandidates)}
                      className="text-xs text-[#0070f2] hover:underline font-medium"
                    >
                      {showAllCandidates ? 'Show Top 3 Only' : `Show All ${decisionResult.ranked_suppliers.length} Candidates`}
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="sap-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Supplier Name</th>
                          <th>Decision Score</th>
                          <th>Effective Unit Cost</th>
                          <th>Delivery OTD %</th>
                          <th>Quality Defect %</th>
                          <th>Lead Time</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(showAllCandidates
                          ? decisionResult.ranked_suppliers
                          : decisionResult.ranked_suppliers.slice(0, 3)
                        ).map((sup, idx) => (
                          <tr
                            key={sup.supplier_id}
                            className={idx === 0 ? 'bg-[#edf5ff]/40 font-medium' : ''}
                          >
                            <td className="font-bold font-mono">#{idx + 1}</td>
                            <td>
                              <button
                                onClick={() => onOpenSupplierDrawer ? onOpenSupplierDrawer(sup.supplier_id) : onNavigateToSupplier360(sup.supplier_id)}
                                className="font-semibold text-[#1d2d3e] hover:text-[#0070f2] hover:underline text-left inline-block"
                                title="Open Quick Dossier"
                              >
                                {sup.supplier_name}
                              </button>
                              <span className="text-[10px] text-[#556b82] font-mono ml-2">({sup.supplier_id})</span>
                            </td>
                            <td className="font-bold font-mono text-[#0070f2]">{sup.final_score}</td>
                            <td className="font-mono">€{sup.cost_breakdown?.effective_unit_cost_eur?.toFixed(2)}</td>
                            <td className="font-mono">{sup.metrics?.on_time_delivery_rate_pct}%</td>
                            <td className="font-mono">{sup.metrics?.quality_rejection_rate_pct}%</td>
                            <td className="font-mono">{sup.cost_breakdown?.offered_lead_time_days}d</td>
                            <td>
                              <span
                                className={`sap-badge ${
                                  idx === 0 ? 'sap-badge-success' : 'sap-badge-neutral'
                                } text-[10px] font-semibold`}
                              >
                                {idx === 0 ? 'Recommended' : 'Alternative'}
                              </span>
                            </td>
                            <td>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => onOpenSupplierDrawer ? onOpenSupplierDrawer(sup.supplier_id) : onNavigateToSupplier360(sup.supplier_id)}
                                  className="text-xs text-[#0070f2] hover:underline font-medium"
                                  title="Quick View Side Panel"
                                >
                                  Quick View
                                </button>
                                <span className="text-[#d9dcdf]">|</span>
                                <button
                                  onClick={() => onNavigateToSupplier360(sup.supplier_id)}
                                  className="text-xs text-[#556b82] hover:text-[#0070f2] hover:underline"
                                  title="Full 360 Dossier"
                                >
                                  360
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* LEVEL 3: Quota Allocation Breakdown (if applicable) */}
              {decisionResult.recommended_option?.allocation_plan && (
                <div className="sap-card p-4">
                  <h4 className="text-xs font-semibold text-[#1d2d3e] uppercase tracking-wider mb-2">
                    Multi-Supplier Quota Allocation Breakdown (SAP Quota Arrangement)
                  </h4>
                  <table className="sap-table">
                    <thead>
                      <tr>
                        <th>Supplier ID</th>
                        <th>Supplier Name</th>
                        <th>Allocation %</th>
                        <th>Allocated Quantity</th>
                        <th>Effective Unit Cost</th>
                        <th>Subtotal Value</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {decisionResult.recommended_option.allocation_plan.map((item, idx) => (
                        <tr key={idx}>
                          <td className="font-mono">{item.supplier_id}</td>
                          <td className="font-medium">{item.supplier_name}</td>
                          <td className="font-semibold text-[#0070f2]">{item.allocation_pct}%</td>
                          <td className="font-mono">{item.allocated_quantity.toLocaleString()} EA</td>
                          <td className="font-mono">€{item.effective_unit_cost_eur.toFixed(2)}</td>
                          <td className="font-mono font-medium">€{item.subtotal_cost_eur.toLocaleString()}</td>
                          <td className="font-mono">{item.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* LEVEL 3: Spend Concentration Impact */}
              {decisionResult.projected_concentration && (
                <div className="sap-card p-4">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#edf0f3]">
                    <h4 className="text-xs font-semibold text-[#1d2d3e] uppercase tracking-wider">
                      Supplier Spend Concentration Impact
                    </h4>
                    <span
                      className={`sap-badge ${
                        decisionResult.projected_concentration.is_concentration_risk
                          ? 'sap-badge-error'
                          : 'sap-badge-success'
                      } text-[10px] font-semibold`}
                    >
                      {decisionResult.projected_concentration.is_concentration_risk
                        ? 'Concentration Warning (>40%)'
                        : 'Acceptable Exposure (<40%)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#f5f6f8] border border-[#d9dcdf] rounded p-3">
                    <div>
                      <span className="text-[#556b82] text-[10px] uppercase font-semibold">Current Concentration</span>
                      <p className="font-semibold text-[#1d2d3e] mt-0.5">
                        {decisionResult.projected_concentration.current_concentration_pct}%
                      </p>
                      <p className="text-[10px] text-[#556b82] font-mono">
                        €{decisionResult.projected_concentration.current_spend_eur?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#556b82] text-[10px] uppercase font-semibold">Requirement Value</span>
                      <p className="font-semibold text-[#1d2d3e] mt-0.5">
                        €{decisionResult.projected_concentration.requirement_spend_eur?.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-[#556b82] font-mono">This allocation</p>
                    </div>
                    <div>
                      <span className="text-[#556b82] text-[10px] uppercase font-semibold">Projected Concentration</span>
                      <p className={`font-semibold mt-0.5 ${
                        decisionResult.projected_concentration.is_concentration_risk ? 'text-[#bb0000]' : 'text-[#1d2d3e]'
                      }`}>
                        {decisionResult.projected_concentration.projected_concentration_pct}%
                      </p>
                      <p className="text-[10px] text-[#556b82] font-mono">
                        €{decisionResult.projected_concentration.projected_spend_eur?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#556b82] text-[10px] uppercase font-semibold">Evaluation Scope</span>
                      <p className="font-semibold text-[#1d2d3e] mt-0.5 truncate">
                        {decisionResult.projected_concentration.scope}
                      </p>
                      <p className="text-[10px] text-[#556b82] font-mono">Portfolio Group</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#556b82] mt-2">
                    {decisionResult.projected_concentration.alert_message}
                  </p>
                </div>
              )}

              {/* LEVEL 3: Progressive Disclosure AI Decision Explanation */}
              {decisionResult.ai_explanation && (
                <div className="sap-card p-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#edf0f3]">
                    <div className="flex items-center space-x-2">
                      <ChatIcon className="w-3.5 h-3.5 text-[#0070f2]" />
                      <h4 className="text-xs font-semibold text-[#1d2d3e] uppercase tracking-wider">
                        Empirical Rationale & Decision Explorer
                      </h4>
                    </div>
                    <button
                      onClick={() => setShowAIExplanationDetails(!showAIExplanationDetails)}
                      className="text-xs text-[#0070f2] hover:underline font-medium"
                    >
                      {showAIExplanationDetails ? 'Hide Deep Audit Details' : 'Show Full Decision Audit'}
                    </button>
                  </div>

                  <p className="text-xs text-[#1d2d3e] leading-relaxed mt-2.5">
                    {decisionResult.ai_explanation.decision_summary}
                  </p>

                  {/* Collapsible Deep Audit */}
                  {showAIExplanationDetails && (
                    <div className="mt-3 pt-3 border-t border-[#edf0f3] space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-[#f5f6f8] border border-[#d9dcdf] rounded p-3">
                          <h5 className="text-[11px] font-bold text-[#1d2d3e] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                            <CheckIcon className="w-3.5 h-3.5 text-[#107e3e]" />
                            <span>Empirical Strengths</span>
                          </h5>
                          <ul className="space-y-1 text-xs text-[#556b82]">
                            {decisionResult.ai_explanation.key_strengths.map((str, idx) => (
                              <li key={idx}>• {str}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-[#f5f6f8] border border-[#d9dcdf] rounded p-3">
                          <h5 className="text-[11px] font-bold text-[#1d2d3e] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                            <AlertTriangleIcon className="w-3.5 h-3.5 text-[#e9730c]" />
                            <span>Identified Operational Risks</span>
                          </h5>
                          <ul className="space-y-1 text-xs text-[#556b82]">
                            {decisionResult.ai_explanation.identified_risks_and_mitigations.map((risk, idx) => (
                              <li key={idx}>• {risk}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {decisionResult.ai_explanation.comparative_rationale && (
                        <div className="text-xs text-[#556b82] pt-2 border-t border-[#edf0f3]">
                          <span className="font-semibold text-[#1d2d3e]">Runner-Up Differential: </span>
                          <span>{decisionResult.ai_explanation.comparative_rationale}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Interactive Grounded Prompt Chips */}
                  <div className="mt-3 pt-3 border-t border-[#edf0f3]">
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {[
                        `Why this supplier for ${decisionResult.requirement?.material_id}?`,
                        'What if delivery becomes critical?',
                        'What if price increases by 10%?',
                        'What are the main risks?'
                      ].map((promptText, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => {
                            if (onOpenAssistantWithQuery) {
                              onOpenAssistantWithQuery(promptText, {
                                material_id: decisionResult.requirement?.material_id,
                                supplier_id: decisionResult.recommended_option?.primary_supplier_id,
                                supplier_name: decisionResult.recommended_option?.primary_supplier_name,
                                requirement: decisionResult.requirement,
                                recommended_option: decisionResult.recommended_option
                              });
                            }
                          }}
                          className="text-[11px] bg-white hover:bg-[#edf5ff] text-[#1d2d3e] border border-[#d9dcdf] hover:border-[#0070f2] px-2.5 py-1 rounded transition-colors font-medium"
                        >
                          {promptText}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Ask a specific question about this sourcing decision..."
                        value={inlineAiQuestion}
                        onChange={(e) => setInlineAiQuestion(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && inlineAiQuestion.trim()) {
                            if (onOpenAssistantWithQuery) {
                              onOpenAssistantWithQuery(inlineAiQuestion, {
                                material_id: decisionResult.requirement?.material_id,
                                supplier_id: decisionResult.recommended_option?.primary_supplier_id,
                                supplier_name: decisionResult.recommended_option?.primary_supplier_name,
                                requirement: decisionResult.requirement,
                                recommended_option: decisionResult.recommended_option
                              });
                              setInlineAiQuestion('');
                            }
                          }
                        }}
                        className="sap-input flex-1"
                      />
                      <button
                        onClick={() => {
                          if (inlineAiQuestion.trim() && onOpenAssistantWithQuery) {
                            onOpenAssistantWithQuery(inlineAiQuestion, {
                              material_id: decisionResult.requirement?.material_id,
                              supplier_id: decisionResult.recommended_option?.primary_supplier_id,
                              supplier_name: decisionResult.recommended_option?.primary_supplier_name,
                              requirement: decisionResult.requirement,
                              recommended_option: decisionResult.recommended_option
                            });
                            setInlineAiQuestion('');
                          }
                        }}
                        disabled={!inlineAiQuestion.trim()}
                        className="sap-btn sap-btn-primary text-xs"
                      >
                        Ask AI
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Decision Twin Cockpit */}
          {activeTab === 'twin' && (
            <DecisionTwinView
              initialRequirement={{
                ...activeReq,
                quantity: reqQuantity,
                plant_id: reqPlant,
                required_date: reqDate,
                business_priority: reqPriority,
                selection_mode: reqMode
              } as any}
              onNavigateToSupplier360={onNavigateToSupplier360}
              onNavigateToStressTest={() => setActiveTab('stresstest')}
              onOpenAssistantWithQuery={onOpenAssistantWithQuery}
            />
          )}

          {/* Tab: Decision Evidence Graph */}
          {activeTab === 'evidence' && decisionResult.evidence_package && (
            <DecisionEvidenceGraphView
              evidencePackage={decisionResult.evidence_package}
              recommendedOption={decisionResult.recommended_option}
              onNavigateToSupplier360={onNavigateToSupplier360}
            />
          )}

          {/* Tab 3: What-If Analysis Slider Controls */}
          {activeTab === 'whatif' && (
            <div className="bg-white border border-[#d5dbe1] p-5 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Interactive What-If Simulation Controls
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Adjust dimension importance weights to simulate different procurement trade-offs.
                  </p>
                </div>
                <button
                  onClick={handleSimulateWhatIf}
                  disabled={isWhatIfRunning}
                  className="bg-[#0a6ed1] hover:bg-[#0854a0] disabled:bg-slate-400 text-white font-medium text-xs px-4 py-1.5 rounded-[2px] transition-colors"
                >
                  {isWhatIfRunning ? 'Recalculating...' : 'Recalculate Scores'}
                </button>
              </div>

              {/* What-If feedback notice if changed */}
              {decisionResult.what_if_analysis && (
                <div
                  className={`p-3 border text-xs ${
                    decisionResult.what_if_analysis.recommendation_changed
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-blue-50 border-blue-200 text-blue-900'
                  }`}
                >
                  <p className="font-semibold">
                    {decisionResult.what_if_analysis.recommendation_changed
                      ? 'Recommendation Shift Detected!'
                      : 'Recommendation Maintained'}
                  </p>
                  <p className="mt-0.5">{decisionResult.what_if_analysis.explanation}</p>
                </div>
              )}

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">Price / Effective Cost</span>
                    <span className="font-mono text-slate-900">{whatIfWeights.price}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={whatIfWeights.price}
                    onChange={(e) => setWhatIfWeights({ ...whatIfWeights, price: Number(e.target.value) })}
                    className="w-full accent-[#0a6ed1]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">Delivery Reliability (OTD)</span>
                    <span className="font-mono text-slate-900">{whatIfWeights.delivery}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={whatIfWeights.delivery}
                    onChange={(e) => setWhatIfWeights({ ...whatIfWeights, delivery: Number(e.target.value) })}
                    className="w-full accent-[#0a6ed1]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">Quality Performance</span>
                    <span className="font-mono text-slate-900">{whatIfWeights.quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={whatIfWeights.quality}
                    onChange={(e) => setWhatIfWeights({ ...whatIfWeights, quality: Number(e.target.value) })}
                    className="w-full accent-[#0a6ed1]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">Lead Time Responsiveness</span>
                    <span className="font-mono text-slate-900">{whatIfWeights.lead_time}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    value={whatIfWeights.lead_time}
                    onChange={(e) => setWhatIfWeights({ ...whatIfWeights, lead_time: Number(e.target.value) })}
                    className="w-full accent-[#0a6ed1]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">Contract Advantage</span>
                    <span className="font-mono text-slate-900">{whatIfWeights.contract}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={whatIfWeights.contract}
                    onChange={(e) => setWhatIfWeights({ ...whatIfWeights, contract: Number(e.target.value) })}
                    className="w-full accent-[#0a6ed1]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">Risk Sensitivity</span>
                    <span className="font-mono text-slate-900">{whatIfWeights.risk}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={whatIfWeights.risk}
                    onChange={(e) => setWhatIfWeights({ ...whatIfWeights, risk: Number(e.target.value) })}
                    className="w-full accent-[#0a6ed1]"
                  />
                </div>
              </div>

              {/* Ranked Candidate Shifts Table */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                  Live Ranked Candidate Matrix Under Current What-If Weights
                </h4>
                <table className="sap-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Supplier</th>
                      <th>Decision Score</th>
                      <th>Effective Unit Cost</th>
                      <th>OTD %</th>
                      <th>Quality Defect %</th>
                      <th>Lead Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {decisionResult.ranked_suppliers?.map((sup, idx) => (
                      <tr
                        key={sup.supplier_id}
                        className={idx === 0 ? 'bg-blue-50/60 font-medium' : ''}
                      >
                        <td className="font-bold font-mono">#{idx + 1}</td>
                        <td>
                          <span className="font-medium text-slate-900">{sup.supplier_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono ml-2">({sup.supplier_id})</span>
                        </td>
                        <td className="font-bold font-mono text-[#0a6ed1]">{sup.final_score}</td>
                        <td className="font-mono">€{sup.cost_breakdown?.effective_unit_cost_eur?.toFixed(2)}</td>
                        <td className="font-mono">{sup.metrics?.on_time_delivery_rate_pct}%</td>
                        <td className="font-mono">{sup.metrics?.quality_rejection_rate_pct}%</td>
                        <td className="font-mono">{sup.cost_breakdown?.offered_lead_time_days}d</td>
                        <td>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-[2px] ${
                              idx === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {idx === 0 ? 'Recommended' : 'Alternative'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Eligibility Matrix */}
          {activeTab === 'eligibility' && decisionResult.eligibility_summary && (
            <div className="bg-white border border-[#d5dbe1] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Supplier Eligibility Evaluation
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  {decisionResult.eligibility_summary.total_suppliers_evaluated} Total Suppliers Evaluated
                </span>
              </div>

              <div className="space-y-3">
                {decisionResult.eligibility_summary.all_results?.map((item) => {
                  let badgeClass = 'bg-emerald-100 text-emerald-800';
                  if (item.eligibility_status === 'CONDITIONALLY_ELIGIBLE') {
                    badgeClass = 'bg-amber-100 text-amber-800';
                  } else if (item.eligibility_status === 'NOT_ELIGIBLE') {
                    badgeClass = 'bg-red-100 text-red-800';
                  }

                  return (
                    <div key={item.supplier_id} className="border border-slate-200 p-3 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-[2px] uppercase ${badgeClass}`}>
                            {item.eligibility_status.replace('_', ' ')}
                          </span>
                          <span className="font-semibold text-slate-900">{item.supplier_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({item.supplier_id})</span>
                        </div>
                        <div className="text-slate-600 mt-1">
                          {item.reasons.map((r, i) => (
                            <p key={i}>• {r}</p>
                          ))}
                          {item.conditions?.map((c, i) => (
                            <p key={i} className="text-amber-700 font-medium">• Condition: {c}</p>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => onNavigateToSupplier360(item.supplier_id)}
                        className="text-[11px] border border-slate-300 hover:bg-slate-100 px-2.5 py-1 rounded-[2px] whitespace-nowrap self-start md:self-center"
                      >
                        Inspect 360
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab: Stress Testing & Outage */}
          {activeTab === 'stresstest' && (
            <DecisionStressTestView
              initialRequirement={activeReq}
              onOpenRequirementInWorkspace={setSelectedReqId}
            />
          )}

          {/* Tab 5: Decision Trace */}
          {activeTab === 'trace' && decisionResult.decision_trace && (
            <div className="bg-white border border-[#d5dbe1] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Technical Decision Model Trace
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Model: {decisionResult.decision_trace.model_version} | Deterministic Multi-Criteria Decision Analysis
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="sap-table">
                  <thead>
                    <tr>
                      <th>Supplier</th>
                      <th>Price Score (25%)</th>
                      <th>Delivery Score (25%)</th>
                      <th>Quality Score (20%)</th>
                      <th>Lead Time (15%)</th>
                      <th>Contract (10%)</th>
                      <th>Risk (5%)</th>
                      <th>Confidence</th>
                      <th>Final Composite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {decisionResult.decision_trace.scoring_matrix?.map((row) => (
                      <tr key={row.supplier_id}>
                        <td className="font-medium">
                          {row.supplier_name} <span className="text-[10px] text-slate-400 font-mono">({row.supplier_id})</span>
                        </td>
                        <td className="font-mono">{row.scores.price_score}</td>
                        <td className="font-mono">{row.scores.delivery_score}</td>
                        <td className="font-mono">{row.scores.quality_score}</td>
                        <td className="font-mono">{row.scores.lead_time_score}</td>
                        <td className="font-mono">{row.scores.contract_score}</td>
                        <td className="font-mono">{row.scores.risk_score}</td>
                        <td className="font-mono">{row.confidence_factor}x</td>
                        <td className="font-mono font-bold text-[#0a6ed1]">{row.final_score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Offline / Backend Not Running Guidance Card */}
      {!decisionResult && !isAnalyzing && (
        <div className="sap-card p-6 border-l-4 border-l-[#e76500] bg-[#fffaf5] space-y-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2 rounded bg-[#fef0e6] text-[#e76500] flex-shrink-0">
              <AlertTriangleIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#1d2d3e]">
                  {backendOffline ? 'Backend Decision Engine Not Connected' : 'Ready to Analyze Sourcing Requirement'}
                </h3>
                <span className="sap-badge sap-badge-warning text-[10px] font-mono">
                  {backendOffline ? 'OFFLINE PREVIEW' : 'AWAITING RUN'}
                </span>
              </div>
              <p className="text-xs text-[#556b82] mt-1.5 leading-relaxed">
                {backendOffline ? (
                  <>
                    The UI is currently displaying pre-configured SAP procurement requirements from local master data.
                    To execute the deterministic MCDA Decision Engine, evaluate effective landed costs, and generate grounded recommendations, start the FastAPI backend service:
                  </>
                ) : (
                  <>
                    Requirement parameters for <strong className="font-semibold text-[#1d2d3e]">{selectedReqId}</strong> are loaded.
                    Click below to trigger the multi-criteria decision analysis across qualified suppliers.
                  </>
                )}
              </p>

              {backendOffline && (
                <div className="mt-3 bg-[#1d2d3e] text-[#f5f6f7] p-2.5 rounded font-mono text-[11px] select-all">
                  python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
                </div>
              )}

              <div className="mt-4 flex items-center space-x-3">
                <button
                  onClick={() => {
                    if (activeReq) runInitialAnalysis(activeReq);
                    else loadRequirements();
                  }}
                  className="bg-[#0070f2] hover:bg-[#005bb5] text-white font-medium text-xs px-4 py-2 rounded transition-colors flex items-center space-x-2"
                >
                  <LayersIcon className="w-3.5 h-3.5" />
                  <span>{backendOffline ? 'Retry Backend Connection' : 'Analyze Sourcing Options'}</span>
                </button>
                {backendOffline && (
                  <span className="text-[11px] text-[#556b82]">
                    Backend URL: <code className="font-mono text-[#0070f2]">http://127.0.0.1:8000</code>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
