import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

function CustomTooltip({ active, payload, label, moneyFormat = false }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#17243A] text-white p-3 rounded-xl shadow-lg border border-teal-500/20 text-xs space-y-1">
        <p className="font-bold text-teal-200">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span className="text-gray-300 font-medium">{entry.name || 'Value'}:</span>
            <span className="font-bold text-white">
              {moneyFormat && entry.dataKey === 'moneyAmount'
                ? `₹${Number(entry.value).toLocaleString('en-IN')}`
                : Number(entry.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function TrendChart({
  data = [],
  dataKey = 'moneyAmount',
  xKey = 'period',
  type = 'area', // 'area', 'bar', 'line'
  title,
  subtitle,
  height = 280,
  moneyFormat = true,
  color = '#087F73',
  secondaryKey,
  secondaryColor = '#F7BA3E',
  className = ''
}) {
  const hasData = data && Array.isArray(data) && data.length > 0;

  return (
    <div className={`bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h4 className="text-sm font-bold text-[#17243A]">{title}</h4>}
          {subtitle && <p className="text-xs text-[#667085] mt-0.5">{subtitle}</p>}
        </div>
      )}

      <div className="w-full" style={{ height }}>
        {!hasData ? (
          <div className="h-full flex items-center justify-center text-xs text-[#667085]">
            No trend data available for this timeframe
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {type === 'bar' ? (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey={xKey}
                  tick={{ fontSize: 11, fill: '#667085' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#667085' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => (moneyFormat ? `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}` : val)}
                />
                <Tooltip content={<CustomTooltip moneyFormat={moneyFormat} />} />
                <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
                {secondaryKey && <Bar dataKey={secondaryKey} fill={secondaryColor} radius={[6, 6, 0, 0]} />}
              </BarChart>
            ) : type === 'line' ? (
              <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey={xKey}
                  tick={{ fontSize: 11, fill: '#667085' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#667085' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => (moneyFormat ? `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}` : val)}
                />
                <Tooltip content={<CustomTooltip moneyFormat={moneyFormat} />} />
                <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ r: 3, fill: color }} />
                {secondaryKey && (
                  <Line type="monotone" dataKey={secondaryKey} stroke={secondaryColor} strokeWidth={2} dot={{ r: 3, fill: secondaryColor }} />
                )}
              </LineChart>
            ) : (
              /* Area Chart (Default) */
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id={`colorGrad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey={xKey}
                  tick={{ fontSize: 11, fill: '#667085' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#667085' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => (moneyFormat ? `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}` : val)}
                />
                <Tooltip content={<CustomTooltip moneyFormat={moneyFormat} />} />
                <Area
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill={`url(#colorGrad-${dataKey})`}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
