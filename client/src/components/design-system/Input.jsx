import React from 'react';

/**
 * Government Minimalism Input Component
 */
export const Input = React.forwardRef(({
  label,
  helperText,
  error,
  required = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-[#17202A] flex items-center gap-1"
        >
          <span>{label}</span>
          {required && <span className="text-[#B42318]" title="Required field">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-[#87919B] pointer-events-none flex items-center">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          className={`w-full bg-white text-[#17202A] placeholder-[#87919B] text-sm rounded-[6px] border ${
            error ? 'border-[#B42318] focus:border-[#B42318] focus:ring-[#FEE4E2]' : 'border-[#E5E7EB] focus:border-[#1F4E79] focus:ring-[#EAF2F8]'
          } px-3 py-2 transition-colors focus:outline-none focus:ring-2 disabled:bg-[#F1F3F6] disabled:text-[#87919B] disabled:cursor-not-allowed ${
            Icon ? 'pl-9' : ''
          } ${IconRight ? 'pr-9' : ''} ${className}`}
          {...props}
        />

        {IconRight && (
          <div className="absolute right-3 text-[#87919B] flex items-center">
            <IconRight className="w-4 h-4" />
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-[#B42318] font-medium mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#5F6B76] mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

/**
 * Select Component
 */
export const Select = React.forwardRef(({
  label,
  helperText,
  error,
  required = false,
  options = [],
  children,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold text-[#17202A] flex items-center gap-1"
        >
          <span>{label}</span>
          {required && <span className="text-[#B42318]">*</span>}
        </label>
      )}

      <select
        ref={ref}
        id={selectId}
        required={required}
        className={`w-full bg-white text-[#17202A] text-sm rounded-[6px] border ${
          error ? 'border-[#B42318]' : 'border-[#E5E7EB] focus:border-[#1F4E79] focus:ring-[#EAF2F8]'
        } px-3 py-2 transition-colors focus:outline-none focus:ring-2 disabled:bg-[#F1F3F6] disabled:text-[#87919B] disabled:cursor-not-allowed cursor-pointer ${className}`}
        {...props}
      >
        {children ||
          options.map((opt, idx) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const text = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={idx} value={val}>
                {text}
              </option>
            );
          })}
      </select>

      {error ? (
        <p className="text-xs text-[#B42318] font-medium mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#5F6B76] mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';

/**
 * Textarea Component
 */
export const Textarea = React.forwardRef(({
  label,
  helperText,
  error,
  required = false,
  rows = 3,
  className = '',
  id,
  ...props
}, ref) => {
  const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-semibold text-[#17202A] flex items-center gap-1"
        >
          <span>{label}</span>
          {required && <span className="text-[#B42318]">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        required={required}
        className={`w-full bg-white text-[#17202A] placeholder-[#87919B] text-sm rounded-[6px] border ${
          error ? 'border-[#B42318]' : 'border-[#E5E7EB] focus:border-[#1F4E79] focus:ring-[#EAF2F8]'
        } p-3 transition-colors focus:outline-none focus:ring-2 disabled:bg-[#F1F3F6] disabled:text-[#87919B] disabled:cursor-not-allowed ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-xs text-[#B42318] font-medium mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#5F6B76] mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
});

Textarea.displayName = 'Textarea';

/**
 * SearchInput Component
 */
export const SearchInput = React.forwardRef(({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <svg
        className="w-4 h-4 text-[#87919B] absolute left-3 pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white text-[#17202A] placeholder-[#87919B] text-xs sm:text-sm rounded-[6px] border border-[#E5E7EB] pl-9 pr-3 py-1.5 sm:py-2 focus:outline-none focus:border-[#1F4E79] focus:ring-2 focus:ring-[#EAF2F8] transition-colors"
        {...props}
      />
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

export default Input;
