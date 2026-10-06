import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Supplier } from '../../types';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { BackNavigation } from '../common/BackNavigation';
import { ScaleIcon, SearchIcon, AlertTriangleIcon, CheckIcon, BuildingIcon } from '../common/Icons';

interface SupplierComparisonViewProps {
  onNavigateTo360: (supplierId: string) => void;
}

export const SupplierComparisonView: React.FC<SupplierComparisonViewProps> = ({ onNavigateTo360 }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await api.getSuppliers('MAT-001');
      setSuppliers(data);
      if (data.length > 0) {
        setSelectedSupplier(data[0]);
      }
    } catch (err) {
      console.error('Failed to load suppliers for comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

  const filtered = suppliers.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.supplier_id.toLowerCase().includes(q) ||
      s.country.toLowerCase().includes(q) ||
      s.status.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let aVal: any = a[sortBy as keyof Supplier];
    let bVal: any = b[sortBy as keyof Supplier];

    if (sortBy === 'otd') {
      aVal = a.metrics?.on_time_delivery_rate_pct ?? 0;
      bVal = b.metrics?.on_time_delivery_rate_pct ?? 0;
    } else if (sortBy === 'rejection') {
      aVal = a.metrics?.quality_rejection_rate_pct ?? 0;
      bVal = b.metrics?.quality_rejection_rate_pct ?? 0;
    } else if (sortBy === 'price') {
      aVal = a.metrics?.latest_price_eur ?? 0;
      bVal = b.metrics?.latest_price_eur ?? 0;
    }

    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  if (loading) {
    return <ProcessingIndicator operation="general" message="Loading analytical supplier matrix..." />;
  }

  return (
    <div className="space-y-4">
      <BackNavigation
        fallbackTab="suppliers"
        fallbackSubtab="directory"
        fallbackLabel="Supplier Intelligence"
      />

      {/* Header Bar */}
      <div className="sap-card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-[#1d2d3e] tracking-tight">
              Supplier Performance Benchmarking
            </h2>
            <p className="text-xs text-[#556b82] mt-0.5">
              Primary Focus: Which supplier performs best across delivery reliability, quality rejection, pricing, and risk?
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search suppliers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="sap-input pl-8 w-60 text-xs"
              />
              <SearchIcon className="w-3.5 h-3.5 text-[#556b82] absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Comparison Table + Side Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Table Column (2 cols) */}
        <div className="lg:col-span-2 sap-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="sap-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('supplier_id')} className="cursor-pointer hover:bg-slate-100">
                    ID {sortBy === 'supplier_id' && (sortAsc ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('name')} className="cursor-pointer hover:bg-slate-100">
                    Supplier Name {sortBy === 'name' && (sortAsc ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('country')} className="cursor-pointer hover:bg-slate-100">
                    Country
                  </th>
                  <th onClick={() => handleSort('price')} className="cursor-pointer hover:bg-slate-100">
                    PIR Price {sortBy === 'price' && (sortAsc ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('otd')} className="cursor-pointer hover:bg-slate-100">
                    OTD % {sortBy === 'otd' && (sortAsc ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('rejection')} className="cursor-pointer hover:bg-slate-100">
                    Defect % {sortBy === 'rejection' && (sortAsc ? '▲' : '▼')}
                  </th>
                  <th>Contract</th>
                  <th>Risk Rating</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((s) => {
                  const isSelected = selectedSupplier?.supplier_id === s.supplier_id;
                  const isInactive = s.status === 'Inactive';
                  return (
                    <tr
                      key={s.supplier_id}
                      onClick={() => setSelectedSupplier(s)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#edf5ff]/50 font-medium' : isInactive ? 'opacity-60 bg-slate-50' : ''
                      }`}
                    >
                      <td className="font-mono">{s.supplier_id}</td>
                      <td className="font-medium text-[#1d2d3e]">{s.name}</td>
                      <td className="font-mono">{s.country}</td>
                      <td className="font-mono">
                        {s.metrics?.latest_price_eur ? `€${s.metrics.latest_price_eur.toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="font-mono">
                        <span
                          className={
                            (s.metrics?.on_time_delivery_rate_pct ?? 0) >= 92
                              ? 'text-[#107e3e] font-semibold'
                              : (s.metrics?.on_time_delivery_rate_pct ?? 0) < 80
                              ? 'text-[#bb0000] font-semibold'
                              : 'text-[#1d2d3e]'
                          }
                        >
                          {s.metrics?.on_time_delivery_rate_pct ?? 0}%
                        </span>
                      </td>
                      <td className="font-mono">
                        <span
                          className={
                            (s.metrics?.quality_rejection_rate_pct ?? 0) > 2.0
                              ? 'text-[#bb0000] font-semibold'
                              : 'text-[#1d2d3e]'
                          }
                        >
                          {s.metrics?.quality_rejection_rate_pct ?? 0}%
                        </span>
                      </td>
                      <td>
                        <span
                          className={`sap-badge ${
                            s.metrics?.has_active_contract
                              ? 'sap-badge-success'
                              : 'sap-badge-neutral'
                          } text-[10px] font-semibold`}
                        >
                          {s.metrics?.has_active_contract ? 'Contracted' : 'Spot'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`sap-badge ${
                            s.risk_rating === 'Low'
                              ? 'sap-badge-neutral'
                              : s.risk_rating === 'Medium'
                              ? 'sap-badge-warning'
                              : 'sap-badge-error'
                          } text-[10px] font-semibold`}
                        >
                          {s.risk_rating}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Supplier Context Inspector (1 col) */}
        {selectedSupplier && (
          <div className="sap-card p-5 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#edf0f3]">
              <div>
                <span className="sap-badge sap-badge-info text-[10px] font-mono">
                  {selectedSupplier.strategic_tier} Tier
                </span>
                <h3 className="text-sm font-semibold text-[#1d2d3e] mt-1">
                  {selectedSupplier.name}
                </h3>
                <p className="text-[11px] text-[#556b82] font-mono">
                  {selectedSupplier.supplier_id} | {selectedSupplier.city}, {selectedSupplier.country}
                </p>
              </div>
              <button
                onClick={() => onNavigateTo360(selectedSupplier.supplier_id)}
                className="sap-btn sap-btn-primary text-xs"
              >
                Full 360
              </button>
            </div>

            <p className="text-xs text-[#556b82] leading-relaxed">
              {selectedSupplier.profile_summary}
            </p>

            <div className="space-y-2 pt-2 border-t border-[#edf0f3] text-xs text-[#1d2d3e]">
              <div className="flex justify-between py-1 border-b border-[#edf0f3]">
                <span className="text-[#556b82]">Status:</span>
                <span className="font-semibold">{selectedSupplier.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#edf0f3]">
                <span className="text-[#556b82]">Historical Spend (24M):</span>
                <span className="font-mono">€{selectedSupplier.annual_spend_eur?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#edf0f3]">
                <span className="text-[#556b82]">Monthly Capacity:</span>
                <span className="font-mono">{selectedSupplier.max_capacity_units_per_month?.toLocaleString()} EA</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#edf0f3]">
                <span className="text-[#556b82]">Price Position:</span>
                <span className="font-medium">{selectedSupplier.metrics?.price_band_status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#edf0f3]">
                <span className="text-[#556b82]">Spend Concentration:</span>
                <span className={`font-mono ${selectedSupplier.metrics?.is_concentrated ? 'text-[#bb0000] font-bold' : ''}`}>
                  {selectedSupplier.metrics?.spend_concentration_pct}%
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#edf0f3]">
                <span className="text-[#556b82]">Average Delay:</span>
                <span className="font-mono">{selectedSupplier.metrics?.average_delay_days} Days</span>
              </div>
            </div>

            {selectedSupplier.metrics?.delivery_deteriorated && (
              <div className="p-2.5 bg-[#fff9f0] border border-[#f5b041]/40 text-[#964b00] text-xs rounded">
                <p className="font-semibold flex items-center space-x-1">
                  <AlertTriangleIcon className="w-3.5 h-3.5 text-[#e9730c]" />
                  <span>Delivery Deterioration Signal</span>
                </p>
                <p className="text-[11px] mt-0.5">
                  Trailing 90-day OTD fell to {selectedSupplier.metrics.trailing_90d_otd_pct}%.
                </p>
              </div>
            )}

            {selectedSupplier.metrics?.quality_deteriorated && (
              <div className="p-2.5 bg-[#fef0f0] border border-[#bb0000]/30 text-[#bb0000] text-xs rounded">
                <p className="font-semibold flex items-center space-x-1">
                  <AlertTriangleIcon className="w-3.5 h-3.5 text-[#bb0000]" />
                  <span>Quality Anomaly Signal</span>
                </p>
                <p className="text-[11px] mt-0.5">
                  Recent inspection lots show {selectedSupplier.metrics.trailing_60d_rejection_pct}% rejection.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
