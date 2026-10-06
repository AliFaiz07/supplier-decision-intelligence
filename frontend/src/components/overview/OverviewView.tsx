import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import {
  AlertTriangleIcon,
  FileTextIcon,
  SparklesIcon,
  CalendarIcon,
  UsersIcon,
  BoxIcon,
  ActivityIcon,
  ChevronDownIcon,
  CheckIcon
} from '../common/Icons';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface OverviewViewProps {
  onSelectRequirement: (reqId: string) => void;
  onNavigateTab: (tab: string, subtab?: string, targetId?: string) => void;
  onOpenAssistantWithQuery?: (query: string) => void;
  onOpenSupplierDrawer?: (supplierId: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onSelectRequirement,
  onNavigateTab,
  onOpenAssistantWithQuery,
  onOpenSupplierDrawer
}) => {
  const [kpis, setKpis] = useState<any>(null);
  const [spendData, setSpendData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<string>('Last 3 months');
  const [showDateDropdown, setShowDateDropdown] = useState<boolean>(false);

  const DATE_OPTIONS = [
    { id: '30d', label: 'Last 30 days', period: 'Sep 2026 - Oct 2026' },
    { id: '3m', label: 'Last 3 months', period: 'Jul 2026 - Oct 2026' },
    { id: '6m', label: 'Last 6 months', period: 'Apr 2026 - Oct 2026' },
    { id: 'ytd', label: 'Year to date (2026)', period: 'Jan 2026 - Oct 2026' },
    { id: '12m', label: 'Trailing 12 months', period: 'Oct 2025 - Oct 2026' },
  ];

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    try {
      setLoading(true);
      const [kpiRes, spendRes] = await Promise.all([
        api.getOverviewKpis(),
        api.getSpendAnalytics()
      ]);
      setKpis(kpiRes);
      setSpendData(spendRes);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load procurement overview data');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !kpis) {
    return <ProcessingIndicator operation="general" message="Synthesizing enterprise procurement signals and spend analytics..." />;
  }

  if (error) {
    return (
      <div className="p-6 bg-[#fef2f2] border border-[#fecaca] text-[#bb0000] text-xs rounded-md">
        <p className="font-semibold">Error Loading Overview</p>
        <p>{error}</p>
      </div>
    );
  }

  // Delivery performance trend data (Jan to Oct ending at 92%)
  const deliveryTrendData = [
    { month: 'Jan', otd: 88 },
    { month: 'Feb', otd: 87 },
    { month: 'Mar', otd: 89 },
    { month: 'Apr', otd: 86 },
    { month: 'May', otd: 87 },
    { month: 'Jun', otd: 85 },
    { month: 'Jul', otd: 88 },
    { month: 'Aug', otd: 89 },
    { month: 'Sep', otd: 88 },
    { month: 'Oct', otd: 92 },
  ];

  // Material spend data matching reference
  const materialSpendData = [
    { id: 'M-001', spend: '₹12.4M', pct: 100, color: '#1976d2' },
    { id: 'M-003', spend: '₹8.7M', pct: 70, color: '#1976d2' },
    { id: 'M-004', spend: '₹6.1M', pct: 49, color: '#60a5fa' },
    { id: 'M-007', spend: '₹4.3M', pct: 35, color: '#93c5fd' },
    { id: 'M-010', spend: '₹2.8M', pct: 22, color: '#bfdbfe' },
  ];

  // Supplier risk distribution data (26 suppliers)
  const riskPieData = [
    { name: 'High Risk', count: 4, pct: '15%', color: '#ef4444' },
    { name: 'Medium Risk', count: 7, pct: '27%', color: '#f97316' },
    { name: 'Low Risk', count: 11, pct: '42%', color: '#3b82f6' },
    { name: 'Minimal Risk', count: 4, pct: '15%', color: '#bfdbfe' },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Header Row (Greeting + Actions) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-start space-x-2.5">
          <div className="mt-1 text-[#1976d2]">
            <SparklesIcon className="w-5 h-5 text-[#1976d2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#0f172a] leading-tight">
              Good morning, Amit
            </h1>
            <p className="text-xs sm:text-[13px] text-[#64748b] mt-0.5">
              Here's what's happening with your procurement operations.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {/* Interactive Date Range Selector */}
          <div className="relative">
            <button
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className={`flex items-center space-x-2 px-3 py-2 bg-white border rounded-lg text-xs font-medium shadow-xs transition-colors cursor-pointer ${
                showDateDropdown ? 'border-[#1976d2] ring-1 ring-[#1976d2]/20 text-[#0f172a]' : 'border-[#e2e8f0] text-[#334155] hover:border-[#cbd5e1]'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#1976d2]" />
              <span>{dateRange}</span>
              <ChevronDownIcon className={`w-3 h-3 text-[#94a3b8] transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDateDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDateDropdown(false)}
                />
                <div className="absolute right-0 mt-1.5 w-60 bg-white border border-[#e2e8f0] rounded-xl shadow-xl py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3.5 py-2 border-b border-[#f1f5f9] text-[10px] uppercase font-bold text-[#64748b] tracking-wider">
                    Select Analysis Horizon
                  </div>
                  <div className="py-1">
                    {DATE_OPTIONS.map((opt) => {
                      const isSelected = dateRange === opt.label;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setDateRange(opt.label);
                            setShowDateDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-left transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#f0f7ff] text-[#1976d2] font-semibold' : 'text-[#334155] hover:bg-[#f8fafc]'
                          }`}
                        >
                          <div>
                            <div className="text-xs">{opt.label}</div>
                            <div className="text-[10px] text-[#94a3b8] font-normal">{opt.period}</div>
                          </div>
                          {isSelected && <CheckIcon className="w-3.5 h-3.5 text-[#1976d2] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => onSelectRequirement('REQ-001')}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#1976d2] hover:bg-[#1565c0] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <span>+ New Sourcing Analysis</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 KPI Cards (Row 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Decisions */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#e3f2fd] text-[#1976d2] flex items-center justify-center shrink-0">
              <FileTextIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0f172a] leading-none">12</div>
              <div className="text-xs text-[#64748b] mt-1 font-medium">Active Decisions</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-[#16a34a] flex items-center justify-end space-x-0.5">
              <span>↑ 20%</span>
            </div>
            <div className="text-[10px] text-[#94a3b8] mt-0.5">vs last month</div>
          </div>
        </div>

        {/* Card 2: Suppliers */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#e3f2fd] text-[#1976d2] flex items-center justify-center shrink-0">
              <UsersIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0f172a] leading-none">26</div>
              <div className="text-xs text-[#64748b] mt-1 font-medium">Suppliers</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-[#16a34a] flex items-center justify-end space-x-0.5">
              <span>↑ 8%</span>
            </div>
            <div className="text-[10px] text-[#94a3b8] mt-0.5">performance improvement</div>
          </div>
        </div>

        {/* Card 3: Materials */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#fff3e0] text-[#f57c00] flex items-center justify-center shrink-0">
              <BoxIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0f172a] leading-none">10</div>
              <div className="text-xs text-[#64748b] mt-1 font-medium">Materials</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-[#f57c00]">3 need attention</div>
          </div>
        </div>

        {/* Card 4: Contracts */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#e8eaf6] text-[#3f51b5] flex items-center justify-center shrink-0">
              <FileTextIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0f172a] leading-none">6</div>
              <div className="text-xs text-[#64748b] mt-1 font-medium">Contracts</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-[#ef4444]">2 expiring soon</div>
          </div>
        </div>
      </div>

      {/* 3. Attention Required Container (Row 2) */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangleIcon className="w-4 h-4 text-[#ef4444]" />
            <h2 className="text-sm font-bold text-[#0f172a]">
              Attention Required
            </h2>
            <span className="bg-[#ffebee] text-[#d32f2f] text-[11px] font-semibold px-2 py-0.5 rounded-full">
              3 critical
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('analytics', 'attention')}
            className="text-xs text-[#1976d2] hover:underline font-medium"
          >
            View all
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Card 1: Supplier capacity risk */}
          <div
            onClick={() => onOpenSupplierDrawer ? onOpenSupplierDrawer('SUP-006') : onNavigateTab('suppliers', '360', 'SUP-006')}
            className="p-3.5 rounded-xl border border-[#fecaca] bg-[#fffbfb] hover:border-[#ef4444] transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-full bg-[#ef5350] text-white flex items-center justify-center font-bold text-xs shrink-0">
                !
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0f172a]">Supplier capacity risk</h4>
                <p className="text-[11px] text-[#64748b]">Atlas Components (S104)</p>
                <p className="text-[11px] text-[#475569] mt-0.5 leading-snug">
                  Capacity expected to fall 20% next month.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 shrink-0 ml-2">
              <span className="bg-[#ffebee] text-[#c62828] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                High
              </span>
              <span className="text-[#94a3b8] text-sm">›</span>
            </div>
          </div>

          {/* Card 2: Contract expiry */}
          <div
            onClick={() => onNavigateTab('analytics', 'contracts')}
            className="p-3.5 rounded-xl border border-[#fed7aa] bg-[#fffdfa] hover:border-[#f97316] transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-lg bg-[#fff3e0] text-[#f57c00] flex items-center justify-center shrink-0">
                <AlertTriangleIcon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0f172a]">Contract expiry</h4>
                <p className="text-[11px] text-[#64748b]">Nova Industrial (S108)</p>
                <p className="text-[11px] text-[#475569] mt-0.5 leading-snug">
                  Contract expires in 18 days.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 shrink-0 ml-2">
              <span className="bg-[#fff8e1] text-[#f57c00] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Medium
              </span>
              <span className="text-[#94a3b8] text-sm">›</span>
            </div>
          </div>

          {/* Card 3: Price anomaly */}
          <div
            onClick={() => onNavigateTab('analytics', 'price')}
            className="p-3.5 rounded-xl border border-[#bfdbfe] bg-[#f8fbff] hover:border-[#3b82f6] transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-lg bg-[#e3f2fd] text-[#1976d2] flex items-center justify-center shrink-0">
                <ActivityIcon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0f172a]">Price anomaly</h4>
                <p className="text-[11px] text-[#64748b]">Material M-004</p>
                <p className="text-[11px] text-[#475569] mt-0.5 leading-snug">
                  Latest quotation is 11% above historical range.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 shrink-0 ml-2">
              <span className="bg-[#e8f0fe] text-[#1976d2] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Medium
              </span>
              <span className="text-[#94a3b8] text-sm">›</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Latest Sourcing Decision & AI Insight (Row 3: 50% / 50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Card: Latest Sourcing Decision */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0f172a]">
                Latest Sourcing Decision
              </h3>
              <button
                onClick={() => onSelectRequirement('REQ-001')}
                className="text-xs text-[#1976d2] font-medium hover:underline flex items-center space-x-0.5"
              >
                <span>View decision</span>
                <span>→</span>
              </button>
            </div>

            <div className="mt-1.5">
              <div className="text-lg font-bold text-[#0f172a]">REQ-1042</div>
              <p className="text-[11px] text-[#64748b] mt-0.5">
                M-001 · Plant P001 · 10,000 units · Required: 15 Oct 2026
              </p>
            </div>

            {/* Recommended Box */}
            <div
              onClick={() => onSelectRequirement('REQ-001')}
              className="mt-3 p-3 bg-[#f0f7ff] border border-[#d0e2ff] rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#e6f0fe] transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-5 h-5 rounded-full border-2 border-[#1976d2] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#1976d2]"></div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-[#16a34a] leading-none">Recommended</div>
                  <div className="text-sm font-bold text-[#0f172a] mt-0.5">S104 Atlas Components</div>
                </div>
              </div>
              <span className="text-[#94a3b8] text-sm">›</span>
            </div>

            {/* 4 Metrics Strip */}
            <div className="grid grid-cols-4 gap-2 pt-4 pb-3 border-b border-[#f1f5f9]">
              <div>
                <div className="text-base font-bold text-[#0f172a] font-mono">₹48.6L</div>
                <div className="text-[11px] text-[#64748b] flex items-center space-x-0.5 mt-0.5">
                  <span>Effective Cost</span>
                  <span className="text-[10px] text-[#94a3b8]">ⓘ</span>
                </div>
              </div>
              <div>
                <div className="text-base font-bold text-[#0f172a] font-mono">92%</div>
                <div className="text-[11px] text-[#64748b] flex items-center space-x-0.5 mt-0.5">
                  <span>On-time Delivery</span>
                  <span className="text-[10px] text-[#94a3b8]">ⓘ</span>
                </div>
              </div>
              <div>
                <div className="text-base font-bold text-[#0f172a] font-mono">1.4%</div>
                <div className="text-[11px] text-[#64748b] flex items-center space-x-0.5 mt-0.5">
                  <span>Rejection Rate</span>
                  <span className="text-[10px] text-[#94a3b8]">ⓘ</span>
                </div>
              </div>
              <div>
                <div className="text-base font-bold text-[#16a34a]">Low</div>
                <div className="text-[11px] text-[#64748b] flex items-center space-x-0.5 mt-0.5">
                  <span>Current Risk</span>
                  <span className="text-[10px] text-[#94a3b8]">ⓘ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5 pt-4">
            <button
              onClick={() => onSelectRequirement('REQ-001')}
              className="px-4 py-2 bg-[#1976d2] hover:bg-[#1565c0] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              View Decision
            </button>
            <button
              onClick={() => onNavigateTab('decisions', 'simulator')}
              className="px-4 py-2 bg-white hover:bg-[#f8fafc] text-[#334155] border border-[#e2e8f0] text-xs font-medium rounded-lg shadow-xs transition-colors"
            >
              Run What-If
            </button>
            <button
              onClick={() => onNavigateTab('decisions', 'stresstest')}
              className="px-4 py-2 bg-white hover:bg-[#f8fafc] text-[#334155] border border-[#e2e8f0] text-xs font-medium rounded-lg shadow-xs transition-colors"
            >
              Test Stress Scenario
            </button>
          </div>
        </div>

        {/* Right Card: AI Insight */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <SparklesIcon className="w-4 h-4 text-[#6366f1]" />
                <h3 className="text-sm font-bold text-[#0f172a]">
                  AI Insight
                </h3>
              </div>
              <button
                onClick={() => onOpenAssistantWithQuery && onOpenAssistantWithQuery('Why is Atlas Components recommended for REQ-1042?')}
                className="text-xs text-[#1976d2] font-medium hover:underline flex items-center space-x-0.5"
              >
                <span>Why this recommendation?</span>
                <span>→</span>
              </button>
            </div>

            <div className="mt-2">
              <h4 className="text-[13px] font-bold text-[#0f172a]">
                Atlas Components is recommended for this requirement.
              </h4>
              <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                It offers the lowest effective cost while maintaining strong delivery and quality performance within acceptable risk levels.
              </p>
            </div>

            {/* 3 Columns Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3.5 mt-3 border-t border-[#f1f5f9]">
              {/* Key Drivers */}
              <div>
                <div className="text-[11px] font-bold text-[#0f172a] mb-1.5">Key Drivers</div>
                <ul className="space-y-1 text-[11px] text-[#475569]">
                  <li className="flex items-center space-x-1.5">
                    <span className="text-[#16a34a] font-bold">✓</span>
                    <span>8.4% lower effective cost</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <span className="text-[#16a34a] font-bold">✓</span>
                    <span>Strong delivery reliability</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <span className="text-[#16a34a] font-bold">✓</span>
                    <span>Stable quality performance</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <span className="text-[#16a34a] font-bold">✓</span>
                    <span>Active contract coverage</span>
                  </li>
                </ul>
              </div>

              {/* Watch */}
              <div>
                <div className="text-[11px] font-bold text-[#b45309] flex items-center space-x-1 mb-1.5">
                  <span>⚠️</span>
                  <span>Watch</span>
                </div>
                <p className="text-[11px] text-[#475569] leading-snug">
                  Capacity expected to tighten next month.
                </p>
              </div>

              {/* What Could Change This? */}
              <div>
                <div className="text-[11px] font-bold text-[#4338ca] flex items-center space-x-1 mb-1.5">
                  <span>📈</span>
                  <span>What Could Change This?</span>
                </div>
                <p className="text-[11px] text-[#475569] leading-snug">
                  A delivery delay above 3 days would make Nova Industrial competitive.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 text-[11px] text-[#94a3b8] italic">
            Telemetry verified against Plant P001 operational ERP baseline.
          </div>
        </div>
      </div>

      {/* 5. Analytics Row (Row 4: 3 Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Card 1: Delivery Performance Trend (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3
              onClick={() => onNavigateTab('analytics', 'delivery')}
              className="text-sm font-bold text-[#0f172a] hover:text-[#1976d2] cursor-pointer transition-colors"
            >
              Delivery Performance Trend
            </h3>
            <button
              onClick={() => onNavigateTab('analytics', 'delivery')}
              title="Open Delivery Intelligence"
              className="text-[11px] font-semibold text-[#16a34a] bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 transition-colors cursor-pointer"
            >
              ↑ 4% vs previous period
            </button>
          </div>

          <div className="h-44 w-full relative">
            {/* October 92% Highlight badge */}
            <div className="absolute top-2 right-4 z-10 bg-[#1976d2] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
              92%
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={deliveryTrendData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="deliveryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1976d2" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[70, 100]}
                  ticks={[70, 80, 90, 100]}
                  tickFormatter={(val) => `${val}%`}
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: number) => [`${val}%`, 'OTD Reliability']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '11px' }}
                />
                <Area
                  type="monotone"
                  dataKey="otd"
                  stroke="#1976d2"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#deliveryGrad)"
                  dot={{ r: 2.5, fill: '#1976d2', strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Spend by Material (3.5 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <h3
              onClick={() => onNavigateTab('analytics', 'spend')}
              className="text-sm font-bold text-[#0f172a] hover:text-[#1976d2] cursor-pointer transition-colors"
            >
              Spend by Material
            </h3>
            <button
              onClick={() => onNavigateTab('analytics', 'spend')}
              title="Open Spend Analytics"
              className="p-1 -mr-1 rounded-md text-[#94a3b8] hover:text-[#1976d2] hover:bg-[#f1f5f9] transition-colors cursor-pointer flex items-center justify-center"
            >
              <span className="text-base font-bold leading-none">›</span>
            </button>
          </div>

          <div className="space-y-2.5 my-auto">
            {materialSpendData.map((item) => (
              <div key={item.id} className="flex items-center text-xs">
                <span className="w-12 text-[11px] font-mono text-[#64748b] shrink-0">
                  {item.id}
                </span>
                <div className="flex-1 mx-2 h-3 bg-[#f1f5f9] rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all"
                    style={{
                      width: `${item.pct}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
                <span className="w-12 text-right text-[11px] font-mono font-medium text-[#0f172a] shrink-0">
                  {item.spend}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Supplier Risk Distribution (3.5 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <h3
              onClick={() => onNavigateTab('analytics', 'risk')}
              className="text-sm font-bold text-[#0f172a] hover:text-[#1976d2] cursor-pointer transition-colors"
            >
              Supplier Risk Distribution
            </h3>
            <button
              onClick={() => onNavigateTab('analytics', 'risk')}
              title="Open Risk Intelligence"
              className="p-1 -mr-1 rounded-md text-[#94a3b8] hover:text-[#1976d2] hover:bg-[#f1f5f9] transition-colors cursor-pointer flex items-center justify-center"
            >
              <span className="text-base font-bold leading-none">›</span>
            </button>
          </div>

          <div className="flex items-center justify-between my-auto">
            {/* Donut Chart with Center Text */}
            <div className="w-28 h-28 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    innerRadius={32}
                    outerRadius={48}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-bold text-[#0f172a] leading-none">26</span>
                <span className="text-[9px] text-[#64748b]">Suppliers</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="space-y-1.5 pl-3">
              {riskPieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs space-x-3">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[11px] text-[#475569]">{item.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#0f172a] font-medium">
                    {item.count} ({item.pct})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
