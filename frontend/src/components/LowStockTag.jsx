import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function LowStockTag({ isLowStock, quantity, threshold, unit = 'units' }) {
  if (isLowStock) {
    return (
      <span
        title={`Stock level (${quantity} ${unit}) is at or below threshold (${threshold} ${unit})`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
        <span>Low Stock</span>
      </span>
    );
  }

  return (
    <span
      title={`Healthy stock (${quantity} ${unit})`}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      <span>Sufficient</span>
    </span>
  );
}
