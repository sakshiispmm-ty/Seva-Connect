import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

const DEFAULT_COLORS = [
  '#087F73', // Teal
  '#F7BA3E', // Golden Yellow
  '#2EAD62', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#17243A'  // Navy
];

function CustomPieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[#17243A] text-white p-2.5 rounded-xl shadow-lg border border-teal-500/20 text-xs">
        <p className="font-bold text-teal-200">{data.name}</p>
        <p className="text-white font-black mt-0.5">
          {Number(data.value).toLocaleString()} units
        </p>
      </div>
    );
  }
  return null;
}

export default function BreakdownChart({
  data = [],
  dataKey = 'value',
  nameKey = 'name',
  title,
  subtitle,
  height = 260,
  innerRadius = 55,
  outerRadius = 80,
  colors = DEFAULT_COLORS,
  showLegend = true,
  className = ''
}) {
  const total = data.reduce((sum, item) => sum + (Number(item[dataKey]) || 0), 0);
  const hasData = data && Array.isArray(data) && data.length > 0 && total > 0;

  return (
    <div className={`bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between ${className}`}>
      {(title || subtitle) && (
        <div className="mb-2">
          {title && <h4 className="text-sm font-bold text-[#17243A]">{title}</h4>}
          {subtitle && <p className="text-xs text-[#667085] mt-0.5">{subtitle}</p>}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Chart View */}
        <div className="w-full sm:w-1/2 relative" style={{ height }}>
          {!hasData ? (
            <div className="h-full flex items-center justify-center text-xs text-[#667085]">
              No breakdown data available
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={data}
                    dataKey={dataKey}
                    nameKey={nameKey}
                    cx="50%"
                    cy="50%"
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    paddingAngle={3}
                  >
                    {data.map((entry, index) => {
                      const color = entry.color || colors[index % colors.length];
                      return <Cell key={`cell-${index}`} fill={color} stroke="#FFFFFF" strokeWidth={2} />;
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Stat */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-[#17243A]">
                  {total.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">
                  Total
                </span>
              </div>
            </>
          )}
        </div>

        {/* Legend List */}
        {showLegend && hasData && (
          <div className="w-full sm:w-1/2 flex flex-col gap-2">
            {data.map((item, index) => {
              const val = Number(item[dataKey]) || 0;
              const percent = total > 0 ? Math.round((val / total) * 100) : 0;
              const color = item.color || colors[index % colors.length];

              return (
                <div key={`legend-${index}`} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[#17243A] font-medium truncate">{item[nameKey]}</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold shrink-0 ml-2">
                    <span className="text-[#17243A]">{val.toLocaleString()}</span>
                    <span className="text-[#667085] text-[11px]">({percent}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
