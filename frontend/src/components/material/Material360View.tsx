import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { BackNavigation } from '../common/BackNavigation';
import {
  LayersIcon,
  BuildingIcon,
  ShieldAlertIcon,
  CheckIcon,
  AlertTriangleIcon,
  DollarSignIcon,
  TrendingUpIcon,
  FileTextIcon
} from '../common/Icons';

interface Material360ViewProps {
  initialMaterialId?: string;
  onNavigateToSupplier360: (supplierId: string) => void;
  onNavigateToSourcing: (materialId: string) => void;
}

export const Material360View: React.FC<Material360ViewProps> = ({
  initialMaterialId = 'MAT-001',
  onNavigateToSupplier360,
  onNavigateToSourcing
}) => {
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(initialMaterialId);
  const [materialsList, setMaterialsList] = useState<any[]>([]);
  const [activeMaterialData, setActiveMaterialData] = useState<any>(null);
  const [priceData, setPriceData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMaterialsOverview();
  }, []);

  useEffect(() => {
    if (selectedMaterialId) {
      loadSingleMaterial(selectedMaterialId);
    }
  }, [selectedMaterialId]);

  const loadMaterialsOverview = async () => {
    try {
      const res = await api.getMaterialIntelligence();
      if (res.materials) {
        setMaterialsList(res.materials);
      }
    } catch (err: any) {
      console.error('Error loading materials list:', err);
    }
  };

  const loadSingleMaterial = async (matId: string) => {
    try {
      setLoading(true);
      const [matRes, priceRes] = await Promise.all([
        api.getMaterialIntelligence(matId),
        api.getPriceIntelligence(matId)
      ]);
      setActiveMaterialData(matRes.material || (matRes.all_materials ? matRes.all_materials.find((m: any) => m.material_id === matId) : null));
      setPriceData(priceRes);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load Material 360');
    } finally {
      setLoading(false);
    }
  };

  const m = activeMaterialData;

  return (
    <div className="space-y-5">
      <BackNavigation
        fallbackTab="analytics"
        fallbackSubtab="price"
        fallbackLabel="Material Intelligence"
      />

      {/* Header Selector Bar */}
      <div className="bg-white border border-[#d5dbe1] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <LayersIcon className="w-5 h-5 text-[#0a6ed1]" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
              Material 360 Strategic Dossier
            </h2>
            <p className="text-xs text-slate-500">
              Procurement portfolio intelligence across spend, pricing variance, vendor concentration, and quality standards.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-600">Material:</label>
          <select
            value={selectedMaterialId}
            onChange={(e) => setSelectedMaterialId(e.target.value)}
            className="border border-slate-300 rounded-[2px] px-3 py-1.5 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:border-[#0a6ed1]"
          >
            {materialsList.map((item) => (
              <option key={item.material_id} value={item.material_id}>
                {item.material_id} - {item.description}
              </option>
            ))}
          </select>
          <button
            onClick={() => onNavigateToSourcing(selectedMaterialId)}
            className="bg-[#0a6ed1] hover:bg-[#0854a0] text-white text-xs font-medium px-3.5 py-1.5 rounded-[2px] transition-colors flex items-center space-x-1.5"
          >
            <LayersIcon className="w-3.5 h-3.5" />
            <span>Launch Sourcing</span>
          </button>
        </div>
      </div>

      {loading && !m && (
        <ProcessingIndicator operation="general" message="Synthesizing Material 360 portfolio analytics..." />
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      {m && (
        <div className="space-y-5">
          {/* Key Facts & Status Row */}
          <div className="bg-white border border-[#d5dbe1] p-5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-[2px]">
                    {m.material_id}
                  </span>
                  <span className="text-[10px] font-mono font-semibold bg-blue-50 text-[#0a6ed1] px-2 py-0.5 rounded-[2px]">
                    Group: {m.material_group}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-[2px] uppercase ${
                      m.criticality === 'Critical'
                        ? 'bg-red-100 text-red-800'
                        : m.criticality === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Criticality: {m.criticality}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1.5">
                  {m.description}
                </h3>
              </div>

              <div className="flex items-center space-x-3 text-right">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold">Annual Spend</span>
                  <p className="text-xl font-bold text-[#0a6ed1]">
                    €{m.annual_spend_eur?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Metric Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
              <div className="bg-[#f8fafc] border border-slate-200 p-3">
                <span className="text-[10px] uppercase text-slate-500 font-semibold">Benchmark Price</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  €{m.benchmark_price_eur?.toFixed(2)}
                </p>
                <p className="text-[10px] text-slate-500">SAP Standard Price</p>
              </div>

              <div className="bg-[#f8fafc] border border-slate-200 p-3">
                <span className="text-[10px] uppercase text-slate-500 font-semibold">Approved Suppliers</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {m.supplier_count} Vendors
                </p>
                <p className="text-[10px] text-slate-500">In Source List</p>
              </div>

              <div className="bg-[#f8fafc] border border-slate-200 p-3">
                <span className="text-[10px] uppercase text-slate-500 font-semibold">Fleet Delivery OTD</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {m.otif_pct}%
                </p>
                <p className="text-[10px] text-emerald-600 font-mono">Verified GRs</p>
              </div>

              <div className="bg-[#f8fafc] border border-slate-200 p-3">
                <span className="text-[10px] uppercase text-slate-500 font-semibold">Defect Rejection</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {m.defect_rate_pct}%
                </p>
                <p className="text-[10px] text-slate-500 font-mono">QM Inspection</p>
              </div>

              <div className="bg-[#f8fafc] border border-slate-200 p-3">
                <span className="text-[10px] uppercase text-slate-500 font-semibold">Primary Supplier</span>
                <p className="text-xs font-bold text-slate-900 mt-1 truncate">
                  {m.primary_supplier_name}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">{m.primary_supplier_id}</p>
              </div>

              <div className="bg-[#f8fafc] border border-slate-200 p-3">
                <span className="text-[10px] uppercase text-slate-500 font-semibold">Concentration Share</span>
                <p
                  className={`text-sm font-bold mt-0.5 ${
                    m.supplier_concentration_pct > 40 ? 'text-amber-700' : 'text-slate-900'
                  }`}
                >
                  {m.supplier_concentration_pct}%
                </p>
                <p className="text-[10px] text-slate-500">
                  {m.supplier_concentration_pct > 40 ? 'Elevated Dependency' : 'Balanced Portfolio'}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing & Commercial Position */}
          {priceData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Price Spread & Volatility */}
              <div className="bg-white border border-[#d5dbe1] p-5">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center space-x-2">
                  <TrendingUpIcon className="w-3.5 h-3.5 text-[#0a6ed1]" />
                  <span>Commercial Price Distribution & Spread</span>
                </h4>
                <div className="grid grid-cols-3 gap-3 bg-[#f8fafc] border border-slate-200 p-3 text-xs mb-4">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold">Lowest Quoted</span>
                    <p className="text-base font-bold text-emerald-700 mt-0.5">
                      €{priceData.price_spread?.min_price_eur?.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">SUP-002</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold">Median Market</span>
                    <p className="text-base font-bold text-slate-900 mt-0.5">
                      €{priceData.price_spread?.median_price_eur?.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">Fleet Median</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold">Highest Quoted</span>
                    <p className="text-base font-bold text-red-700 mt-0.5">
                      €{priceData.price_spread?.max_price_eur?.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">Spread: €{priceData.price_spread?.spread_eur?.toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                    Supplier Current Quoted Prices
                  </h5>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {priceData.supplier_comparison_chart?.map((s: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-slate-500 text-[11px]">{s.supplier_id}</span>
                          <span className="font-medium text-slate-900 truncate max-w-xs">{s.supplier_name}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-mono font-semibold text-slate-900">
                            €{s.latest_price_eur?.toFixed(2)}
                          </span>
                          <button
                            onClick={() => onNavigateToSupplier360(s.supplier_id)}
                            className="text-[10px] text-[#0a6ed1] hover:underline"
                          >
                            Inspect
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Procurement Context Assessment */}
              <div className="bg-white border border-[#d5dbe1] p-5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                      <FileTextIcon className="w-3.5 h-3.5 text-[#0a6ed1]" />
                      <span>AI Material Sourcing Assessment</span>
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">Structured Intelligence</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    Material <strong className="font-semibold text-slate-900">{m.material_id} ({m.description})</strong> accounts for{' '}
                    <strong className="font-semibold text-[#0a6ed1]">€{m.annual_spend_eur?.toLocaleString()}</strong> in annual procurement spend across {m.supplier_count} qualified suppliers.
                  </p>

                  <div className="space-y-2 mt-3 text-xs text-slate-600">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-[2px]">
                      <span className="font-semibold text-slate-800">Commercial Sourcing Strategy:</span>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {m.supplier_count <= 2
                          ? 'Single/Dual-source bottleneck identified. Strategic buyer recommendation is to qualify secondary sources.'
                          : 'Healthy multi-vendor competition with active outline agreements ensuring price stability.'}
                      </p>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-[2px]">
                      <span className="font-semibold text-slate-800">Quality & Reliability Baseline:</span>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Fleet on-time delivery stands at {m.otif_pct}%, with an average defect rejection of {m.defect_rate_pct}%. Sourcing decisions should heavily weigh delivery penalties.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Plant Relevance: P001, P002, P003
                  </span>
                  <button
                    onClick={() => onNavigateToSourcing(m.material_id)}
                    className="text-xs bg-[#0a6ed1] hover:bg-[#0854a0] text-white px-3 py-1.5 rounded-[2px] transition-colors"
                  >
                    Evaluate Sourcing Options
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
