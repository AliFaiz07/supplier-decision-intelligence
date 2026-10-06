import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { SupplierComparisonView } from '../comparison/SupplierComparisonView';
import { Supplier360View } from '../supplier360/Supplier360View';
import { PageHeader } from '../common/PageHeader';
import { ScaleIcon, BuildingIcon, LayersIcon, CheckIcon, AlertTriangleIcon } from '../common/Icons';

export type SupplierSubTab = 'directory' | 'benchmarking' | '360';

interface SupplierIntelligenceViewProps {
  initialSupplierId?: string;
  initialSubTab?: SupplierSubTab;
}

export const SupplierIntelligenceView: React.FC<SupplierIntelligenceViewProps> = ({
  initialSupplierId = 'SUP-006',
  initialSubTab = 'directory'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SupplierSubTab>(initialSubTab);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(initialSupplierId);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');

  useEffect(() => {
    loadDirectory();
  }, []);

  useEffect(() => {
    if (initialSupplierId) {
      setSelectedSupplierId(initialSupplierId);
    }
  }, [initialSupplierId]);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const loadDirectory = async () => {
    try {
      const res = await api.getSupplierPerformanceAnalytics();
      if (res.supplier_benchmarks) {
        setSuppliers(res.supplier_benchmarks);
      }
    } catch (err) {
      console.error('Error loading supplier benchmarks:', err);
    }
  };

  const handleNavigateTo360 = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    setActiveSubTab('360');
  };

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch =
      s.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.supplier_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || s.strategic_tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        title="Supplier Intelligence & 360 Portfolios"
        subtitle="Empirical supplier dossiers, multi-vendor benchmarking matrices, historical OTIF trends, quality conformance telemetry, and financial risk profiles."
        breadcrumbs={[
          { label: 'Supplier Decision Intelligence' },
          { label: 'Suppliers' },
          {
            label:
              activeSubTab === '360'
                ? `Supplier 360 Dossier (${selectedSupplierId})`
                : activeSubTab === 'benchmarking'
                ? 'Vendor Benchmarking'
                : 'Supplier Directory'
          }
        ]}
        badges={[
          { label: '16 Qualified SAP Vendors', variant: 'info' },
          { label: 'Org 1000 Master Data', variant: 'neutral' }
        ]}
      />

      {/* Modern Sub-navigation switcher */}
      <div className="bg-white border border-[#e2e8f0] px-4 py-2 flex items-center justify-between text-xs overflow-x-auto rounded-xl shadow-xs">
        <div className="flex items-center space-x-1.5 py-1">
          <button
            onClick={() => setActiveSubTab('directory')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeSubTab === 'directory'
                ? 'bg-[#0066cc] text-white shadow-xs font-semibold'
                : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#f1f5f9]'
            }`}
          >
            <BuildingIcon className={`w-3.5 h-3.5 ${activeSubTab === 'directory' ? 'text-white' : 'text-[#64748b]'}`} />
            <span>Supplier Directory & Portfolios</span>
          </button>

          <button
            onClick={() => setActiveSubTab('benchmarking')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeSubTab === 'benchmarking'
                ? 'bg-[#0066cc] text-white shadow-xs font-semibold'
                : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#f1f5f9]'
            }`}
          >
            <ScaleIcon className={`w-3.5 h-3.5 ${activeSubTab === 'benchmarking' ? 'text-white' : 'text-[#64748b]'}`} />
            <span>Supplier Benchmarking & Comparison Matrix</span>
          </button>

          <button
            onClick={() => setActiveSubTab('360')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeSubTab === '360'
                ? 'bg-[#0066cc] text-white shadow-xs font-semibold'
                : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#f1f5f9]'
            }`}
          >
            <LayersIcon className={`w-3.5 h-3.5 ${activeSubTab === '360' ? 'text-white' : 'text-[#64748b]'}`} />
            <span>Supplier 360 Deep Profile Dossier</span>
          </button>
        </div>

        <div className="text-[11px] text-[#64748b] font-medium hidden sm:inline pr-2">
          {activeSubTab === '360'
            ? `Active Dossier: ${selectedSupplierId}`
            : `16 Qualified SAP Business Partners`}
        </div>
      </div>

      {/* Body Content */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="sap-card p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by supplier name, ID, or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="sap-input w-full sm:w-80"
              />
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="sap-select"
              >
                <option value="ALL">All Strategic Tiers</option>
                <option value="Strategic Partner">Strategic Partner</option>
                <option value="Preferred">Preferred</option>
                <option value="Standard">Standard</option>
              </select>
            </div>

            <div className="text-[#556b82] font-mono text-[11px]">
              Showing {filteredSuppliers.length} of {suppliers.length} vendors
            </div>
          </div>

          {/* Directory Table */}
          <div className="sap-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="sap-table w-full">
                <thead>
                  <tr>
                    <th className="w-24">Vendor ID</th>
                    <th>Supplier Name</th>
                    <th>Country</th>
                    <th>Strategic Tier</th>
                    <th className="text-right">Total Net Spend</th>
                    <th className="text-right">OTD %</th>
                    <th className="text-right">Defect %</th>
                    <th>Outline Contract</th>
                    <th>Risk Rating</th>
                    <th className="text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((s: any, idx: number) => (
                    <tr key={idx}>
                      <td className="font-mono text-[#556b82] font-medium">{s.supplier_id}</td>
                      <td className="font-semibold text-[#1d2d3e]">{s.supplier_name}</td>
                      <td className="font-mono text-[#556b82] text-xs">{s.country}</td>
                      <td>
                        <span className="sap-badge sap-badge-neutral">
                          {s.strategic_tier}
                        </span>
                      </td>
                      <td className="font-mono text-right text-[#1d2d3e] font-medium">
                        €{s.total_spend_eur?.toLocaleString()}
                      </td>
                      <td className="font-mono text-right font-semibold text-[#107e3e]">
                        {s.otd_pct}%
                      </td>
                      <td className="font-mono text-right text-[#556b82]">
                        {s.rejection_pct}%
                      </td>
                      <td>
                        <span
                          className={`sap-badge ${
                            s.has_active_contract
                              ? 'sap-badge-success'
                              : 'sap-badge-neutral'
                          }`}
                        >
                          {s.has_active_contract ? 'Active Agreement' : 'Spot Purchase'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`sap-badge uppercase ${
                            s.risk_rating === 'High' || s.risk_rating === 'Critical'
                              ? 'sap-badge-error'
                              : s.risk_rating === 'Medium'
                              ? 'sap-badge-warning'
                              : 'sap-badge-neutral'
                          }`}
                        >
                          {s.risk_rating}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => handleNavigateTo360(s.supplier_id)}
                          className="sap-btn sap-btn-primary text-xs h-7 px-2.5"
                        >
                          Open 360
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'benchmarking' && (
        <SupplierComparisonView onNavigateTo360={handleNavigateTo360} />
      )}

      {activeSubTab === '360' && (
        <Supplier360View initialSupplierId={selectedSupplierId} />
      )}
    </div>
  );
};
