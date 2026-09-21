import React from 'react';

/**
 * Government Minimalism Status Badge Component
 * Restrained, soft pastel backgrounds with accessible dark text
 */
export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  const variantStyles = {
    // Approved / Active / Verified
    approved: 'bg-[#E8F5E9] text-[#145A32] border border-[#C8E6C9]/60',
    success: 'bg-[#E8F5E9] text-[#145A32] border border-[#C8E6C9]/60',
    // Pending / Review / Warning
    pending: 'bg-[#FFF8E1] text-[#7D5000] border border-[#FFE082]/60',
    warning: 'bg-[#FFF8E1] text-[#7D5000] border border-[#FFE082]/60',
    // Rejected / Inactive / Danger
    rejected: 'bg-[#FEE4E2] text-[#912018] border border-[#FECDCA]/60',
    error: 'bg-[#FEE4E2] text-[#912018] border border-[#FECDCA]/60',
    // Info / In-Progress
    info: 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]/60',
    primary: 'bg-[#EAF2F8] text-[#1F4E79] border border-[#D0E1F0]/60',
    // Neutral
    neutral: 'bg-[#F1F3F6] text-[#5F6B76] border border-[#E5E7EB]',
  };

  const dotColors = {
    approved: 'bg-[#1F7A4D]',
    success: 'bg-[#1F7A4D]',
    pending: 'bg-[#A66A00]',
    warning: 'bg-[#A66A00]',
    rejected: 'bg-[#B42318]',
    error: 'bg-[#B42318]',
    info: 'bg-[#2563EB]',
    primary: 'bg-[#1F4E79]',
    neutral: 'bg-[#87919B]',
  };

  const normalizedVariant = variant.toLowerCase();
  const appliedVariant = variantStyles[normalizedVariant] || variantStyles.neutral;
  const appliedDot = dotColors[normalizedVariant] || dotColors.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[4px] leading-none ${sizeStyles[size] || sizeStyles.md} ${appliedVariant} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${appliedDot}`} />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
