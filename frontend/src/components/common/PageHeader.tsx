import React from 'react';
import { ChevronRightIcon, SparklesIcon } from './Icons';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs: BreadcrumbItem[];
  badges?: {
    label: string;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  }[];
  actions?: React.ReactNode;
  onAskAI?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  badges,
  actions,
  onAskAI,
}) => {
  const getBadgeClass = (variant?: string) => {
    switch (variant) {
      case 'success':
        return 'sap-badge-success';
      case 'warning':
        return 'sap-badge-warning';
      case 'error':
        return 'sap-badge-error';
      case 'info':
        return 'sap-badge-info';
      default:
        return 'sap-badge-neutral';
    }
  };

  return (
    <div className="bg-white border border-[#e2e8f0] px-6 py-4 mb-5 shadow-xs rounded-xl">
      {/* Breadcrumb Hierarchy */}
      <nav className="flex items-center space-x-1.5 text-xs text-[#64748b] mb-1.5 select-none overflow-x-auto">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRightIcon className="w-3 h-3 text-[#94a3b8] shrink-0" />}
              {crumb.onClick && !isLast ? (
                <button
                  onClick={crumb.onClick}
                  className="hover:text-[#0066cc] hover:underline font-medium transition-colors"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className={isLast ? 'text-[#0f172a] font-semibold' : ''}>
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Main Title Row & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0f172a]">
              {title}
            </h1>
            {badges && badges.length > 0 && (
              <div className="flex items-center space-x-1.5">
                {badges.map((b, i) => (
                  <span key={i} className={`sap-badge ${getBadgeClass(b.variant)}`}>
                    {b.label}
                  </span>
                ))}
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-4xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {actions}
          {onAskAI && (
            <button
              onClick={onAskAI}
              className="sap-btn sap-btn-secondary text-xs space-x-1.5 text-[#0066cc] hover:border-[#0066cc]"
            >
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>Ask AI Insight</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
