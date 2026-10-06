import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AttentionCenterReport, AttentionCenterItem, EarlyWarningSignal } from '../../types';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import {
  AlertTriangleIcon,
  ShieldAlertIcon,
  ActivityIcon,
  ChevronRightIcon,
  RefreshIcon,
  SearchIcon,
  ChatIcon,
  SlidersIcon,
  LayersIcon
} from '../common/Icons';

interface AttentionCenterViewProps {
  onNavigateTab?: (tab: string, subtab?: string, targetId?: string) => void;
  onOpenAssistantWithQuery?: (query: string, context?: any) => void;
}

export const AttentionCenterView: React.FC<AttentionCenterViewProps> = ({
  onNavigateTab,
  onOpenAssistantWithQuery
}) => {
  const [report, setReport] = useState<AttentionCenterReport | null>(null);
  const [earlyWarnings, setEarlyWarnings] = useState<EarlyWarningSignal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'attention' | 'weak_signals'>('attention');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [attn, ew] = await Promise.all([
        api.getAttentionCenter(),
        api.getEarlyWarnings()
      ]);
      setReport(attn);
      setEarlyWarnings(ew.early_warnings || []);
    } catch (err) {
      console.error('Failed to load Attention Center data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !report) {
    return <ProcessingIndicator operation="anomalies" message="Scanning multi-signal early warning indicators..." />;
  }

  const items = report?.items || [];
  const filteredItems = priorityFilter === 'ALL'
    ? items
    : items.filter(i => i.priority === priorityFilter);

  return (
    <div className="space-y-6">
      {/* Top Header & Triage Bar */}
      <div className="bg-white border border-[#d5dbe1] p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase bg-red-100 text-red-800 px-2 py-0.5 rounded-[2px] font-semibold">
                Strategic Attention Center
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Continuous Sourcing Signal Monitoring
              </span>
            </div>
            <h2 className="text-base font-semibold text-slate-900 mt-1">
              Procurement Early Warning & Attention Center
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Identifies composite weak-signal patterns across price inflation, dock delivery slippage, lead-time variance, and defect PPM to surface operational disruptions before plant impact.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              className="flex items-center space-x-1.5 border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-[2px] font-medium transition-colors"
            >
              <RefreshIcon className="w-3.5 h-3.5" />
              <span>Refresh Signals</span>
            </button>
          </div>
        </div>

        {/* Severity Count Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200">
          <div
            onClick={() => setPriorityFilter(priorityFilter === 'Critical' ? 'ALL' : 'Critical')}
            className={`p-3 border rounded-[2px] cursor-pointer transition-all ${
              priorityFilter === 'Critical' ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-[#f8fafc] hover:bg-slate-100'
            }`}
          >
            <span className="text-[10px] uppercase font-semibold text-red-700">Critical Priority</span>
            <p className="text-xl font-bold font-mono text-red-800 mt-0.5">{report?.critical_count || 0}</p>
            <p className="text-[10px] text-slate-500">Immediate action required</p>
          </div>

          <div
            onClick={() => setPriorityFilter(priorityFilter === 'High' ? 'ALL' : 'High')}
            className={`p-3 border rounded-[2px] cursor-pointer transition-all ${
              priorityFilter === 'High' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-[#f8fafc] hover:bg-slate-100'
            }`}
          >
            <span className="text-[10px] uppercase font-semibold text-amber-700">High Priority</span>
            <p className="text-xl font-bold font-mono text-amber-800 mt-0.5">{report?.high_count || 0}</p>
            <p className="text-[10px] text-slate-500">Deterioration in progress</p>
          </div>

          <div
            onClick={() => setPriorityFilter(priorityFilter === 'Medium' ? 'ALL' : 'Medium')}
            className={`p-3 border rounded-[2px] cursor-pointer transition-all ${
              priorityFilter === 'Medium' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-[#f8fafc] hover:bg-slate-100'
            }`}
          >
            <span className="text-[10px] uppercase font-semibold text-[#0a6ed1]">Medium Priority</span>
            <p className="text-xl font-bold font-mono text-[#0a6ed1] mt-0.5">{report?.medium_count || 0}</p>
            <p className="text-[10px] text-slate-500">Watchlist & renewals</p>
          </div>

          <div
            onClick={() => setPriorityFilter('ALL')}
            className={`p-3 border rounded-[2px] cursor-pointer transition-all ${
              priorityFilter === 'ALL' ? 'border-slate-600 bg-slate-100' : 'border-slate-200 bg-[#f8fafc] hover:bg-slate-100'
            }`}
          >
            <span className="text-[10px] uppercase font-semibold text-slate-600">Total Attention Items</span>
            <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">{report?.total_attention_items || 0}</p>
            <p className="text-[10px] text-slate-500">Click to show all</p>
          </div>
        </div>
      </div>

      {/* Sub-Tabs: Attention Items vs Multi-Signal Early Warnings */}
      <div className="bg-white border border-[#d5dbe1] px-4 flex space-x-2 text-xs border-b-0">
        <button
          onClick={() => setActiveTab('attention')}
          className={`py-2.5 px-4 font-medium border-b-2 transition-colors ${
            activeTab === 'attention'
              ? 'border-[#0a6ed1] text-[#0a6ed1] font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Categorized Attention Queue ({filteredItems.length})
        </button>
        <button
          onClick={() => setActiveTab('weak_signals')}
          className={`py-2.5 px-4 font-medium border-b-2 transition-colors ${
            activeTab === 'weak_signals'
              ? 'border-[#0a6ed1] text-[#0a6ed1] font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Multi-Signal Weak Pattern Combiner ({earlyWarnings.length} Vendors Flagged)
        </button>
      </div>

      {/* Tab 1: Attention Items Queue */}
      {activeTab === 'attention' && (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#d5dbe1] p-5 rounded-[2px] space-y-3 hover:border-slate-400 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-[2px] font-bold ${
                      item.priority === 'Critical'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : item.priority === 'High'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-blue-100 text-[#0a6ed1] border border-blue-200'
                    }`}
                  >
                    {item.priority}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Category: {item.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-900">
                    {item.title}
                  </span>
                </div>

                <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
                  {item.metric_highlight}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {item.summary}
              </p>

              {/* Action Pathways Strip (Investigate, Compare, Simulate, Stress Test, View Evidence) */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                  <span>Target: <strong>{item.supplier_name}</strong></span>
                  <span>|</span>
                  <span>Material: <strong>{item.material_id}</strong></span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Investigate Action */}
                  {item.actions.investigate && onOpenAssistantWithQuery && (
                    <button
                      onClick={() =>
                        onOpenAssistantWithQuery(item.actions.investigate_query, {
                          material_id: item.material_id,
                          supplier_id: item.supplier_id,
                          supplier_name: item.supplier_name
                        })
                      }
                      className="flex items-center space-x-1 text-xs border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 px-2.5 py-1 rounded-[2px] font-medium transition-colors"
                    >
                      <SearchIcon className="w-3 h-3 text-purple-600" />
                      <span>Investigate</span>
                    </button>
                  )}

                  {/* Simulate Action */}
                  {item.actions.simulate && onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('sourcing', undefined, item.material_id)}
                      className="flex items-center space-x-1 text-xs border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 px-2.5 py-1 rounded-[2px] font-medium transition-colors"
                    >
                      <LayersIcon className="w-3 h-3 text-[#0a6ed1]" />
                      <span>Simulate Sourcing</span>
                    </button>
                  )}

                  {/* Stress Test Action */}
                  {item.actions.stress_test && onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('decisions', 'stresstest', item.material_id)}
                      className="flex items-center space-x-1 text-xs border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-2.5 py-1 rounded-[2px] font-medium transition-colors"
                    >
                      <ActivityIcon className="w-3 h-3 text-amber-600" />
                      <span>Stress Test</span>
                    </button>
                  )}

                  {/* View Evidence / 360 Action */}
                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('suppliers', '360', item.supplier_id)}
                      className="flex items-center space-x-1 text-xs bg-[#0a6ed1] hover:bg-[#0854a0] text-white px-2.5 py-1 rounded-[2px] font-medium transition-colors"
                    >
                      <span>Supplier 360</span>
                      <ChevronRightIcon className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Weak Signal Combiner */}
      {activeTab === 'weak_signals' && (
        <div className="bg-white border border-[#d5dbe1] p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Multi-Signal Pattern Combiner (Weak Signals Aggregation)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Surfaces suppliers exhibiting multiple co-occurring sub-threshold deteriorations across Price, Delivery OTD, Lead-Time Variance, and Quality Rejections.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Rule: ≥2 Concurrent Weak Signals
            </span>
          </div>

          <div className="space-y-4">
            {earlyWarnings.map((ew) => (
              <div
                key={ew.supplier_id}
                className="p-4 border border-slate-200 bg-[#f8fafc] rounded-[2px] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-slate-900">
                      {ew.supplier_name}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      ({ew.supplier_id})
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                    {ew.active_signals_count} Signals Triggered
                  </span>
                </div>

                {/* 4 Signal Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className={`p-2 border rounded ${ew.price_signal ? 'bg-red-50 border-red-300 text-red-900 font-semibold' : 'bg-white border-slate-200 text-slate-400'}`}>
                    Price Drift: {ew.price_signal ? '↑ Active Escalation' : 'Stable'}
                  </div>
                  <div className={`p-2 border rounded ${ew.delivery_signal ? 'bg-red-50 border-red-300 text-red-900 font-semibold' : 'bg-white border-slate-200 text-slate-400'}`}>
                    Delivery OTIF: {ew.delivery_signal ? '↓ Trailing Slippage' : 'On Schedule'}
                  </div>
                  <div className={`p-2 border rounded ${ew.lead_time_signal ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold' : 'bg-white border-slate-200 text-slate-400'}`}>
                    Lead Time: {ew.lead_time_signal ? '↑ Expanding Variance' : 'In Window'}
                  </div>
                  <div className={`p-2 border rounded ${ew.quality_signal ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold' : 'bg-white border-slate-200 text-slate-400'}`}>
                    Defect PPM: {ew.quality_signal ? '↑ Rejection Spike' : 'Certified'}
                  </div>
                </div>

                <p className="text-xs text-slate-700">
                  <strong className="text-slate-900">Pattern Explanation: </strong>
                  {ew.ai_pattern_explanation}
                </p>

                <div className="p-2.5 bg-blue-50/60 border border-blue-200 text-xs text-slate-800 rounded">
                  <strong className="text-[#0a6ed1]">Recommended Action: </strong>
                  {ew.recommended_hedge}
                </div>

                <div className="flex items-center justify-end space-x-2 pt-1 text-xs">
                  {onOpenAssistantWithQuery && (
                    <button
                      onClick={() =>
                        onOpenAssistantWithQuery(ew.action_links.investigate_query, {
                          supplier_id: ew.supplier_id,
                          supplier_name: ew.supplier_name,
                          material_id: ew.action_links.material_id
                        })
                      }
                      className="border border-purple-300 text-purple-900 bg-white hover:bg-purple-50 px-3 py-1 rounded font-medium"
                    >
                      Investigate Root Cause
                    </button>
                  )}
                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('suppliers', '360', ew.supplier_id)}
                      className="bg-[#0a6ed1] hover:bg-[#0854a0] text-white px-3 py-1 rounded font-medium"
                    >
                      Open Supplier 360
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
