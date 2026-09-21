import React from 'react';
import { ChevronRight, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import Button from './Button';

/**
 * Tabs Component
 */
export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`border-b border-[#E5E7EB] flex items-center gap-1 overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer select-none -mb-px ${
              isActive
                ? 'border-[#1F4E79] text-[#1F4E79] font-semibold'
                : 'border-transparent text-[#5F6B76] hover:text-[#17202A] hover:border-[#CBD5E1]'
            }`}
          >
            {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
            <span>{tab.label}</span>
            {tab.count != null && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[11px] ${
                  isActive ? 'bg-[#EAF2F8] text-[#1F4E79]' : 'bg-[#F1F3F6] text-[#5F6B76]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

/**
 * Breadcrumb Component
 */
export const Breadcrumb = ({ items = [], className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-xs text-[#5F6B76] ${className}`}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#87919B] flex-shrink-0" />}
            {isLast || !item.href ? (
              <span className={`font-medium ${isLast ? 'text-[#17202A]' : 'text-[#5F6B76]'}`}>
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                className="hover:text-[#1F4E79] transition-colors"
              >
                {item.label}
              </a>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

/**
 * EmptyState Component (Section 43)
 * No giant illustrations. Clear text + action.
 */
export const EmptyState = ({
  title = 'No items found',
  description,
  actionText,
  onAction,
  icon: Icon,
  className = '',
}) => {
  return (
    <div className={`p-8 sm:p-12 text-center flex flex-col items-center justify-center bg-white rounded-[8px] border border-[#E5E7EB] ${className}`}>
      {Icon && (
        <div className="w-10 h-10 rounded-[8px] bg-[#F1F3F6] text-[#5F6B76] flex items-center justify-center mb-3">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h3 className="text-sm sm:text-base font-semibold text-[#17202A]">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-[#5F6B76] mt-1 max-w-sm">{description}</p>
      )}
      {actionText && onAction && (
        <div className="mt-4">
          <Button size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};

/**
 * ErrorState Component (Section 45)
 */
export const ErrorState = ({
  title = 'Something went wrong',
  message = 'Unable to load data. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-6 sm:p-8 text-center flex flex-col items-center justify-center bg-white rounded-[8px] border border-[#FEE4E2] ${className}`}>
      <div className="w-9 h-9 rounded-full bg-[#FEE4E2] text-[#B42318] flex items-center justify-center mb-2.5">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-bold text-[#17202A]">{title}</h3>
      <p className="text-xs text-[#5F6B76] mt-1 max-w-sm">{message}</p>
      {onRetry && (
        <div className="mt-3.5">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};

/**
 * Alert Box
 */
export const Alert = ({
  type = 'info',
  title,
  children,
  className = '',
}) => {
  const styles = {
    info: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]',
    success: 'bg-[#E8F5E9] border-[#C8E6C9] text-[#145A32]',
    warning: 'bg-[#FFF8E1] border-[#FFE082] text-[#7D5000]',
    error: 'bg-[#FEE4E2] border-[#FECDCA] text-[#912018]',
  };

  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
  };

  const Icon = icons[type] || icons.info;

  return (
    <div className={`p-3.5 rounded-[6px] border text-xs sm:text-sm flex items-start gap-2.5 ${styles[type] || styles.info} ${className}`}>
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div className="min-w-0">
        {title && <div className="font-semibold">{title}</div>}
        <div className="mt-0.5 text-xs opacity-90">{children}</div>
      </div>
    </div>
  );
};

/**
 * Skeleton Loader (Section 44)
 */
export const Skeleton = ({
  width = 'w-full',
  height = 'h-4',
  className = '',
}) => {
  return (
    <div className={`bg-[#E5E7EB] rounded-[4px] animate-pulse ${width} ${height} ${className}`} />
  );
};

/**
 * FilterBar Component (Section 16)
 */
export const FilterBar = ({
  children,
  className = '',
}) => {
  return (
    <div className={`bg-white p-3 sm:p-3.5 rounded-[8px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-wrap items-center gap-2.5 mb-4 ${className}`}>
      {children}
    </div>
  );
};

export default Tabs;
