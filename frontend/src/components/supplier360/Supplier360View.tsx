import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { PageHeader } from '../common/PageHeader';
import { BackNavigation } from '../common/BackNavigation';
import { BuildingIcon, AlertTriangleIcon, CheckIcon, ShieldAlertIcon, FileTextIcon, ActivityIcon } from '../common/Icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface Supplier360ViewProps {
  initialSupplierId?: string;
  onOpenAssistantWithQuery?: (query: string, context?: any) => void;
}

export const Supplier360View: React.FC<Supplier360ViewProps> = ({
  initialSupplierId = 'SUP-006',
  onOpenAssistantWithQuery
}) => {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(initialSupplierId);
  const [allSuppliers, setAllSuppliers] = useState<any[]>([]);
  const [data360, setData360] = useState<any>(null);
  const [whatChangedData, setWhatChangedData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dossierTab, setDossierTab] = useState<'price' | 'contracts' | 'risk' | 'company'>('price');

  useEffect(() => {
    loadSupplierList();
  }, []);

  useEffect(() => {
    if (selectedSupplierId) {
      load360Data(selectedSupplierId);
    }
  }, [selectedSupplierId]);

  const loadSupplierList = async () => {
    try {
      const sups = await api.getSuppliers();
      setAllSuppliers(sups);
    } catch (err) {
      console.error('Failed to load supplier list:', err);
    }
  };

  const load360Data = async (supId: string) => {
    try {
      setLoading(true);
      const [data, changed] = await Promise.all([
        api.getSupplier360(supId, 'MAT-001'),
        api.getWhatChanged().catch(() => null)
      ]);
      setData360(data);
      setWhatChangedData(changed);
    } catch (err) {
      console.error('Failed to load 360 data:', err);
    } finally {
      setLoading(false);
    }
  };

  const isTrustHigh = data360?.metrics
    ? data360.metrics.quality_rejection_rate_pct < 1.0 && data360.metrics.on_time_delivery_rate_pct >= 95
    : true;

  return (
    <div className="space-y-5">
      <BackNavigation
        fallbackTab="suppliers"
        fallbackSubtab="directory"
        fallbackLabel="Supplier Intelligence"
      />

      {/* 1. PageHeader answering: "How reliable is this supplier?" */}
      <PageHeader
        title="Supplier 360"
        subtitle="How reliable is this supplier across cost, delivery, and quality?"
        breadcrumbs={[
          { label: 'Supplier Decision Intelligence' },
          { label: 'Supplier 360' },
          { label: data360?.profile?.name || selectedSupplierId }
        ]}
        badges={[
          { label: `${data360?.profile?.strategic_tier || 'Strategic'} Partner`, variant: 'info' },
          {
            label: data360?.profile?.status === 'Active' ? 'Active Status' : 'Under Review',
            variant: data360?.profile?.status === 'Active' ? 'success' : 'warning'
          },
          { label: data360?.profile?.country || 'DE', variant: 'neutral' }
        ]}
        actions={
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-[#556b82]">Switch Supplier:</label>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="sap-select text-xs py-1"
            >
              {allSuppliers.map((s) => (
                <option key={s.supplier_id} value={s.supplier_id}>
                  {s.supplier_id} - {s.name}
                </option>
              ))}
            </select>
          </div>
        }
        onAskAI={() =>
          onOpenAssistantWithQuery &&
          onOpenAssistantWithQuery(`Can I trust supplier ${data360?.profile?.name || selectedSupplierId}? Analyze delivery, quality, and risk factors.`)
        }
      />

      {loading ? (
        <ProcessingIndicator operation="supplier_360" message={`Loading trust profile for ${selectedSupplierId}...`} />
      ) : data360 ? (
        <div className="space-y-4">
          {/* LEVEL 1: Trust Verdict Banner & Primary Signals */}
          <div className="sap-card p-5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-[#edf0f3]">
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`sap-badge ${
                      isTrustHigh ? 'sap-badge-success' : 'sap-badge-warning'
                    } font-semibold text-[11px]`}
                  >
                    {isTrustHigh ? 'High Operational Trust • Verified Partner' : 'Monitored Partner • Performance Drift'}
                  </span>
                  <span className="text-[11px] text-[#556b82] font-mono">
                    {data360.profile.strategic_tier} Tier • Plant P001 Scope
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#1d2d3e] mt-1.5 flex items-center space-x-2">
                  <span>{data360.profile.name}</span>
                  <span className="text-xs font-mono font-normal text-[#556b82]">
                    (BP: {data360.profile.supplier_id})
                  </span>
                </h3>
                <p className="text-xs text-[#556b82] mt-0.5">
                  {data360.profile.street}, {data360.profile.city}, {data360.profile.country} • Est. {data360.profile.established_year}
                </p>
              </div>

              <div className="flex items-center space-x-4 text-xs text-right">
                <div className="bg-[#f5f6f8] border border-[#d9dcdf] rounded px-3 py-1.5">
                  <p className="text-[10px] uppercase font-semibold text-[#556b82]">Payment Terms</p>
                  <p className="font-mono font-bold text-[#1d2d3e]">{data360.profile.payment_terms}</p>
                </div>
                <div className="bg-[#f5f6f8] border border-[#d9dcdf] rounded px-3 py-1.5">
                  <p className="text-[10px] uppercase font-semibold text-[#556b82]">Incoterms</p>
                  <p className="font-mono font-bold text-[#1d2d3e]">{data360.profile.incoterms}</p>
                </div>
              </div>
            </div>

            {/* 4 Primary Operational Signals (Level 1) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 my-4">
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5 shadow-xs">
                <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wide">24-Month Spend</p>
                <p className="text-lg font-bold text-[#0f172a] mt-1 font-mono">
                  €{data360.metrics.total_spend_eur?.toLocaleString()}
                </p>
                <p className="text-[11px] text-[#64748b] mt-0.5">
                  {data360.metrics.total_orders} Purchase Orders Executed
                </p>
              </div>

              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5 shadow-xs">
                <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wide">Delivery Reliability (OTD)</p>
                <p className="text-lg font-bold text-[#0066cc] mt-1 font-mono">
                  {data360.metrics.on_time_delivery_rate_pct}%
                </p>
                <p className="text-[11px] text-[#64748b] mt-0.5">
                  Avg Delay: {data360.metrics.average_delay_days} Days
                </p>
              </div>

              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5 shadow-xs">
                <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wide">Quality Defect Rate</p>
                <p className="text-lg font-bold text-[#0f172a] mt-1 font-mono">
                  {data360.metrics.quality_rejection_rate_pct}%
                </p>
                <p className="text-[11px] text-[#64748b] mt-0.5">
                  {data360.metrics.ppm} PPM Defect Level
                </p>
              </div>

              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5 shadow-xs">
                <p className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wide">Spend Concentration</p>
                <p className="text-lg font-bold text-[#0f172a] mt-1 font-mono">
                  {data360.metrics.spend_concentration_pct}%
                </p>
                <p className="text-[11px] mt-0.5">
                  <span
                    className={
                      data360.metrics.is_concentrated ? 'text-[#dc2626] font-semibold' : 'text-[#16a34a] font-medium'
                    }
                  >
                    {data360.metrics.is_concentrated ? 'Exposure Warning (>40%)' : 'Within Safe Limit (<40%)'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* LEVEL 2: "What Changed?" Recent Drift & Performance Shifts */}
          <div className="sap-card p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-3 border-b border-[#edf0f3] gap-2">
              <div>
                <h4 className="text-xs font-semibold text-[#1d2d3e] uppercase tracking-wider flex items-center space-x-1.5">
                  <ActivityIcon className="w-3.5 h-3.5 text-[#0070f2]" />
                  <span>What Changed? (Performance Drift & Telemetry Shifts)</span>
                </h4>
                <p className="text-[11px] text-[#556b82]">
                  Continuous comparison: August 2026 vs September 2026 SAP telemetry
                </p>
              </div>
              <div className="flex items-center space-x-2 text-[10px] font-mono">
                <span className="sap-badge sap-badge-neutral">
                  Portfolio OTIF Shift: {whatChangedData?.month_over_month?.otif_shift_pts > 0 ? '+' : ''}{whatChangedData?.month_over_month?.otif_shift_pts ?? -2.0} pts
                </span>
                <span className="sap-badge sap-badge-neutral">
                  Spend Volatility: {whatChangedData?.month_over_month?.spend_delta_pct > 0 ? '+' : ''}{whatChangedData?.month_over_month?.spend_delta_pct ?? 4.1}%
                </span>
              </div>
            </div>

            {(() => {
              const shifts = whatChangedData?.supplier_shifts?.filter(
                (s: any) => s.supplier_id === selectedSupplierId
              ) || [];

              if (shifts.length > 0) {
                return (
                  <div className="space-y-2">
                    {shifts.map((shift: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3 border rounded text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                          shift.direction === 'deteriorated'
                            ? 'bg-[#fff9f0] border-[#f5b041]/40'
                            : 'bg-[#f5fbf7] border-[#107e3e]/30'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-[#1d2d3e]">{shift.metric}</span>
                            <span
                              className={`sap-badge ${
                                shift.direction === 'deteriorated' ? 'sap-badge-warning' : 'sap-badge-success'
                              } text-[10px] font-semibold uppercase`}
                            >
                              {shift.direction}
                            </span>
                            <span className="font-mono text-[10px] text-[#556b82]">
                              Dimension: {shift.dimension}
                            </span>
                          </div>
                          <p className="text-[#556b82] text-[11px]">{shift.insight}</p>
                        </div>

                        <div className="text-right whitespace-nowrap">
                          <p className="text-[10px] text-[#556b82]">
                            {shift.previous_value} &rarr; <span className="font-semibold text-[#1d2d3e]">{shift.current_value}</span>
                          </p>
                          <p
                            className={`font-mono font-bold text-xs ${
                              shift.direction === 'deteriorated' ? 'text-[#964b00]' : 'text-[#107e3e]'
                            }`}
                          >
                            Variance: {shift.variance}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }

              return (
                <div className="bg-[#f5fbf7] border border-[#107e3e]/30 p-3 rounded flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckIcon className="w-4 h-4 text-[#107e3e]" />
                    <div>
                      <p className="font-semibold text-[#1d2d3e]">Stable Operational Performance</p>
                      <p className="text-[#556b82] text-[11px]">
                        No anomalous price spikes or delivery degradations detected for {data360.profile.name} over the last 60 days.
                      </p>
                    </div>
                  </div>
                  <span className="sap-badge sap-badge-success font-semibold text-[10px]">
                    Baseline: Stable
                  </span>
                </div>
              );
            })()}
          </div>

          {/* LEVEL 3: Deep Operational Dossier (Progressive Disclosure Tabs) */}
          <div className="sap-card">
            {/* Dossier Tabs Header */}
            <div className="border-b border-[#e2e8f0] px-4 py-2 flex items-center space-x-1.5 text-xs bg-[#f8fafc] rounded-t-xl overflow-x-auto">
              <button
                onClick={() => setDossierTab('price')}
                className={`px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  dossierTab === 'price'
                    ? 'bg-[#0066cc] text-white shadow-xs font-semibold'
                    : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#e2e8f0]/60'
                }`}
              >
                24-Mo Price Benchmark
              </button>
              <button
                onClick={() => setDossierTab('contracts')}
                className={`px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  dossierTab === 'contracts'
                    ? 'bg-[#0066cc] text-white shadow-xs font-semibold'
                    : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#e2e8f0]/60'
                }`}
              >
                Outline Agreements ({data360.contracts?.length || 0})
              </button>
              <button
                onClick={() => setDossierTab('risk')}
                className={`px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  dossierTab === 'risk'
                    ? 'bg-[#0066cc] text-white shadow-xs font-semibold'
                    : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#e2e8f0]/60'
                }`}
              >
                Supply Chain Risk Events ({data360.risk_events?.length || 0})
              </button>
              <button
                onClick={() => setDossierTab('company')}
                className={`px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  dossierTab === 'company'
                    ? 'bg-[#0066cc] text-white shadow-xs font-semibold'
                    : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#e2e8f0]/60'
                }`}
              >
                Profile & Certifications
              </button>
            </div>

            <div className="p-5">
              {/* Tab 1: Price History & Benchmark */}
              {dossierTab === 'price' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#edf0f3]">
                    <div>
                      <h4 className="text-xs font-semibold text-[#1d2d3e] uppercase tracking-wider">
                        24-Month Unit Price History vs Market Benchmark (€)
                      </h4>
                      <p className="text-[11px] text-[#556b82]">
                        Evaluates supplier invoice quotes against the historical commodity price band
                      </p>
                    </div>
                    <span className="text-xs font-mono text-[#556b82]">
                      Position: <span className="font-semibold text-[#1d2d3e]">{data360.metrics.price_band_status}</span>
                    </span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data360.price_history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#edf0f3" />
                        <XAxis dataKey="period" stroke="#556b82" fontSize={10} />
                        <YAxis stroke="#556b82" fontSize={10} domain={['auto', 'auto']} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d9dcdf', borderRadius: '4px', fontSize: '11px' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="unit_price_eur"
                          name="Supplier Unit Price (€)"
                          stroke="#0070f2"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="benchmark_price_eur"
                          name="Material Benchmark (€)"
                          stroke="#556b82"
                          strokeDasharray="4 4"
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Tab 2: Contracts Table */}
              {dossierTab === 'contracts' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-[#1d2d3e] uppercase tracking-wider mb-2">
                    SAP Purchasing Outline Agreements (Contracts)
                  </h4>
                  {data360.contracts?.length > 0 ? (
                    <table className="sap-table">
                      <thead>
                        <tr>
                          <th>Contract #</th>
                          <th>Material</th>
                          <th>Agreed Price</th>
                          <th>Rebate Discount</th>
                          <th>Valid Until</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data360.contracts.map((c: any, i: number) => (
                          <tr key={i}>
                            <td className="font-mono">{c.contract_id}</td>
                            <td className="font-mono">{c.material_id}</td>
                            <td className="font-mono">€{c.contract_price_eur?.toFixed(2)}</td>
                            <td className="font-semibold text-[#107e3e]">{c.agreed_discount_pct}%</td>
                            <td className="font-mono">{c.valid_to}</td>
                            <td>
                              <span className="sap-badge sap-badge-success text-[10px] font-semibold">
                                {c.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-xs text-[#556b82] italic p-3">No active contracts registered for this supplier.</p>
                  )}
                </div>
              )}

              {/* Tab 3: Risk Events */}
              {dossierTab === 'risk' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-[#1d2d3e] uppercase tracking-wider mb-2">
                    Active Supply Chain Risk Signals & Disruption Events
                  </h4>
                  {data360.risk_events?.length > 0 ? (
                    <div className="space-y-2">
                      {data360.risk_events.map((r: any, i: number) => (
                        <div key={i} className="p-3 bg-[#f5f6f8] border border-[#d9dcdf] rounded text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#1d2d3e]">{r.title}</span>
                            <span
                              className={`sap-badge ${
                                r.severity === 'Critical'
                                  ? 'sap-badge-error'
                                  : r.severity === 'High'
                                  ? 'sap-badge-warning'
                                  : 'sap-badge-neutral'
                              } text-[10px] font-semibold`}
                            >
                              {r.severity}
                            </span>
                          </div>
                          <p className="text-[#556b82] text-[11px] mt-1">{r.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#556b82] italic p-3">No active risk events recorded.</p>
                  )}
                </div>
              )}

              {/* Tab 4: Company Profile & Certifications */}
              {dossierTab === 'company' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-[#1d2d3e] uppercase tracking-wider">
                    Company Profile Summary
                  </h4>
                  <p className="text-xs text-[#1d2d3e] leading-relaxed">
                    {data360.profile.profile_summary}
                  </p>
                  <div className="pt-3 border-t border-[#edf0f3]">
                    <h5 className="text-[11px] font-semibold text-[#556b82] uppercase mb-2">
                      Industry Certifications & Audits
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {data360.profile.certifications?.map((c: string, i: number) => (
                        <span key={i} className="sap-badge sap-badge-info font-mono text-[10px]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
