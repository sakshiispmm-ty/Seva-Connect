import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function SummaryCard({
  label,
  value,
  subtext,
  icon: Icon,
  trend, // 'up', 'down', 'neutral'
  trendLabel,
  colorScheme = 'teal', // 'teal', 'emerald', 'amber', 'purple', 'blue', 'navy'
  badge,
  onClick
}) {
  const colorStyles = {
    teal: {
      bgIcon: 'bg-[#EAF6F3] text-[#087F73]',
      borderHover: 'hover:border-[#087F73]',
      accentBadge: 'bg-[#EAF6F3] text-[#087F73]'
    },
    emerald: {
      bgIcon: 'bg-emerald-50 text-[#2EAD62]',
      borderHover: 'hover:border-[#2EAD62]',
      accentBadge: 'bg-emerald-50 text-[#2EAD62]'
    },
    amber: {
      bgIcon: 'bg-[#FFF4D6] text-[#B88714]',
      borderHover: 'hover:border-[#F7BA3E]',
      accentBadge: 'bg-[#FFF4D6] text-[#B88714]'
    },
    purple: {
      bgIcon: 'bg-purple-50 text-purple-600',
      borderHover: 'hover:border-purple-500',
      accentBadge: 'bg-purple-50 text-purple-700'
    },
    blue: {
      bgIcon: 'bg-blue-50 text-blue-600',
      borderHover: 'hover:border-blue-500',
      accentBadge: 'bg-blue-50 text-blue-700'
    },
    navy: {
      bgIcon: 'bg-slate-100 text-[#17243A]',
      borderHover: 'hover:border-[#17243A]',
      accentBadge: 'bg-slate-100 text-[#17243A]'
    }
  };

  const scheme = colorStyles[colorScheme] || colorStyles.teal;

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs transition-all duration-200 ${
        scheme.borderHover
      } ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-bold tracking-wider text-[#667085] uppercase">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-black text-[#17243A] tracking-tight">
              {value}
            </h3>
            {badge && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${scheme.accentBadge}`}>
                {badge}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${scheme.bgIcon}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtext || trendLabel) && (
        <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#667085]">
          <span className="truncate">{subtext}</span>

          {trendLabel && (
            <span
              className={`inline-flex items-center gap-0.5 font-bold shrink-0 ${
                trend === 'up'
                  ? 'text-[#2EAD62]'
                  : trend === 'down'
                  ? 'text-red-500'
                  : 'text-[#667085]'
              }`}
            >
              {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
              {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
              {trend === 'neutral' && <Minus className="w-3.5 h-3.5" />}
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
