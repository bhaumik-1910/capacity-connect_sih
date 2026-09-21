import React from 'react';

/**
 * Clean Minimalist Card Surface
 */
export const Card = ({
  children,
  className = '',
  padding = 'default',
  hoverable = false,
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    default: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={`bg-white rounded-[8px] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${
        hoverable ? 'hover:border-[#D1D5DB] transition-colors' : ''
      } ${paddingStyles[padding] || paddingStyles.default} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Minimal KPI Stat Card (Section 14)
 * - Restrained: Label, Big Number, Subtitle/Change Indicator, Optional tiny 16px icon
 * - NO giant icons, NO gradients, NO colorful backgrounds
 */
export const StatCard = ({
  title,
  value,
  change,
  changeType = 'neutral', // 'positive' | 'negative' | 'neutral'
  subtitle,
  icon: Icon,
  className = '',
}) => {
  const changeColors = {
    positive: 'text-[#1F7A4D] bg-[#E8F5E9]',
    negative: 'text-[#B42318] bg-[#FEE4E2]',
    neutral: 'text-[#5F6B76] bg-[#F1F3F6]',
  };

  return (
    <div className={`bg-white rounded-[8px] border border-[#E5E7EB] p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-[#5F6B76] tracking-wide uppercase">
          {title}
        </span>
        {Icon && (
          <div className="text-[#87919B]">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="text-2xl sm:text-3xl font-bold text-[#17202A] tracking-tight mb-2">
        {value}
      </div>

      {(change || subtitle) && (
        <div className="flex items-center gap-2 text-xs">
          {change && (
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[4px] font-medium text-[11px] ${changeColors[changeType] || changeColors.neutral}`}>
              {change}
            </span>
          )}
          {subtitle && (
            <span className="text-[#87919B] truncate">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Page Header (Section 12)
 * Page Title, Short description, Primary action
 */
export const PageHeader = ({
  title,
  description,
  actions,
  badge,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-[#E5E7EB] ${className}`}>
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold text-[#17202A] tracking-tight">
            {title}
          </h1>
          {badge && <div>{badge}</div>}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-[#5F6B76] mt-1 line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default Card;
