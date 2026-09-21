import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Government Minimalism Button Component
 * - Variants: primary, secondary, tertiary, danger
 * - Restrained radius (6px), 14px text, clear hierarchy
 */
export const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  type = 'button',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-[6px] transition-colors focus-visible:ring-2 focus-visible:ring-[#1F4E79] focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 min-h-[32px]',
    md: 'text-sm px-4 py-2 gap-2 min-h-[38px]',
    lg: 'text-sm px-5 py-2.5 gap-2.5 min-h-[44px]',
  };

  const variantStyles = {
    // Primary: Solid brand color (#1F4E79), no heavy gradients
    primary: 'bg-[#1F4E79] text-white hover:bg-[#163A5C] active:bg-[#122E49] border border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
    // Secondary: Clean white with subtle neutral border
    secondary: 'bg-white text-[#17202A] border border-[#E5E7EB] hover:bg-[#F8FAFC] hover:border-[#D1D5DB] active:bg-[#F1F3F6] shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
    // Tertiary: Ghost/text button
    tertiary: 'bg-transparent text-[#1F4E79] hover:bg-[#EAF2F8] active:bg-[#D8E8F5] border border-transparent',
    // Danger: Restrained red
    danger: 'bg-[#B42318] text-white hover:bg-[#912018] active:bg-[#721913] border border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
    // Danger Outline
    dangerOutline: 'bg-white text-[#B42318] border border-[#FEE4E2] hover:bg-[#FEE4E2]/30 active:bg-[#FEE4E2]/60',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />}
      {!loading && Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span>{children}</span>
      {!loading && IconRight && <IconRight className="w-4 h-4 flex-shrink-0" />}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
