import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helper,
  required = false,
  disabled = false,
  icon: Icon,
  className = '',
  allowTogglePassword = true,
  ...props
}) {
  const inputId = id || name;
  const isPasswordType = type === 'password';
  const [showPassword, setShowPassword] = useState(false);

  // If password toggle is enabled, switch between text and password
  const effectiveType = (isPasswordType && allowTogglePassword) 
    ? (showPassword ? 'text' : 'password') 
    : type;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-[#17243A] mb-1.5"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#667085]">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={effectiveType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`block w-full rounded-lg border text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-[#667085] ${
            Icon ? 'pl-10' : 'pl-3.5'
          } ${
            isPasswordType && allowTogglePassword ? 'pr-11' : 'pr-3.5'
          } py-2.5 ${
            error
              ? 'border-rose-400 text-rose-900 placeholder-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/30'
              : 'border-gray-200 text-[#17243A] placeholder-[#667085]/60 bg-white focus:border-[#087F73] focus:ring-[#087F73]/20'
          }`}
          {...props}
        />

        {/* Eye icon toggle for password fields */}
        {isPasswordType && allowTogglePassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#667085] hover:text-[#17243A] focus:outline-none transition-colors"
            tabIndex={-1}
            title={showPassword ? 'Hide password' : 'Show password'}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <Eye className="h-4.5 w-4.5 text-[#087F73] hover:text-[#05665D] transition-colors" />
            ) : (
              <EyeOff className="h-4.5 w-4.5 text-gray-400 hover:text-gray-700 transition-colors" />
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {!error && helper && (
        <p className="mt-1 text-xs text-[#667085]">{helper}</p>
      )}
    </div>
  );
}
