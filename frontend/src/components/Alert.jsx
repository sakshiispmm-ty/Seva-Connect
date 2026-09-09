import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function Alert({
  type = 'info',
  message,
  title,
  onClose,
  className = ''
}) {
  if (!message) return null;

  const styles = {
    success: {
      container: 'bg-[#EAF6F3] border-[#2EAD62] text-[#05665D]',
      icon: <CheckCircle2 className="w-5 h-5 text-[#2EAD62] shrink-0" />
    },
    error: {
      container: 'bg-rose-50 border-rose-400 text-rose-800',
      icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
    },
    warning: {
      container: 'bg-[#FFF4D6] border-[#F7BA3E] text-[#17243A]',
      icon: <AlertTriangle className="w-5 h-5 text-[#F7BA3E] shrink-0" />
    },
    info: {
      container: 'bg-[#EAF6F3] border-[#087F73] text-[#087F73]',
      icon: <Info className="w-5 h-5 text-[#087F73] shrink-0" />
    }
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 border-l-4 rounded-r-lg shadow-sm ${currentStyle.container} ${className}`}
    >
      {currentStyle.icon}
      <div className="flex-1 text-sm">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div className="leading-relaxed">{message}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-0.5 rounded transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
