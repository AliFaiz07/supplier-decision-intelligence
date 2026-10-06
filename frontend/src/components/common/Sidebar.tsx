import React from 'react';
import {
  ActivityIcon,
  LayersIcon,
  BuildingIcon,
  TrendingUpIcon,
  SlidersIcon,
  DatabaseIcon,
  ShieldAlertIcon,
  AlertTriangleIcon,
  AlertOctagonIcon,
  CpuIcon,
  DollarSignIcon,
  TruckIcon,
  AwardIcon,
  FileTextIcon,
  HistoryIcon,
  HomeIcon,
  CompassIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from './Icons';
import { TabId } from './NavigationTabs';

interface SidebarProps {
  activeTab: TabId;
  activeSubTab?: string;
  onTabChange: (tab: TabId, subtab?: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: TabId;
  label: string;
  icon: React.FC<{ className?: string }>;
  aliases?: TabId[];
  defaultSubtab?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'HOME',
    items: [
      {
        id: 'overview',
        label: 'Home',
        icon: HomeIcon,
      },
    ],
  },
  {
    title: 'PROCUREMENT',
    items: [
      {
        id: 'sourcing',
        defaultSubtab: 'requirements',
        label: 'Requirements',
        icon: FileTextIcon,
      },
      {
        id: 'sourcing',
        defaultSubtab: 'scoring',
        label: 'Sourcing',
        icon: CompassIcon,
      },
      {
        id: 'decisions',
        defaultSubtab: 'overview',
        label: 'Decisions',
        icon: SlidersIcon,
      },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      {
        id: 'suppliers',
        defaultSubtab: 'directory',
        label: 'Supplier Intelligence',
        icon: BuildingIcon,
        aliases: ['supplier_intel'],
      },
      {
        id: 'analytics',
        defaultSubtab: 'material360',
        label: 'Material Intelligence',
        icon: LayersIcon,
      },
      {
        id: 'analytics',
        defaultSubtab: 'price',
        label: 'Price Intelligence',
        icon: DollarSignIcon,
        aliases: ['price_intel'],
      },
      {
        id: 'analytics',
        defaultSubtab: 'delivery',
        label: 'Delivery Intelligence',
        icon: TruckIcon,
        aliases: ['delivery_intel'],
      },
      {
        id: 'analytics',
        defaultSubtab: 'quality',
        label: 'Quality Intelligence',
        icon: AwardIcon,
        aliases: ['quality_intel'],
      },
      {
        id: 'analytics',
        defaultSubtab: 'contracts',
        label: 'Contract Intelligence',
        icon: FileTextIcon,
        aliases: ['contract_intel'],
      },
      {
        id: 'analytics',
        defaultSubtab: 'risk',
        label: 'Risk Intelligence',
        icon: ShieldAlertIcon,
        aliases: ['risk_intel'],
      },
    ],
  },
  {
    title: 'ANALYSIS',
    items: [
      {
        id: 'decisions',
        defaultSubtab: 'twin',
        label: 'Decision Twin',
        icon: LayersIcon,
      },
      {
        id: 'decisions',
        defaultSubtab: 'simulator',
        label: 'What-If Analysis',
        icon: SlidersIcon,
        aliases: ['scenarios'],
      },
      {
        id: 'decisions',
        defaultSubtab: 'stresstest',
        label: 'Stress Test',
        icon: AlertOctagonIcon,
      },
      {
        id: 'analytics',
        defaultSubtab: 'attention',
        label: 'Investigations',
        icon: AlertTriangleIcon,
      },
    ],
  },
  {
    title: 'HISTORY',
    items: [
      {
        id: 'decisions',
        defaultSubtab: 'history',
        label: 'Decisions',
        icon: HistoryIcon,
        aliases: ['history'],
      },
      {
        id: 'decisions',
        defaultSubtab: 'memory',
        label: 'Outcomes',
        icon: CpuIcon,
      },
    ],
  },
  {
    title: 'ADMINISTRATION',
    items: [
      {
        id: 'explorer',
        label: 'Data Sources',
        icon: DatabaseIcon,
      },
      {
        id: 'system',
        label: 'Configuration',
        icon: ShieldAlertIcon,
      },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  activeSubTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
}) => {
  const isItemActive = (item: NavItem) => {
    if (activeTab !== item.id) {
      if (item.aliases && item.aliases.includes(activeTab)) return true;
      return false;
    }

    if (item.defaultSubtab) {
      if (activeSubTab) {
        if (item.defaultSubtab === 'simulator' && (activeSubTab === 'scenarios' || activeSubTab === 'simulator')) return true;
        if (item.defaultSubtab === 'attention' && (activeSubTab === 'early_warning' || activeSubTab === 'attention')) return true;
        return activeSubTab === item.defaultSubtab;
      }
      if (item.id === 'suppliers' && item.defaultSubtab === '360') return true;
      if (item.id === 'analytics' && item.defaultSubtab === 'material360') return false;
      if (item.id === 'analytics' && item.defaultSubtab === 'attention') return true;
      if (item.id === 'decisions' && item.defaultSubtab === 'twin') return true;
      return false;
    }

    return true;
  };

  return (
    <aside
      className={`bg-white border-r border-[#e2e8f0] flex flex-col transition-all duration-200 ease-in-out shrink-0 select-none z-30 ${
        isCollapsed ? 'w-16' : 'w-[235px]'
      }`}
    >
      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto py-2.5 space-y-1">
        {NAV_SECTIONS.map((section, sIdx) => (
          <div key={section.title} className={sIdx > 0 ? 'pt-1' : ''}>
            {/* Section Header */}
            {!isCollapsed && (
              <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-[#94a3b8] tracking-wider">
                {section.title}
              </div>
            )}

            {/* Section Items */}
            <div className="space-y-0.5 px-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item);

                return (
                  <button
                    key={`${item.id}-${item.defaultSubtab || ''}-${item.label}`}
                    onClick={() => onTabChange(item.id, item.defaultSubtab)}
                    title={isCollapsed ? `${item.label} (${section.title})` : undefined}
                    className={`w-full flex items-center rounded-lg transition-all text-left group relative ${
                      isCollapsed ? 'justify-center p-2.5' : 'px-3 py-1.5 space-x-2.5'
                    } ${
                      active
                        ? 'bg-[#e8f0fe] text-[#1976d2] font-semibold'
                        : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                    }`}
                  >
                    <Icon
                      className={`shrink-0 transition-colors ${
                        active ? 'text-[#1976d2]' : 'text-[#64748b] group-hover:text-[#0f172a]'
                      } ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`}
                    />

                    {!isCollapsed && (
                      <div className="flex-1 min-w-0 pr-1">
                        <span className="text-[13px] truncate block leading-snug">
                          {item.label}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer / Collapse Toggle */}
      <div className="p-2.5 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between">
        {!isCollapsed && (
          <div className="px-2 text-[11px] text-[#64748b] font-medium flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
            <span>Enterprise Workspace</span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className={`p-1.5 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0]/60 transition-colors ${
            isCollapsed ? 'w-full flex justify-center' : ''
          }`}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-4 h-4" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
};
