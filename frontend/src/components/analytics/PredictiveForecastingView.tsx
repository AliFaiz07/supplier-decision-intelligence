import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import {
  TrendingUpIcon,
  ShieldAlertIcon,
  LayersIcon,
  BuildingIcon,
  DollarSignIcon,
  TruckIcon
} from '../common/Icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Legend
} from 'recharts';

export const PredictiveForecastingView: React.FC = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('MAT-001');
  const [forecastData, setForecastData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    if (selectedMaterialId) {
      loadForecasts(selectedMaterialId);
    }
  }, [selectedMaterialId]);

  const loadMaterials = async () => {
    try {
      const res = await api.getPriceIntelligence();
      if (res.material_benchmarks) {
        setMaterials(res.material_benchmarks);
      }
    } catch (err) {
      console.error('Failed to load materials:', err);
    }
  };

  const loadForecasts = async (matId: string) => {
    try {
      setLoading(true);
      const res = await api.getPredictiveForecasts(matId);
      setForecastData(res);
    } catch (err) {
      console.error('Failed to load forecasts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !forecastData) {
    return <ProcessingIndicator operation="forecast" />;
  }

  const priceForecast = forecastData?.material_price_forecast;
  const supplierForecast = forecastData?.supplier_performance_forecast;
  const spendForecast = forecastData?.quarterly_spend_forecast;

  // Combine historical and forecast points for smooth chart rendering
  const chartData: any[] = [];
  if (priceForecast && priceForecast.historical_trend) {
    // Last 6 months of historical
    const histRecent = priceForecast.historical_trend.slice(-6);
    histRecent.forEach((h: any) => {
      chartData.push({
        month: h.month,
        actual_price: h.avg_price_eur,
        forecast_price: null,
        lower_bound: null,
        upper_bound: null
      });
    });

    if (priceForecast.forecast_points && histRecent.length > 0) {
      // Bridge last actual to first forecast point
      const lastHist = histRecent[histRecent.length - 1];
      chartData[chartData.length - 1].forecast_price = lastHist.avg_price_eur;
      chartData[chartData.length - 1].lower_bound = lastHist.avg_price_eur;
      chartData[chartData.length - 1].upper_bound = lastHist.avg_price_eur;

      priceForecast.forecast_points.forEach((f: any) => {
        chartData.push({
          month: f.month,
          actual_price: null,
          forecast_price: f.projected_price_eur,
          lower_bound: f.confidence_lower_eur,
          upper_bound: f.confidence_upper_eur
        });
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#d5dbe1] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase bg-[#0a6ed1]/10 text-[#0a6ed1] px-2 py-0.5 rounded-[2px] font-semibold">
              Model Estimate
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Statistical Trend Regression (95% Confidence Band)
            </span>
          </div>
          <h2 className="text-base font-semibold text-slate-900 mt-1">
            Predictive Procurement Forecasting
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Statistical forward projections for material pricing, supplier OTIF reliability, and quarterly spend allocation based on 24-month empirical telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-600">Material:</label>
          <select
            value={selectedMaterialId}
            onChange={(e) => setSelectedMaterialId(e.target.value)}
            className="border border-slate-300 rounded-[2px] px-2.5 py-1.5 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#0a6ed1]"
          >
            {materials.map((m) => (
              <option key={m.material_id} value={m.material_id}>
                {m.material_id} - {m.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Price Forecast Chart */}
      <div className="bg-white border border-[#d5dbe1] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <TrendingUpIcon className="w-3.5 h-3.5 text-[#0a6ed1]" />
              <span>6-Month Material Price Forecast & Confidence Band</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Target: {selectedMaterialId} | Methodology: {priceForecast?.methodology}
            </p>
          </div>
          <div className="mt-2 sm:mt-0 flex items-center space-x-3 text-[11px]">
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-[#0a6ed1]"></span>
              <span className="text-slate-600">Actual Historical</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-amber-600 border-dashed border-t"></span>
              <span className="text-slate-600">Projected Price</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 bg-amber-100/60 border border-amber-300"></span>
              <span className="text-slate-600">95% Range</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#64748b" />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 11 }}
                stroke="#64748b"
                tickFormatter={(v) => `€${v}`}
              />
              <Tooltip
                formatter={(val: any, name: string) => {
                  if (!val) return ['-', name];
                  if (name === 'actual_price') return [`€${Number(val).toFixed(2)}`, 'Historical Average'];
                  if (name === 'forecast_price') return [`€${Number(val).toFixed(2)}`, 'Projected Price'];
                  if (name === 'upper_bound') return [`€${Number(val).toFixed(2)}`, 'Upper 95% Bound'];
                  if (name === 'lower_bound') return [`€${Number(val).toFixed(2)}`, 'Lower 95% Bound'];
                  return [val, name];
                }}
              />
              <Area
                type="monotone"
                dataKey="upper_bound"
                stroke="transparent"
                fill="#fef3c7"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="lower_bound"
                stroke="transparent"
                fill="#ffffff"
                fillOpacity={1.0}
              />
              <Line
                type="monotone"
                dataKey="actual_price"
                stroke="#0a6ed1"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0a6ed1' }}
              />
              <Line
                type="monotone"
                dataKey="forecast_price"
                stroke="#d97706"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#d97706' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#f8fafc] border border-slate-200 p-3 rounded-[2px] flex items-center justify-between text-[11px] text-slate-600">
          <span>
            <strong className="text-slate-800">Confidence Assessment: </strong>
            Model fit confidence is {priceForecast?.model_confidence_pct}%. Based on 24 months of SAP Purchasing Info Record price revisions.
          </span>
          <span className="font-mono text-slate-500 uppercase text-[10px]">Statistical Estimate Only</span>
        </div>
      </div>

      {/* Secondary Forecasts: Supplier Delivery & Spend Outlay */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Supplier Delivery Forecast */}
        {supplierForecast && (
          <div className="bg-white border border-[#d5dbe1] p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <TruckIcon className="w-3.5 h-3.5 text-[#0a6ed1]" />
                <span>Supplier Delivery Reliability Forecast</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Model Estimate</span>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">{supplierForecast.supplier_name}</p>
              <p className="text-[11px] text-slate-500 font-mono">Partner: {supplierForecast.supplier_id}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#f8fafc] border border-slate-200 p-3 rounded-[2px]">
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-semibold">Lifetime OTIF</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{supplierForecast.current_otif_pct}%</p>
                <p className="text-[10px] text-slate-400 font-mono">Verified GR baseline</p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-semibold">Projected Next Quarter</span>
                <p
                  className={`text-base font-bold mt-0.5 ${
                    supplierForecast.trend_direction === 'Declining' ? 'text-red-700' : 'text-emerald-700'
                  }`}
                >
                  {supplierForecast.projected_otif_next_quarter_pct}%
                </p>
                <p className="text-[10px] text-slate-500 font-mono">{supplierForecast.trend_direction} Trajectory</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-600">
              Forward projection extrapolated using moving average dock receipt delay curves. 
              {supplierForecast.trend_direction === 'Declining'
                ? ' Warning: Vendor exhibits persistent downward variance requiring safety stock buffering.'
                : ' Vendor performance remains within reliable manufacturing thresholds.'}
            </p>
          </div>
        )}

        {/* Spend Outlay Projection */}
        {spendForecast && (
          <div className="bg-white border border-[#d5dbe1] p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <DollarSignIcon className="w-3.5 h-3.5 text-[#0a6ed1]" />
                <span>Quarterly Spend Projection (Q4 2026)</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Model Estimate</span>
            </div>

            <div className="flex items-baseline space-x-3">
              <span className="text-2xl font-bold text-slate-900 font-mono">
                €{(spendForecast.projected_spend_eur / 1_000_000).toFixed(2)}M
              </span>
              <span className="text-xs font-semibold text-emerald-700 font-mono">
                {spendForecast.projected_growth_pct > 0 ? '+' : ''}{spendForecast.projected_growth_pct}% vs Q3
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Top Projected Material Outlays:
              </p>
              {spendForecast.top_material_exposures.map((m: any) => (
                <div key={m.material_id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                  <span className="font-mono font-medium text-slate-800">{m.material_id}</span>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-slate-600">€{(m.projected_spend_eur / 1_000).toLocaleString()}k</span>
                    <span className="font-mono font-semibold text-[#0a6ed1] w-12 text-right">{m.share_pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mandatory Disclaimer */}
      <div className="p-3 bg-slate-100 border border-slate-300 text-slate-600 text-[11px] flex items-center space-x-2">
        <ShieldAlertIcon className="w-4 h-4 text-slate-500 shrink-0" />
        <span>
          <strong>Audit Disclaimer: </strong>
          {forecastData?.disclaimer || 'Model estimates are statistical forward projections. All sourcing awards remain subject to human buyer authorization.'}
        </span>
      </div>
    </div>
  );
};
