import React, { useState, useEffect } from 'react';
import { ScenariosView } from '../scenarios/ScenariosView';
import { DecisionHistoryView } from '../history/DecisionHistoryView';
import { DecisionStressTestView } from './DecisionStressTestView';
import { ProcurementMemoryView } from './ProcurementMemoryView';
import { DecisionTwinView } from '../sourcing/DecisionTwinView';
import { ConcentrationSimulatorView } from '../risk/ConcentrationSimulatorView';
import {
  SlidersIcon,
  HistoryIcon,
  AlertOctagonIcon,
  CpuIcon,
  LayersIcon,
  ShieldAlertIcon
} from '../common/Icons';
import { PageHeader } from '../common/PageHeader';

export type DecisionsSubTab = 'twin' | 'simulator' | 'stresstest' | 'concentration' | 'memory' | 'history';

interface DecisionsHubViewProps {
  initialSubTab?: DecisionsSubTab;
  onOpenRequirementInWorkspace: (reqId: string) => void;
  onNavigateToSupplier360?: (supplierId: string) => void;
  onOpenAssistantWithQuery?: (query: string, context?: any) => void;
}

const DECISIONS_TABS = [
  { id: 'twin', label: 'Procurement Decision Twin', icon: LayersIcon },
  { id: 'stresstest', label: 'Decision Stress Testing (14 Shocks)', icon: AlertOctagonIcon },
  { id: 'concentration', label: 'Concentration Shock Simulator', icon: ShieldAlertIcon },
  { id: 'simulator', label: 'Scenario Simulator & What-If', icon: SlidersIcon },
  { id: 'memory', label: 'Procurement Memory (Expected vs Actual)', icon: CpuIcon },
  { id: 'history', label: 'Decision Audit History & Trace Logs', icon: HistoryIcon },
];

export const DecisionsHubView: React.FC<DecisionsHubViewProps> = ({
  initialSubTab = 'twin',
  onOpenRequirementInWorkspace,
  onNavigateToSupplier360,
  onOpenAssistantWithQuery
}) => {
  const [activeSubTab, setActiveSubTab] = useState<DecisionsSubTab>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const getDecisionQuestion = (tab: DecisionsSubTab): string => {
    switch (tab) {
      case 'twin':
        return 'How robust is this decision under weight shifts and priority changes?';
      case 'stresstest':
        return 'What happens to this sourcing decision under 14 macro stress shocks?';
      case 'concentration':
        return 'What is our exposure if a sole-source or concentrated supplier fails?';
      case 'simulator':
        return 'How do commercial weight adjustments alter supplier rankings?';
      case 'memory':
        return 'What happened after previous procurement awards vs expected metrics?';
      case 'history':
        return 'What sourcing decisions were executed, approved, and logged for audit?';
      default:
        return 'Procurement decision simulation, stress testing, and outcome memory.';
    }
  };

  const activeTabInfo = DECISIONS_TABS.find((t) => t.id === activeSubTab);

  return (
    <div className="space-y-5">
      {/* Page Header answering: One Primary Question per screen */}
      <PageHeader
        title={activeTabInfo?.label || 'Decisions & Scenarios'}
        subtitle={getDecisionQuestion(activeSubTab)}
        breadcrumbs={[
          { label: 'Supplier Decision Intelligence' },
          { label: 'Decisions' },
          { label: activeTabInfo?.label || 'Twin & Stress' }
        ]}
        badges={[
          { label: '14 Empirical Shocks Active', variant: 'warning' },
          { label: 'Deterministic MCDA Engine', variant: 'info' }
        ]}
        onAskAI={() => onOpenAssistantWithQuery && onOpenAssistantWithQuery(`Explain the simulation methodology in ${activeTabInfo?.label}`)}
      />

      {/* Sub-navigation bar */}
      <div className="bg-white border border-[#e2e8f0] p-1.5 flex items-center justify-between overflow-x-auto rounded-xl shadow-xs">
        <div className="flex space-x-1.5">
          {DECISIONS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as DecisionsSubTab)}
                className={`flex items-center space-x-2 py-2 px-3.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0066cc] text-white shadow-xs font-semibold'
                    : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#f8fafc]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#64748b]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <span className="text-[10px] font-mono text-[#94a3b8] hidden xl:inline pr-3">
          {activeSubTab === 'twin' && 'Live Sourcing Context Synchronization'}
          {activeSubTab === 'stresstest' && '14 Macro Shocks & 4 Recovery Strategies'}
          {activeSubTab === 'concentration' && 'HHI & Single-Source Disruption Engine'}
          {activeSubTab === 'simulator' && 'Parametric Weight Shifts & Scenario Modeling'}
          {activeSubTab === 'memory' && 'Empirical Learning Loop (Section 13)'}
          {activeSubTab === 'history' && 'Auditable S/4HANA PO Sourcing Archive'}
        </span>
      </div>

      {/* View Content */}
      <div>
        {activeSubTab === 'twin' && (
          <DecisionTwinView
            onNavigateToSupplier360={onNavigateToSupplier360 || (() => {})}
            onNavigateToStressTest={() => setActiveSubTab('stresstest')}
            onOpenAssistantWithQuery={onOpenAssistantWithQuery}
          />
        )}
        {activeSubTab === 'stresstest' && (
          <DecisionStressTestView
            onOpenRequirementInWorkspace={onOpenRequirementInWorkspace}
          />
        )}
        {activeSubTab === 'concentration' && (
          <ConcentrationSimulatorView
            onOpenRequirementInWorkspace={onOpenRequirementInWorkspace}
            onNavigateToSupplier360={onNavigateToSupplier360}
          />
        )}
        {activeSubTab === 'simulator' && (
          <ScenariosView onOpenRequirementInWorkspace={onOpenRequirementInWorkspace} />
        )}
        {activeSubTab === 'memory' && (
          <ProcurementMemoryView />
        )}
        {activeSubTab === 'history' && (
          <DecisionHistoryView />
        )}
      </div>
    </div>
  );
};
