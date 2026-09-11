import React from 'react';
import { Clock, ShieldCheck, CheckCircle, XCircle } from 'lucide-react';

export default function DonationStatusBadge({ status, size = 'md' }) {
  const configs = {
    'Pending Verification': {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: Clock,
      label: 'Pending Verification',
    },
    Verified: {
      bg: 'bg-[#EAF6F3]',
      text: 'text-[#087F73]',
      border: 'border-[#087F73]/30',
      icon: ShieldCheck,
      label: 'Verified',
    },
    Completed: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: CheckCircle,
      label: 'Completed',
    },
    Rejected: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: XCircle,
      label: 'Rejected',
    },
  };

  const config = configs[status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: Clock,
    label: status || 'Unknown',
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size] || sizeClasses.md}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
}
