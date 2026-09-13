import React from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';

/**
 * Reusable Search & Filter Bar for SevaConnect V2.1
 * 
 * Props:
 * - searchValue: string
 * - onSearchChange: (value: string) => void
 * - searchPlaceholder: string
 * - filters: Array<{
 *     id: string,
 *     label: string,
 *     value: string,
 *     options: Array<{ value: string, label: string }>,
 *     onChange: (value: string) => void
 *   }>
 * - toggle: {
 *     id: string,
 *     label: string,
 *     checked: boolean,
 *     onChange: (checked: boolean) => void,
 *     badge?: string
 *   }
 * - onClearAll: () => void
 * - activeCount?: number
 * - extraActions?: React.ReactNode
 */
export default function SearchFilterBar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
  toggle = null,
  onClearAll,
  activeCount = 0,
  extraActions = null,
  className = ''
}) {
  const hasActiveFilters = Boolean(
    (searchValue && searchValue.trim().length > 0) ||
    filters.some(f => f.value && f.value !== 'All' && f.value !== '') ||
    (toggle && toggle.checked) ||
    activeCount > 0
  );

  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 mb-6 transition-all duration-200 hover:shadow-md ${className}`}>
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        
        {/* Left: Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-9 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-sm text-slate-800 placeholder-slate-400 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B4F6C]/20 focus:border-[#0B4F6C] transition-all"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange && onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Middle: Configurable Filters & Toggles */}
        <div className="flex flex-wrap items-center gap-2.5">
          {filters.map((filter) => (
            <div key={filter.id} className="relative min-w-[130px] flex-1 sm:flex-initial">
              <select
                id={`filter-${filter.id}`}
                value={filter.value || 'All'}
                onChange={(e) => filter.onChange(e.target.value)}
                className={`w-full py-2.5 pl-3 pr-8 text-xs sm:text-sm font-medium rounded-lg border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B4F6C]/20 transition-all ${
                  filter.value && filter.value !== 'All' && filter.value !== ''
                    ? 'bg-[#0B4F6C]/5 border-[#0B4F6C] text-[#0B4F6C] font-semibold'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                <Filter className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}

          {/* Optional Toggle (e.g., Low stock only) */}
          {toggle && (
            <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs sm:text-sm font-medium cursor-pointer transition-all select-none ${
              toggle.checked
                ? 'bg-amber-500/10 border-amber-500 text-amber-800 font-semibold shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}>
              <input
                type="checkbox"
                id={toggle.id}
                checked={toggle.checked}
                onChange={(e) => toggle.onChange(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500/30 cursor-pointer"
              />
              <span>{toggle.label}</span>
              {toggle.badge && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-900">
                  {toggle.badge}
                </span>
              )}
            </label>
          )}

          {/* Clear All Filters Button */}
          {hasActiveFilters && onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
              title="Reset all filters and search"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right: Extra action slot (e.g. Add Item, Export, etc.) */}
        {extraActions && (
          <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            {extraActions}
          </div>
        )}

      </div>
    </div>
  );
}
