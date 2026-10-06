import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { TabId } from '../components/common/NavigationTabs';

export interface NavigationEntry {
  tab: TabId;
  subtab?: string;
  targetId?: string;
  label: string;
}

interface NavigationContextType {
  current: NavigationEntry;
  historyStack: NavigationEntry[];
  navigate: (tab: TabId, subtab?: string, targetId?: string, sourceLabel?: string) => void;
  goBack: (fallback?: { tab: TabId; subtab?: string; label: string; targetId?: string }) => void;
  getBackTarget: (fallback?: { tab: TabId; subtab?: string; label: string; targetId?: string }) => NavigationEntry | null;
  canGoBack: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Helper to determine a user-friendly label for any tab/subtab combination
export const getTabLabel = (tab: TabId, subtab?: string): string => {
  if (tab === 'overview') return 'Procurement Overview';
  if (tab === 'sourcing') {
    if (subtab === 'requirements') return 'Requirements';
    if (subtab === 'scoring') return 'Sourcing Workspace';
    return 'Sourcing Workspace';
  }
  if (tab === 'suppliers' || tab === 'supplier_intel') {
    if (subtab === '360') return 'Supplier 360';
    if (subtab === 'benchmarking') return 'Supplier Benchmarking';
    return 'Supplier Intelligence';
  }
  if (tab === 'analytics') {
    if (subtab === 'attention') return 'Early Warning Center';
    if (subtab === 'material360') return 'Material Intelligence';
    if (subtab === 'price') return 'Price Intelligence';
    if (subtab === 'delivery') return 'Delivery Intelligence';
    if (subtab === 'quality') return 'Quality Intelligence';
    if (subtab === 'contracts') return 'Contract Intelligence';
    if (subtab === 'risk') return 'Risk Intelligence';
    if (subtab === 'spend') return 'Spend Analytics';
    if (subtab === 'leakage') return 'Procurement Leakage';
    if (subtab === 'anomalies') return 'Anomaly Center';
    return 'Intelligence Hub';
  }
  if (tab === 'decisions') {
    if (subtab === 'twin') return 'Decision Twin';
    if (subtab === 'simulator') return 'What-If Analysis';
    if (subtab === 'stresstest') return 'Stress Testing';
    if (subtab === 'history') return 'Decision History';
    if (subtab === 'memory') return 'Decision Outcomes';
    return 'Decisions Hub';
  }
  if (tab === 'explorer') return 'Data Sources';
  if (tab === 'system') return 'Configuration';
  return 'Previous Page';
};

// Sensible parent fallback when history stack is empty
export const getDefaultParent = (tab: TabId, subtab?: string): NavigationEntry => {
  if (tab === 'suppliers' && subtab === '360') {
    return { tab: 'suppliers', subtab: 'directory', label: 'Supplier Intelligence' };
  }
  if (tab === 'analytics' && subtab === 'material360') {
    return { tab: 'analytics', subtab: 'price', label: 'Material Intelligence' };
  }
  if (tab === 'decisions') {
    if (subtab === 'stresstest' || subtab === 'simulator' || subtab === 'twin') {
      return { tab: 'decisions', subtab: 'twin', label: 'Decisions Hub' };
    }
  }
  if (tab === 'sourcing' && subtab === 'scoring') {
    return { tab: 'sourcing', subtab: 'requirements', label: 'Requirements' };
  }
  return { tab: 'overview', label: 'Procurement Overview' };
};

interface NavigationProviderProps {
  children: React.ReactNode;
  activeTab: TabId;
  activeSubTab?: string;
  targetedSupplierId?: string;
  targetedReqId?: string;
  targetedMaterialId?: string;
  onNavigateTab: (tab: string, subtab?: string, targetId?: string) => void;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  activeTab,
  activeSubTab,
  targetedSupplierId,
  targetedReqId,
  targetedMaterialId,
  onNavigateTab
}) => {
  const [historyStack, setHistoryStack] = useState<NavigationEntry[]>([]);
  const isBackActionRef = useRef<boolean>(false);

  const currentTargetId = activeTab === 'suppliers' ? targetedSupplierId : activeTab === 'sourcing' ? targetedReqId : targetedMaterialId;

  const currentEntry: NavigationEntry = {
    tab: activeTab,
    subtab: activeSubTab,
    targetId: currentTargetId,
    label: getTabLabel(activeTab, activeSubTab)
  };

  const prevLocationRef = useRef<NavigationEntry>(currentEntry);

  // Automatically track route changes into history stack
  useEffect(() => {
    const prev = prevLocationRef.current;
    const isSame = prev.tab === activeTab && prev.subtab === activeSubTab && prev.targetId === currentTargetId;

    if (!isSame) {
      if (isBackActionRef.current) {
        // Came from back navigation - consume the flag and do not push to history
        isBackActionRef.current = false;
      } else {
        // Forward navigation - record previous page into stack (max 15 entries)
        setHistoryStack((stack) => [...stack.slice(-15), prev]);
        if (typeof window !== 'undefined' && window.history) {
          window.history.pushState(
            { tab: activeTab, subtab: activeSubTab, targetId: currentTargetId },
            '',
            window.location.pathname
          );
        }
      }

      prevLocationRef.current = {
        tab: activeTab,
        subtab: activeSubTab,
        targetId: currentTargetId,
        label: getTabLabel(activeTab, activeSubTab)
      };
    }
  }, [activeTab, activeSubTab, currentTargetId]);

  // Sync with browser history pushState
  const navigate = useCallback((tab: TabId, subtab?: string, targetId?: string) => {
    onNavigateTab(tab, subtab, targetId);
  }, [onNavigateTab]);

  // Handle native browser back / forward buttons (popstate)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      isBackActionRef.current = true;
      if (e.state && e.state.tab) {
        onNavigateTab(e.state.tab, e.state.subtab, e.state.targetId);
        setHistoryStack((prev) => prev.slice(0, -1));
      } else if (historyStack.length > 0) {
        const prev = historyStack[historyStack.length - 1];
        setHistoryStack((s) => s.slice(0, -1));
        onNavigateTab(prev.tab, prev.subtab, prev.targetId);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [historyStack, onNavigateTab]);

  // Compute what the Back button will target
  const getBackTarget = useCallback((fallback?: { tab: TabId; subtab?: string; label: string; targetId?: string }): NavigationEntry => {
    if (historyStack.length > 0) {
      return historyStack[historyStack.length - 1];
    }
    if (fallback) {
      return {
        tab: fallback.tab,
        subtab: fallback.subtab,
        targetId: fallback.targetId,
        label: fallback.label
      };
    }
    return getDefaultParent(activeTab, activeSubTab);
  }, [historyStack, activeTab, activeSubTab]);

  // Execute Back navigation
  const goBack = useCallback((fallback?: { tab: TabId; subtab?: string; label: string; targetId?: string }) => {
    isBackActionRef.current = true;
    if (historyStack.length > 0) {
      const prev = historyStack[historyStack.length - 1];
      setHistoryStack((s) => s.slice(0, -1));
      onNavigateTab(prev.tab, prev.subtab, prev.targetId);
    } else {
      const target = fallback || getDefaultParent(activeTab, activeSubTab);
      onNavigateTab(target.tab, target.subtab, target.targetId);
    }
  }, [historyStack, activeTab, activeSubTab, onNavigateTab]);

  const canGoBack = historyStack.length > 0 || (activeSubTab !== undefined && activeSubTab !== 'directory' && activeSubTab !== 'requirements' && activeTab !== 'overview');

  return (
    <NavigationContext.Provider
      value={{
        current: currentEntry,
        historyStack,
        navigate,
        goBack,
        getBackTarget,
        canGoBack
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return ctx;
};
