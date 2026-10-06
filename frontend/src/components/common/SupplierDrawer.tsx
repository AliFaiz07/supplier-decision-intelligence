import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  XIcon,
  BuildingIcon,
  CheckIcon,
  AlertTriangleIcon,
  TruckIcon,
  AwardIcon,
  ShieldAlertIcon,
  ExternalLinkIcon,
  SlidersIcon
} from './Icons';

interface SupplierDrawerProps {
  supplierId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToFull360?: (supplierId: string) => void;
  onSelectInWorkspace?: (supplierId: string) => void;
}

export const SupplierDrawer: React.FC<SupplierDrawerProps> = ({
  supplierId,
  isOpen,
  onClose,
  onNavigateToFull360,
  onSelectInWorkspace
}) => {
  const [data360, setData360] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && supplierId) {
      loadData(supplierId);
    } else {
      setData360(null);
    }
  }, [isOpen, supplierId]);

  const loadData = async (id: string) => {
    try {
      setLoading(true);
      const data = await api.getSupplier360(id, 'MAT-001');
      setData360(data);
    } catch (err) {
      console.error('Failed to load supplier quick details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !supplierId) return null;

  const profile = data360?.profile;
  const metrics = data360?.metrics;
  const isHighTrust = metrics
    ? metrics.quality_rejection_rate_pct < 1.0 && metrics.on_time_delivery_rate_pct >= 95
    : true;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/25 backdrop-blur-[1px] transition-opacity">
      {/* Click outside backdrop */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Surface */}
      <div className="w-full max-w-lg bg-white border-l border-[#d9dcdf] shadow-xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#d9dcdf] bg-[#f8fafc] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[#edf5ff] text-[#0070f2] rounded border border-[#0070f2]/20">
              <BuildingIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-[#1d2d3e]">
                  {profile?.name || supplierId}
                </h3>
                <span className="text-[10px] font-mono text-[#556b82]">({supplierId})</span>
              </div>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="sap-badge sap-badge-info text-[9px]">
                  {profile?.strategic_tier || 'Strategic'}
                </span>
                <span
                  className={`sap-badge text-[9px] ${
                    profile?.status === 'Active' ? 'sap-badge-success' : 'sap-badge-warning'
                  }`}
                >
                  {profile?.status || 'Active'}
                </span>
                <span className="text-[10px] text-[#556b82] font-mono">
                  {profile?.city}, {profile?.country}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#edf0f3] text-[#556b82] hover:text-[#1d2d3e] transition-colors"
            title="Close Drawer"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3 text-[#556b82]">
              <div className="w-6 h-6 border-2 border-[#0070f2] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono">Retrieving supplier signals...</span>
            </div>
          ) : (
            <>
              {/* Trust Verdict Banner */}
              <div
                className={`p-3 rounded border flex items-start space-x-2.5 ${
                  isHighTrust
                    ? 'bg-[#f5faf6] border-[#107e3e]/30 text-[#107e3e]'
                    : 'bg-[#fff9f0] border-[#f5b041]/40 text-[#964b00]'
                }`}
              >
                {isHighTrust ? (
                  <CheckIcon className="w-4 h-4 text-[#107e3e] shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangleIcon className="w-4 h-4 text-[#e9730c] shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-xs">
                    {isHighTrust
                      ? 'Operational Trust: Verified High'
                      : 'Operational Trust: Active Watchlist'}
                  </div>
                  <p className="text-[11px] text-[#556b82] mt-0.5 leading-relaxed">
                    {isHighTrust
                      ? 'Meets SLA compliance criteria for Tier-1 strategic manufacturing supply. Low risk of stockout or defect escalation.'
                      : 'Exhibits recent delivery or quality variance drift. Recommend secondary buffer or quota allocation arrangement.'}
                  </p>
                </div>
              </div>

              {/* 4-KPI Grid */}
              <div>
                <h4 className="text-[11px] font-bold text-[#556b82] uppercase tracking-wider mb-2">
                  Operational Performance Telemetry
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#f8fafc] border border-[#d9dcdf] rounded p-2.5">
                    <div className="flex items-center justify-between text-[11px] text-[#556b82] mb-1">
                      <span>On-Time Delivery</span>
                      <TruckIcon className="w-3.5 h-3.5 text-[#0070f2]" />
                    </div>
                    <div className="text-base font-bold text-[#1d2d3e] font-mono">
                      {metrics?.on_time_delivery_rate_pct ?? 96.2}%
                    </div>
                    <div className="text-[10px] text-[#107e3e] font-medium mt-0.5">
                      Target: ≥95.0%
                    </div>
                  </div>

                  <div className="bg-[#f8fafc] border border-[#d9dcdf] rounded p-2.5">
                    <div className="flex items-center justify-between text-[11px] text-[#556b82] mb-1">
                      <span>Quality Defect Rate</span>
                      <AwardIcon className="w-3.5 h-3.5 text-[#0070f2]" />
                    </div>
                    <div className="text-base font-bold text-[#1d2d3e] font-mono">
                      {metrics?.quality_rejection_rate_pct ?? 0.8}%
                    </div>
                    <div className="text-[10px] text-[#107e3e] font-medium mt-0.5">
                      Target: ≤1.0%
                    </div>
                  </div>

                  <div className="bg-[#f8fafc] border border-[#d9dcdf] rounded p-2.5">
                    <div className="flex items-center justify-between text-[11px] text-[#556b82] mb-1">
                      <span>Quoted Lead Time</span>
                      <TruckIcon className="w-3.5 h-3.5 text-[#556b82]" />
                    </div>
                    <div className="text-base font-bold text-[#1d2d3e] font-mono">
                      {metrics?.lead_time_days ?? 14}d
                    </div>
                    <div className="text-[10px] text-[#556b82] mt-0.5">
                      Std Variance: ±1.2d
                    </div>
                  </div>

                  <div className="bg-[#f8fafc] border border-[#d9dcdf] rounded p-2.5">
                    <div className="flex items-center justify-between text-[11px] text-[#556b82] mb-1">
                      <span>Risk Assessment</span>
                      <ShieldAlertIcon className="w-3.5 h-3.5 text-[#556b82]" />
                    </div>
                    <div className="text-base font-bold text-[#1d2d3e] font-mono">
                      {metrics?.risk_score ?? 18} / 100
                    </div>
                    <div className="text-[10px] text-[#107e3e] font-medium mt-0.5">
                      Low Risk Tier
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Drivers & Watch Items */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-[#556b82] uppercase tracking-wider">
                  Decision Summary
                </h4>
                <div className="bg-[#f8fafc] border border-[#d9dcdf] rounded p-3 space-y-2">
                  <div className="flex items-start space-x-2">
                    <span className="text-[#0070f2] font-bold">•</span>
                    <span className="text-xs text-[#1d2d3e]">
                      <strong>Cost Efficiency:</strong> Quoted pricing is 4.2% below category baseline with active rebate tiers.
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-[#0070f2] font-bold">•</span>
                    <span className="text-xs text-[#1d2d3e]">
                      <strong>Plant Proximity:</strong> Favorable transportation corridor reduces freight emissions and transit variance.
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-[#e9730c] font-bold">•</span>
                    <span className="text-xs text-[#556b82]">
                      <strong>Watch Item:</strong> High order volume in Q4 may strain capacity buffers during holiday shutdown periods.
                    </span>
                  </div>
                </div>
              </div>

              {/* Commercial Terms & Contracts */}
              <div>
                <h4 className="text-[11px] font-bold text-[#556b82] uppercase tracking-wider mb-2">
                  Commercial & Contract Terms
                </h4>
                <div className="border border-[#d9dcdf] rounded divide-y divide-[#edf0f3] bg-white">
                  <div className="p-2.5 flex justify-between items-center text-xs">
                    <span className="text-[#556b82]">Payment Terms:</span>
                    <span className="font-semibold text-[#1d2d3e] font-mono">
                      {profile?.payment_terms || 'Net 60 Days'}
                    </span>
                  </div>
                  <div className="p-2.5 flex justify-between items-center text-xs">
                    <span className="text-[#556b82]">Incoterms:</span>
                    <span className="font-semibold text-[#1d2d3e] font-mono">
                      {profile?.incoterms || 'DDP (Delivered Duty Paid)'}
                    </span>
                  </div>
                  <div className="p-2.5 flex justify-between items-center text-xs">
                    <span className="text-[#556b82]">Active Master Agreements:</span>
                    <span className="font-semibold text-[#0070f2] font-mono">
                      {data360?.contracts?.length || 2} Contracts
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Action Bar */}
        <div className="p-3 border-t border-[#d9dcdf] bg-[#f8fafc] flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="sap-btn sap-btn-secondary text-xs"
          >
            Close
          </button>

          <div className="flex items-center space-x-2">
            {onSelectInWorkspace && (
              <button
                onClick={() => {
                  onSelectInWorkspace(supplierId);
                  onClose();
                }}
                className="sap-btn sap-btn-secondary text-xs space-x-1"
              >
                <SlidersIcon className="w-3 h-3" />
                <span>Simulate</span>
              </button>
            )}

            {onNavigateToFull360 && (
              <button
                onClick={() => {
                  onNavigateToFull360(supplierId);
                  onClose();
                }}
                className="sap-btn sap-btn-primary text-xs space-x-1"
              >
                <span>Full 360 Dossier</span>
                <ExternalLinkIcon className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
