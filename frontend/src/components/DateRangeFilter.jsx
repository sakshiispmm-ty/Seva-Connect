import React, { useState } from 'react';
import { Calendar, Filter, X, RefreshCw } from 'lucide-react';

export default function DateRangeFilter({
  startDate = '',
  endDate = '',
  onChange,
  onReset,
  className = ''
}) {
  const [activePreset, setActivePreset] = useState('all');

  const applyPreset = (preset) => {
    setActivePreset(preset);
    const now = new Date();
    let start = '';
    const end = now.toISOString().split('T')[0];

    if (preset === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      start = d.toISOString().split('T')[0];
    } else if (preset === '30days') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      start = d.toISOString().split('T')[0];
    } else if (preset === '90days') {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      start = d.toISOString().split('T')[0];
    } else if (preset === 'thisYear') {
      start = `${now.getFullYear()}-01-01`;
    } else {
      // 'all'
      start = '';
      if (onChange) onChange({ startDate: '', endDate: '' });
      return;
    }

    if (onChange) {
      onChange({ startDate: start, endDate: end });
    }
  };

  const handleCustomDateChange = (type, val) => {
    setActivePreset('custom');
    if (onChange) {
      onChange({
        startDate: type === 'start' ? val : startDate,
        endDate: type === 'end' ? val : endDate
      });
    }
  };

  const handleClear = () => {
    setActivePreset('all');
    if (onReset) {
      onReset();
    } else if (onChange) {
      onChange({ startDate: '', endDate: '' });
    }
  };

  const isFiltered = Boolean(startDate || endDate || activePreset !== 'all');

  return (
    <div className={`bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#667085] uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5 text-[#087F73]" />
            <span>Timeframe:</span>
          </span>

          {[
            { id: 'all', label: 'All Time' },
            { id: '7days', label: 'Last 7 Days' },
            { id: '30days', label: 'Last 30 Days' },
            { id: '90days', label: 'Last 90 Days' },
            { id: 'thisYear', label: 'Year 2026' }
          ].map((preset) => {
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#087F73] text-white shadow-xs font-bold'
                    : 'bg-[#EAF6F3] text-[#087F73] hover:bg-[#087F73]/15'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom Range Inputs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 text-xs">
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-[#667085] pointer-events-none">
                <Calendar className="w-3.5 h-3.5" />
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleCustomDateChange('start', e.target.value)}
                className="pl-8 pr-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#087F73] text-[#17243A] bg-white"
                placeholder="Start Date"
                title="Start Date"
              />
            </div>

            <span className="text-[#667085] font-semibold text-xs">to</span>

            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-[#667085] pointer-events-none">
                <Calendar className="w-3.5 h-3.5" />
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleCustomDateChange('end', e.target.value)}
                className="pl-8 pr-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#087F73] text-[#17243A] bg-white"
                placeholder="End Date"
                title="End Date"
              />
            </div>
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#667085] hover:text-[#17243A] hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset Filter"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
