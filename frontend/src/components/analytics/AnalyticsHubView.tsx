import React, { useState, useEffect } from 'react';
import { SpendAnalyticsView } from './SpendAnalyticsView';
import { PriceIntelligenceView } from '../price/PriceIntelligenceView';
import { DeliveryIntelligenceView } from '../delivery/DeliveryIntelligenceView';
import { QualityIntelligenceView } from '../quality/QualityIntelligenceView';
import { ContractIntelligenceView } from '../contract/ContractIntelligenceView';
import { RiskIntelligenceView } from '../risk/RiskIntelligenceView';
import { Material360View } from '../material/Material360View';
import { AnomalyCenterView } from './AnomalyCenterView';
import { PredictiveForecastingView } from './PredictiveForecastingView';
import { AttentionCenterView } from './AttentionCenterView';
import { ProcurementLeakageView } from './ProcurementLeakageView';
import {
  DollarSignIcon,
  TrendingUpIcon,
  TruckIcon,
  AwardIcon,
  FileTextIcon,
  ShieldAlertIcon,
  LayersIcon,
  AlertOctagonIcon,
  AlertTriangleIcon
} from '../common/Icons';

import { PageHeader } from '../common/PageHeader';

export type AnalyticsSubTab =
  | 'attention'
  | 'leakage'
  | 'anomalies'
  | 'forecasting'
  | 'spend'
  | 'price'
  | 'delivery'
  | 'quality'
  | 'contracts'
  | 'risk'
  | 'material360';

interface AnalyticsHubViewProps {
  initialSubTab?: AnalyticsSubTab;
  initialMaterialId?: string;
  onNavigateToSupplier360: (supplierId: string) => void;
  onNavigateToSourcing: (materialId: string) => void;
  onNavigateTab?: (tab: string, subtab?: string, targetId?: string) => void;
  onOpenAssistantWithQuery?: (query: string, context?: any) => void;
}

const ANALYTICS_SUBTABS: { id: AnalyticsSubTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'attention', label: 'Early Warning Center', icon: AlertOctagonIcon },
  { id: 'leakage', label: 'Procurement Leakage', icon: DollarSignIcon },
  { id: 'anomalies', label: 'Anomaly Center', icon: AlertTriangleIcon },
  { id: 'forecasting', label: 'Predictive Forecasts', icon: TrendingUpIcon },
  { id: 'spend', label: 'Spend Analytics', icon: DollarSignIcon },
  { id: 'price', label: 'Price Intelligence', icon: TrendingUpIcon },
  { id: 'delivery', label: 'Delivery Reliability', icon: TruckIcon },
  { id: 'quality', label: 'Quality Performance', icon: AwardIcon },
  { id: 'contracts', label: 'Outline Contracts', icon: FileTextIcon },
  { id: 'risk', label: 'Risk Intelligence', icon: ShieldAlertIcon },
  { id: 'material360', label: 'Material 360', icon: LayersIcon },
];

export const AnalyticsHubView: React.FC<AnalyticsHubViewProps> = ({
  initialSubTab = 'attention',
  initialMaterialId = 'MAT-001',
  onNavigateToSupplier360,
  onNavigateToSourcing,
  onNavigateTab,
  onOpenAssistantWithQuery
}) => {
  const [activeSubTab, setActiveSubTab] = useState<AnalyticsSubTab>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const getTabQuestion = (tab: AnalyticsSubTab): string => {
    switch (tab) {
      case 'attention':
        return 'What procurement signals require immediate buyer attention today?';
      case 'leakage':
        return 'Where is commercial cost leaking across price variance and spot execution?';
      case 'anomalies':
        return 'What unusual price or delivery deviations were flagged by statistical models?';
      case 'forecasting':
        return 'What are the projected spend, pricing, and volume trends for coming quarters?';
      case 'spend':
        return 'Where is spend concentrated and how much is protected under agreements?';
      case 'price':
        return 'Is this price reasonable compared to historical benchmarks?';
      case 'delivery':
        return 'Can this supplier deliver when required without production line risk?';
      case 'quality':
        return 'Will component quality create operational or scrap problems?';
      case 'contracts':
        return 'What contractual advantages or renewal constraints exist?';
      case 'risk':
        return 'What could go wrong across supplier stability and concentration?';
      case 'material360':
        return 'What is the complete commercial and supplier profile for this material?';
      default:
        return 'Continuous intelligence across procurement operations.';
    }
  };

  const currentTab = ANALYTICS_SUBTABS.find((t) => t.id === activeSubTab);

  return (
    <div className="space-y-5">
      {/* Page Header answering: One Primary Question per screen */}
      <PageHeader
        title={currentTab?.label || 'Procurement Intelligence'}
        subtitle={getTabQuestion(activeSubTab)}
        breadcrumbs={[
          { label: 'Supplier Decision Intelligence' },
          { label: 'Analytics' },
          { label: currentTab?.label || 'Intelligence' }
        ]}
        badges={[
          { label: '24-Mo Telemetry', variant: 'info' },
          { label: 'Verified SAP Data', variant: 'neutral' }
        ]}
        onAskAI={() => onOpenAssistantWithQuery && onOpenAssistantWithQuery(`Explain the key insights in ${currentTab?.label}`)}
      />

      {/* Sub-navigation bar */}
      <div className="bg-white border border-[#e2e8f0] px-4 py-2 flex items-center justify-between overflow-x-auto rounded-xl shadow-xs">
        <div className="flex items-center space-x-1.5 py-1">
          {ANALYTICS_SUBTABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0066cc] text-white shadow-xs font-semibold'
                    : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#f1f5f9]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#64748b]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <span className="text-[11px] font-medium text-[#64748b] hidden xl:inline pr-2">
          Continuous Strategic Telemetry
        </span>
      </div>

      {/* Active Sub-tab View */}
      <div>
        {activeSubTab === 'attention' && (
          <AttentionCenterView
            onNavigateTab={onNavigateTab}
            onOpenAssistantWithQuery={onOpenAssistantWithQuery}
          />
        )}
        {activeSubTab === 'leakage' && (
          <ProcurementLeakageView
            onNavigateToSupplier360={onNavigateToSupplier360}
            onNavigateToSourcing={onNavigateToSourcing}
          />
        )}
        {activeSubTab === 'anomalies' && <AnomalyCenterView />}
        {activeSubTab === 'forecasting' && <PredictiveForecastingView />}
        {activeSubTab === 'spend' && (
          <SpendAnalyticsView onNavigateToSupplier360={onNavigateToSupplier360} />
        )}
        {activeSubTab === 'price' && <PriceIntelligenceView />}
        {activeSubTab === 'delivery' && <DeliveryIntelligenceView />}
        {activeSubTab === 'quality' && <QualityIntelligenceView />}
        {activeSubTab === 'contracts' && <ContractIntelligenceView />}
        {activeSubTab === 'risk' && <RiskIntelligenceView />}
        {activeSubTab === 'material360' && (
          <Material360View
            initialMaterialId={initialMaterialId}
            onNavigateToSupplier360={onNavigateToSupplier360}
            onNavigateToSourcing={onNavigateToSourcing}
          />
        )}
      </div>
    </div>
  );
};
