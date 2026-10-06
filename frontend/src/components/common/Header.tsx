import React, { useState } from 'react';
import {
  RefreshIcon,
  ChatIcon,
  MenuIcon,
  UserIcon,
  BellIcon,
  HelpCircleIcon,
  SearchIcon,
  LayersIcon,
  ChevronDownIcon,
  SparklesIcon
} from './Icons';

interface HeaderProps {
  onToggleAssistant: () => void;
  isAssistantOpen: boolean;
  onReloadData: () => void;
  isReloading: boolean;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onSearch?: (query: string) => void;
  onNavigateTab?: (tab: string, subtab?: string, targetId?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleAssistant,
  isAssistantOpen,
  onReloadData,
  isReloading,
  onToggleSidebar,
  isSidebarCollapsed = false,
  onSearch,
  onNavigateTab
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Supplier Capacity Risk Drift',
      partner: 'Titanium GMBH (SUP-006)',
      message: 'Delivery reliability dropped from 96% to 88% across trailing 3 shipments. Factory bottleneck detected.',
      time: '10m ago',
      severity: 'critical',
      targetTab: 'suppliers',
      targetSubtab: '360',
      targetId: 'SUP-006',
      read: false
    },
    {
      id: 'notif-2',
      title: 'Outline Agreement Expiry',
      partner: 'Micro Precision (CTR-2024-001)',
      message: 'Agreement expires in 18 days. €450K spend volume exposed to spot pricing.',
      time: '1h ago',
      severity: 'warning',
      targetTab: 'analytics',
      targetSubtab: 'contracts',
      read: false
    },
    {
      id: 'notif-3',
      title: 'Price Index Surge Detected',
      partner: 'Semiconductor MCU (MAT-004)',
      message: 'Latest purchase order quotation is 15.7% above 12-month historical corridor.',
      time: '3h ago',
      severity: 'warning',
      targetTab: 'analytics',
      targetSubtab: 'price',
      read: false
    },
    {
      id: 'notif-4',
      title: 'Sourcing Recommendation Generated',
      partner: 'REQ-1042 · Plant P001',
      message: 'Atlas Components (S104) recommended with 93.4 score and 8.4% lower effective cost.',
      time: '5h ago',
      severity: 'info',
      targetTab: 'sourcing',
      targetSubtab: 'scoring',
      read: true
    }
  ]);

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - (notif.read ? 0 : 1)));
    setShowNotifications(false);

    if (onNavigateTab) {
      onNavigateTab(notif.targetTab, notif.targetSubtab, notif.targetId);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      if (onSearch) {
        onSearch(searchValue.trim());
      } else {
        onToggleAssistant();
      }
    }
  };

  return (
    <header className="bg-white border-b border-[#e2e8f0] px-4 h-[60px] flex items-center justify-between sticky top-0 z-40">
      {/* Left: Hamburger & Clean Product Identity */}
      <div className="flex items-center space-x-3.5">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? 'Expand Navigation Sidebar' : 'Collapse Navigation Sidebar'}
            className="p-1.5 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors"
          >
            <MenuIcon className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-md bg-[#1976d2] text-white flex items-center justify-center shadow-xs">
            <LayersIcon className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-[#0f172a]">
            Supplier Decision Intelligence
          </span>
        </div>
      </div>

      {/* Center: Global Command / Search Field */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94a3b8]">
            <SearchIcon className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search suppliers, materials, contracts, or ask a question..."
            className="w-full pl-9 pr-14 py-1.5 text-xs bg-[#f8fafc] hover:bg-white focus:bg-white text-[#0f172a] placeholder-[#94a3b8] border border-[#e2e8f0] focus:border-[#1976d2] rounded-lg transition-all focus:outline-none focus:ring-1 focus:ring-[#1976d2]/20"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[#94a3b8] bg-[#f1f5f9] border border-[#e2e8f0] rounded">
              Ctrl K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Notifications, Help, User Profile & Actions */}
      <div className="flex items-center space-x-2.5">
        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowHelp(false);
              setShowUserMenu(false);
            }}
            title={`Notifications (${unreadCount} unread)`}
            className="relative p-1.5 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors"
          >
            <BellIcon className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ef4444] ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#e2e8f0] rounded-xl shadow-xl z-50 overflow-hidden text-xs animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[#0f172a] text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-[#ffebee] text-[#d32f2f] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-[#1976d2] hover:underline font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="divide-y divide-[#f1f5f9] max-h-[380px] overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 hover:bg-[#f8fafc] transition-colors cursor-pointer flex items-start space-x-3 ${
                      !notif.read ? 'bg-[#f0f7ff]/40' : ''
                    }`}
                  >
                    <div className="mt-1 shrink-0">
                      {notif.severity === 'critical' ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] block"></span>
                      ) : notif.severity === 'warning' ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] block"></span>
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1976d2] block"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-[#0f172a] text-xs truncate">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-[#94a3b8] shrink-0 ml-2">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-[#1976d2] mt-0.5">
                        {notif.partner}
                      </p>
                      <p className="text-[11px] text-[#475569] mt-0.5 leading-snug">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2.5 bg-[#f8fafc] border-t border-[#e2e8f0] text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    if (onNavigateTab) onNavigateTab('analytics', 'attention');
                  }}
                  className="text-xs text-[#1976d2] hover:underline font-medium"
                >
                  Open Attention Center →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowHelp(!showHelp);
              setShowNotifications(false);
              setShowUserMenu(false);
            }}
            title="Help & Decision Intelligence Documentation"
            className="p-1.5 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors"
          >
            <HelpCircleIcon className="w-4 h-4" />
          </button>

          {showHelp && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-[#e2e8f0] rounded-xl shadow-xl z-50 p-4 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
              <h4 className="font-bold text-[#0f172a] text-sm mb-1.5">Procurement Help & Docs</h4>
              <p className="text-[11px] text-[#64748b] leading-relaxed mb-3">
                AI-native multi-objective supplier scoring, 14-shock stress tests, and automated failover intelligence.
              </p>
              <div className="space-y-1.5">
                <div className="p-2 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                  <p className="font-semibold text-[#0f172a] text-[11px]">Global Search Shortcut</p>
                  <p className="text-[10px] text-[#64748b]">Press <kbd className="px-1 py-0.5 bg-white border border-[#cbd5e1] rounded font-mono">Ctrl + K</kbd> to search anywhere.</p>
                </div>
                <div className="p-2 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                  <p className="font-semibold text-[#0f172a] text-[11px]">Audit Telemetry</p>
                  <p className="text-[10px] text-[#64748b]">Continuous ERP sync with SAP Plant P001 telemetry.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative pl-1">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2.5 p-1 rounded-lg hover:bg-[#f8fafc] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#818cf8] text-white flex items-center justify-center font-semibold text-xs shadow-xs">
              AS
            </div>
            <div className="text-left hidden sm:block leading-tight">
              <div className="text-xs font-semibold text-[#0f172a]">Amit Sharma</div>
              <div className="text-[11px] text-[#64748b]">Procurement Team</div>
            </div>
            <ChevronDownIcon className="w-3 h-3 text-[#94a3b8] hidden sm:block" />
          </button>

          {/* User Menu Dropdown with Reload Data & AI Insights */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-[#e2e8f0] rounded-xl shadow-lg py-1.5 z-50 text-xs">
              <div className="px-3.5 py-2 border-b border-[#f1f5f9]">
                <p className="font-semibold text-[#0f172a]">Amit Sharma</p>
                <p className="text-[11px] text-[#64748b]">amit.sharma@enterprise.internal</p>
                <p className="text-[10px] text-[#1976d2] font-medium mt-0.5">Plant P001 · Strategic Buyer</p>
              </div>
              <div className="py-1 border-b border-[#f1f5f9]">
                <button
                  onClick={() => {
                    onToggleAssistant();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-1.5 text-[#334155] hover:bg-[#f8fafc] hover:text-[#1976d2] flex items-center space-x-2"
                >
                  <SparklesIcon className="w-3.5 h-3.5 text-[#6366f1]" />
                  <span>Toggle AI Insights Panel</span>
                </button>
                <button
                  onClick={() => {
                    onReloadData();
                    setShowUserMenu(false);
                  }}
                  disabled={isReloading}
                  className="w-full text-left px-3.5 py-1.5 text-[#334155] hover:bg-[#f8fafc] hover:text-[#1976d2] flex items-center space-x-2"
                >
                  <RefreshIcon className={`w-3.5 h-3.5 text-[#64748b] ${isReloading ? 'animate-spin' : ''}`} />
                  <span>Reload Datasets</span>
                </button>
              </div>
              <div className="py-1">
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-3.5 py-1.5 text-[#334155] hover:bg-[#f8fafc] hover:text-[#1976d2]"
                >
                  My Decision Worklist
                </button>
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-3.5 py-1.5 text-[#334155] hover:bg-[#f8fafc] hover:text-[#1976d2]"
                >
                  Sourcing Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
