import React from 'react';
import { ArrowLeftIcon } from './Icons';
import { TabId } from './NavigationTabs';
import { useNavigation } from '../../context/NavigationContext';

export interface BackNavigationProps {
  onBack?: () => void;
  fallbackTab?: TabId;
  fallbackSubtab?: string;
  fallbackLabel?: string;
  fallbackTargetId?: string;
  customLabel?: string;
  className?: string;
}

export const BackNavigation: React.FC<BackNavigationProps> = ({
  onBack,
  fallbackTab,
  fallbackSubtab,
  fallbackLabel,
  fallbackTargetId,
  customLabel,
  className = ''
}) => {
  const { goBack, getBackTarget } = useNavigation();

  // Determine fallback target if provided
  const fallback = fallbackTab
    ? {
        tab: fallbackTab,
        subtab: fallbackSubtab,
        label: fallbackLabel || 'Previous Section',
        targetId: fallbackTargetId
      }
    : undefined;

  const target = getBackTarget(fallback);
  const targetLabel = customLabel || target?.label || fallbackLabel || 'Previous Page';
  const displayLabel = targetLabel.startsWith('Back to ') ? targetLabel : `Back to ${targetLabel}`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onBack) {
      onBack();
    } else {
      goBack(fallback);
    }
  };

  return (
    <div className={`mb-3 ${className}`}>
      <button
        onClick={handleClick}
        aria-label={`Go back to ${targetLabel}`}
        className="group inline-flex items-center space-x-2 text-xs sm:text-sm font-medium text-[#475569] hover:text-[#1976d2] px-2.5 py-1 -ml-2.5 rounded-lg hover:bg-[#e8f0fe]/70 transition-all duration-150 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1976d2]/20"
      >
        <ArrowLeftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#64748b] group-hover:text-[#1976d2] transition-transform duration-150 group-hover:-translate-x-1 shrink-0" />
        <span className="hidden sm:inline">{displayLabel}</span>
        <span className="sm:hidden">Back</span>
      </button>
    </div>
  );
};
