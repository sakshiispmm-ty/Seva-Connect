import React from 'react';
import { 
  FileText, 
  Search, 
  CheckCircle, 
  XCircle, 
  PackageCheck, 
  Truck, 
  CheckCheck, 
  Clock 
} from 'lucide-react';

export default function RequestStatusBadge({ status, size = 'md' }) {
  const configs = {
    'Submitted': {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200',
      icon: FileText,
      label: 'Submitted',
    },
    'Under Review': {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: Search,
      label: 'Under Review',
    },
    'Approved': {
      bg: 'bg-[#EAF6F3]',
      text: 'text-[#087F73]',
      border: 'border-[#087F73]/30',
      icon: CheckCircle,
      label: 'Approved',
    },
    'Rejected': {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: XCircle,
      label: 'Rejected',
    },
    'Resources Allocated': {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      icon: PackageCheck,
      label: 'Resources Allocated',
    },
    'Volunteer Assigned': {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      icon: Truck,
      label: 'Volunteer Assigned',
    },
    'Completed': {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: CheckCheck,
      label: 'Completed / Delivered',
    },
  };

  const config = configs[status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: Clock,
    label: status || 'Pending',
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.bg} ${config.text} ${config.border} ${sizeClasses[size] || sizeClasses.md}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
}
