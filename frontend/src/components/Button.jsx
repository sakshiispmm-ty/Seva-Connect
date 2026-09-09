import React from 'react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  id,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none shadow-sm active:scale-[0.98]';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-medium',
    md: 'px-5 py-2.5 text-sm font-semibold',
    lg: 'px-6 py-3.5 text-base font-semibold'
  };

  const variantClasses = {
    primary: 'bg-[#087F73] hover:bg-[#05665D] text-white focus:ring-[#087F73] shadow-sm',
    dark: 'bg-[#05665D] hover:bg-[#17243A] text-white focus:ring-[#05665D]',
    cta: 'bg-[#F7BA3E] hover:bg-[#e2a832] text-[#17243A] font-bold focus:ring-[#F7BA3E] shadow-md hover:shadow-lg',
    success: 'bg-[#2EAD62] hover:bg-[#269352] text-white focus:ring-[#2EAD62]',
    outline: 'border-2 border-[#087F73] text-[#087F73] bg-transparent hover:bg-[#EAF6F3] focus:ring-[#087F73]',
    ghost: 'text-[#17243A] hover:bg-[#EAF6F3] bg-transparent focus:ring-[#087F73]',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500'
  };

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
