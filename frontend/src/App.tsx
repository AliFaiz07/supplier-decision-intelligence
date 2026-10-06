import React, { useState } from 'react';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { TabId } from './components/common/NavigationTabs';
import { OverviewView } from './components/overview/OverviewView';
import { SourcingWorkspaceView } from './components/sourcing/SourcingWorkspaceView';
import { SupplierIntelligenceView, SupplierSubTab } from './components/supplier/SupplierIntelligenceView';
import { AnalyticsHubView, AnalyticsSubTab } from './components/analytics/AnalyticsHubView';
import { DecisionsHubView, DecisionsSubTab } from './components/decisions/DecisionsHubView';
import { DataExplorerView } from './components/explorer/DataExplorerView';
import { SystemHealthView } from './components/system/SystemHealthView';
import { AssistantWidget, AssistantContext } from './components/assistant/AssistantWidget';
import { SupplierDrawer } from './components/common/SupplierDrawer';
import { NavigationProvider } from './context/NavigationContext';
import { api } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Contextual Supplier Side Drawer
  const [drawerSupplierId, setDrawerSupplierId] = useState<string | null>(null);
  const [isSupplierDrawerOpen, setIsSupplierDrawerOpen] = useState<boolean>(false);

  // Sub-navigation states
  const [analyticsSubTab, setAnalyticsSubTab] = useState<AnalyticsSubTab>('attention');
  const [supplierSubTab, setSupplierSubTab] = useState<SupplierSubTab>('directory');
  const [decisionsSubTab, setDecisionsSubTab] = useState<DecisionsSubTab>('twin');

  // Cross-tab drilldown states
  const [targetedSupplierId, setTargetedSupplierId] = useState<string>('SUP-006');
  const [targetedReqId, setTargetedReqId] = useState<string>('REQ-001');
  const [targetedMaterialId, setTargetedMaterialId] = useState<string>('MAT-001');

  // AI Assistant active context & initial prompt
  const [assistantContext, setAssistantContext] = useState<AssistantContext | null>(null);
  const [assistantInitialQuery, setAssistantInitialQuery] = useState<string>('');

  const handleNavigateTab = (tab: string, subtab?: string, targetId?: string) => {
    if (tab === 'overview') {
      setActiveTab('overview');
    } else if (tab === 'sourcing') {
      if (targetId) setTargetedReqId(targetId);
      setActiveTab('sourcing');
    } else if (tab === 'suppliers' || tab === 'supplier_intel') {
      if (subtab === '360' || (targetId && targetId.startsWith('SUP-'))) {
        setSupplierSubTab('360');
        if (targetId) setTargetedSupplierId(targetId);
      } else if (subtab === 'benchmarking') {
        setSupplierSubTab('benchmarking');
      } else {
        setSupplierSubTab('directory');
      }
      setActiveTab('suppliers');
    } else if (
      tab === 'analytics' ||
      [
        'attention',
        'early_warning',
        'leakage',
        'price_intel',
        'delivery_intel',
        'quality_intel',
        'contract_intel',
        'risk_intel',
        'price',
        'delivery',
        'quality',
        'contracts',
        'risk',
        'material360',
        'spend',
        'anomalies',
        'forecasting'
      ].includes(tab)
    ) {
      if (subtab) {
        setAnalyticsSubTab(subtab as AnalyticsSubTab);
      } else if (tab === 'attention' || tab === 'early_warning') {
        setAnalyticsSubTab('attention');
      } else if (tab === 'leakage') {
        setAnalyticsSubTab('leakage');
      } else if (tab === 'anomalies') {
        setAnalyticsSubTab('anomalies');
      } else if (tab === 'forecasting') {
        setAnalyticsSubTab('forecasting');
      } else if (tab === 'price_intel' || tab === 'price') {
        setAnalyticsSubTab('price');
      } else if (tab === 'delivery_intel' || tab === 'delivery') {
        setAnalyticsSubTab('delivery');
      } else if (tab === 'quality_intel' || tab === 'quality') {
        setAnalyticsSubTab('quality');
      } else if (tab === 'contract_intel' || tab === 'contracts') {
        setAnalyticsSubTab('contracts');
      } else if (tab === 'risk_intel' || tab === 'risk') {
        setAnalyticsSubTab('risk');
      } else if (tab === 'material360') {
        setAnalyticsSubTab('material360');
      }
      if (targetId && targetId.startsWith('MAT-')) {
        setTargetedMaterialId(targetId);
      }
      setActiveTab('analytics');
    } else if (
      tab === 'decisions' ||
      tab === 'scenarios' ||
      tab === 'history' ||
      tab === 'stresstest' ||
      tab === 'memory' ||
      tab === 'twin' ||
      tab === 'concentration'
    ) {
      if (subtab) {
        setDecisionsSubTab(subtab as DecisionsSubTab);
      } else if (tab === 'stresstest') {
        setDecisionsSubTab('stresstest');
      } else if (tab === 'twin') {
        setDecisionsSubTab('twin');
      } else if (tab === 'concentration') {
        setDecisionsSubTab('concentration');
      } else if (tab === 'memory') {
        setDecisionsSubTab('memory');
      } else if (tab === 'history') {
        setDecisionsSubTab('history');
      } else {
        setDecisionsSubTab('twin');
      }
      setActiveTab('decisions');
    } else if (tab === 'explorer') {
      setActiveTab('explorer');
    } else if (tab === 'system') {
      setActiveTab('system');
    }
  };

  const handleNavigateToSupplier360 = (supplierId: string) => {
    setTargetedSupplierId(supplierId);
    setSupplierSubTab('360');
    setActiveTab('suppliers');
  };

  const handleOpenSupplierDrawer = (supplierId: string) => {
    setDrawerSupplierId(supplierId);
    setIsSupplierDrawerOpen(true);
  };

  const handleSelectRequirementForWorkspace = (reqId: string) => {
    setTargetedReqId(reqId);
    setActiveTab('sourcing');
  };

  const handleOpenAssistantWithQuery = (query: string, context?: AssistantContext) => {
    setAssistantInitialQuery(query);
    if (context) setAssistantContext(context);
    setIsAssistantOpen(true);
  };

  const handleReloadData = async () => {
    try {
      setIsReloading(true);
      await api.reloadSystemData();
      alert('Mock data layer reloaded and referential integrity re-validated successfully.');
    } catch (err: any) {
      alert(`Reload error: ${err.message}`);
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <NavigationProvider
      activeTab={activeTab}
      activeSubTab={
        activeTab === 'analytics' ? analyticsSubTab :
        activeTab === 'decisions' ? decisionsSubTab :
        activeTab === 'suppliers' ? supplierSubTab : undefined
      }
      targetedSupplierId={targetedSupplierId}
      targetedReqId={targetedReqId}
      targetedMaterialId={targetedMaterialId}
      onNavigateTab={handleNavigateTab}
    >
      <div className="min-h-screen bg-[#f5f6f8] flex flex-col text-[#1d2d3e]">
        {/* Shell Header */}
        <Header
        onToggleAssistant={() => setIsAssistantOpen(!isAssistantOpen)}
        isAssistantOpen={isAssistantOpen}
        onReloadData={handleReloadData}
        isReloading={isReloading}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isSidebarCollapsed={isSidebarCollapsed}
        onNavigateTab={handleNavigateTab}
      />

      {/* Shell Body: Left Sidebar + Main Content Canvas */}
      <div className="flex-1 flex overflow-hidden min-h-[calc(100vh-60px)]">
        <Sidebar
          activeTab={activeTab}
          activeSubTab={
            activeTab === 'analytics' ? analyticsSubTab :
            activeTab === 'decisions' ? decisionsSubTab :
            activeTab === 'suppliers' ? supplierSubTab : undefined
          }
          onTabChange={(tab, subtab) => handleNavigateTab(tab, subtab)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <div className="flex-1 flex flex-col overflow-y-auto bg-[#f4f7fb] relative">
          {/* Subtle atmospheric glow in top-right exactly matching reference screenshot */}
          <div className="absolute top-0 right-0 w-[580px] h-[320px] bg-gradient-to-b from-[#dbeafe]/70 via-[#e0f2fe]/40 to-transparent pointer-events-none rounded-bl-full blur-3xl opacity-80" />

          {/* Main Workspace Body */}
          <main className="flex-1 w-full mx-auto px-5 sm:px-6 py-5 relative z-10">
            {activeTab === 'overview' && (
              <OverviewView
                onSelectRequirement={handleSelectRequirementForWorkspace}
                onNavigateTab={handleNavigateTab}
                onOpenAssistantWithQuery={(query) => handleOpenAssistantWithQuery(query)}
                onOpenSupplierDrawer={handleOpenSupplierDrawer}
              />
            )}

            {activeTab === 'sourcing' && (
              <SourcingWorkspaceView
                initialRequirementId={targetedReqId}
                onNavigateToSupplier360={handleNavigateToSupplier360}
                onNavigateToHistory={() => handleNavigateTab('decisions', 'history')}
                onOpenAssistantWithQuery={handleOpenAssistantWithQuery}
                onOpenSupplierDrawer={handleOpenSupplierDrawer}
              />
            )}

            {(activeTab === 'suppliers' || activeTab === 'supplier_intel') && (
              <SupplierIntelligenceView
                initialSupplierId={targetedSupplierId}
                initialSubTab={supplierSubTab}
              />
            )}

            {(activeTab === 'analytics' ||
              activeTab === 'price_intel' ||
              activeTab === 'delivery_intel' ||
              activeTab === 'quality_intel' ||
              activeTab === 'contract_intel' ||
              activeTab === 'risk_intel') && (
              <AnalyticsHubView
                initialSubTab={analyticsSubTab}
                initialMaterialId={targetedMaterialId}
                onNavigateToSupplier360={handleNavigateToSupplier360}
                onNavigateToSourcing={handleSelectRequirementForWorkspace}
                onNavigateTab={handleNavigateTab}
                onOpenAssistantWithQuery={handleOpenAssistantWithQuery}
              />
            )}

            {(activeTab === 'decisions' ||
              activeTab === 'scenarios' ||
              activeTab === 'history') && (
              <DecisionsHubView
                initialSubTab={decisionsSubTab}
                onOpenRequirementInWorkspace={handleSelectRequirementForWorkspace}
                onNavigateToSupplier360={handleNavigateToSupplier360}
                onOpenAssistantWithQuery={handleOpenAssistantWithQuery}
              />
            )}

            {activeTab === 'explorer' && <DataExplorerView />}
            {activeTab === 'system' && <SystemHealthView />}
          </main>

          {/* Enterprise Shell Footer */}
          <footer className="border-t border-[#d9dcdf] bg-white text-[#556b82] text-[11px] px-6 py-3 flex flex-col sm:flex-row items-center justify-between shadow-[0_-1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-[#1d2d3e]">Supplier Decision Intelligence</span>
              <span>•</span>
              <span className="font-mono">SAP S/4HANA Strategic Sourcing Decision Support</span>
              <span>•</span>
              <span className="sap-badge sap-badge-info text-[10px]">Morning Horizon Light</span>
            </div>
            <div className="mt-1 sm:mt-0 font-mono text-[10px] text-[#556b82]">
              <span>Runtime: Local MockDataProvider (Fixed Seed 42)</span>
              <span className="mx-2">|</span>
              <span>Deterministic MCDA Decision Engine</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Contextual Supplier 360 Side Drawer */}
      <SupplierDrawer
        supplierId={drawerSupplierId}
        isOpen={isSupplierDrawerOpen}
        onClose={() => setIsSupplierDrawerOpen(false)}
        onNavigateToFull360={handleNavigateToSupplier360}
        onSelectInWorkspace={handleSelectRequirementForWorkspace}
      />

      {/* Embedded Controlled AI Assistant Side Drawer */}
      <AssistantWidget
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        activeContext={assistantContext}
        initialQuery={assistantInitialQuery}
        onNavigateTab={handleNavigateTab}
      />
    </div>
    </NavigationProvider>
  );
};

export default App;
