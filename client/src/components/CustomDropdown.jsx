import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

/**
 * CustomDropdown
 * A modern, beautifully animated select dropdown to replace raw native HTML select.
 * Features:
 * - Rounded modern popover with smooth shadow & blur
 * - Integrated icon, active checkmark, and count badges
 * - Click outside detection
 * - Optional inline search filter for long lists
 */
const CustomDropdown = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  icon: Icon = null,
  className = '',
  buttonWidth = 'w-48 sm:w-52',
  menuWidth = 'w-72',
  searchable = false,
  variant = 'default', // 'default' | 'dark'
  align = 'left', // 'left' | 'right'
  title = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const dropdownRef = useRef(null);

  // Normalize options to { value, label, count, icon, badge }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  // Find currently selected option
  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));

  // Filter options if searchable is enabled
  const filteredOptions = searchable && filterQuery
    ? normalizedOptions.filter((opt) =>
        (opt.label || '').toLowerCase().includes(filterQuery.toLowerCase())
      )
    : normalizedOptions;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle Esc key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const isDark = variant === 'dark';

  return (
    <div
      className={`relative text-left shrink-0 ${buttonWidth || ''} ${className}`}
      ref={dropdownRef}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={title || selectedOption?.label || placeholder}
        className={`w-full h-10 px-3 rounded-xl border flex items-center justify-between gap-1.5 transition-all text-xs font-bold cursor-pointer select-none shadow-2xs active:scale-[0.98] min-w-0 overflow-hidden ${
          isDark
            ? 'bg-slate-900/90 hover:bg-slate-800 text-white border-slate-700 hover:border-slate-600'
            : isOpen
            ? 'bg-white border-indigo-500 ring-2 ring-indigo-100 text-indigo-900'
            : 'bg-white hover:bg-slate-50/80 text-slate-800 border-slate-200 hover:border-indigo-300'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          {Icon && (
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isDark
                  ? 'text-indigo-400'
                  : isOpen
                  ? 'text-indigo-600'
                  : 'text-indigo-500'
              }`}
            />
          )}
          <span className="truncate text-left block flex-1 min-w-0">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {selectedOption?.count !== undefined && selectedOption?.count !== null && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                isDark ? 'bg-indigo-950 text-indigo-300' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {selectedOption.count}
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-180 text-indigo-600' : 'text-slate-400'
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-2 z-50 rounded-2xl shadow-2xl border backdrop-blur-md overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150 ${menuWidth} ${
            isDark
              ? 'bg-slate-900/95 border-slate-700 text-white ring-1 ring-black/40'
              : 'bg-white/95 border-slate-200/90 text-slate-800 ring-1 ring-black/5'
          }`}
          style={{ minWidth: 'max(100%, 280px)' }}
        >
          {/* Optional Search inside dropdown */}
          {searchable && normalizedOptions.length > 5 && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search options..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-200">
            {filteredOptions.length === 0 ? (
              <div className="py-3 px-3 text-center text-xs text-slate-400">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                const ItemIcon = opt.icon;

                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setFilterQuery('');
                    }}
                    title={opt.label}
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium flex items-center justify-between gap-2 transition-colors cursor-pointer group ${
                      isSelected
                        ? isDark
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-100'
                        : isDark
                        ? 'text-slate-200 hover:bg-slate-800 hover:text-white'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                      {ItemIcon && (
                        <ItemIcon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected
                              ? isDark
                                ? 'text-white'
                                : 'text-indigo-600'
                              : 'text-slate-400 group-hover:text-indigo-600'
                          }`}
                        />
                      )}
                      <span className="truncate block min-w-0 flex-1">{opt.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {opt.count !== undefined && opt.count !== null && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            isSelected
                              ? isDark
                                ? 'bg-indigo-700 text-white'
                                : 'bg-indigo-200 text-indigo-900'
                              : isDark
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {opt.count}
                        </span>
                      )}
                      {isSelected && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            isDark ? 'text-white' : 'text-indigo-600'
                          }`}
                        />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
