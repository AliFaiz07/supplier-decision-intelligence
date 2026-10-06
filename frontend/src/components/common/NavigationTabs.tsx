import React from 'react';
import {
  ActivityIcon,
  LayersIcon,
  BuildingIcon,
  TrendingUpIcon,
  SlidersIcon,
  DatabaseIcon,
  ShieldAlertIcon
} from './Icons';

export type TabId =
  | 'overview'
  | 'sourcing'
  | 'suppliers'
  | 'analytics'
  | 'decisions'
  | 'supplier_intel'
  | 'price_intel'
  | 'delivery_intel'
  | 'quality_intel'
  | 'contract_intel'
  | 'risk_intel'
  | 'scenarios'
  | 'history'
  | 'explorer'
  | 'system';

interface NavigationTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

interface NavItem {
  id: TabId;
  label: string;
  icon: React.FC<{ className?: string }>;
  aliases?: TabId[];
}

const PRIMARY_TABS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: ActivityIcon },
  { id: 'sourcing', label: 'Sourcing Workspace', icon: LayersIcon },
  {
    id: 'suppliers',
    label: 'Suppliers',
    icon: BuildingIcon,
    aliases: ['supplier_intel']
  },
  {
    id: 'analytics',
    label: 'Analytics Hub',
    icon: TrendingUpIcon,
    aliases: ['price_intel', 'delivery_intel', 'quality_intel', 'contract_intel', 'risk_intel']
  },
  {
    id: 'decisions',
    label: 'Decisions & Scenarios',
    icon: SlidersIcon,
    aliases: ['scenarios', 'history']
  }
];

const UTILITY_TABS: NavItem[] = [
  { id: 'explorer', label: 'Data Explorer', icon: DatabaseIcon },
  { id: 'system', label: 'System Health', icon: ShieldAlertIcon }
];

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange }) => {
  const isTabActive = (item: NavItem) => {
    if (activeTab === item.id) return true;
    if (item.aliases && item.aliases.includes(activeTab)) return true;
    return false;
  };

  return (
    <nav className="bg-white border-b border-[#d5dbe1] px-6 flex items-center justify-between overflow-x-auto shadow-none">
      {/* 5 Core Enterprise Pillars */}
      <div className="flex space-x-1">
        {PRIMARY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = isTabActive(tab);
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-[#0a6ed1] text-[#0a6ed1] font-semibold bg-[#f8fafc]'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0a6ed1]' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Auxiliary Data & System Tools */}
      <div className="flex items-center space-x-1 pl-4 border-l border-slate-200">
        {UTILITY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-1.5 py-3 px-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-[#0a6ed1] text-[#0a6ed1] font-semibold bg-[#f8fafc]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0a6ed1]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
