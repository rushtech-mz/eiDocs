"use client";

import React, { useState } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

interface ModernInputProps {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  label?: string;
  error?: string | null;
  success?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const ModernInput: React.FC<ModernInputProps> = ({
  type = "text",
  placeholder,
  value,
  onChange,
  onKeyDown,
  label,
  error,
  success = false,
  required = false,
  icon,
  className = ""
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === "password" && showPassword ? "text" : type;
  const hasValue = value.length > 0;
  const hasError = !!error;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ease-in-out
            ${icon ? 'pl-10' : ''}
            ${type === 'password' ? 'pr-12' : ''}
            ${hasError 
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
              : success 
                ? 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-200'
                : 'border-gray-200 bg-white hover:border-gray-300 focus:border-green-500 focus:ring-green-200'
            }
            ${isFocused ? 'shadow-lg scale-[1.02]' : 'shadow-sm'}
            focus:outline-none focus:ring-4
            dark:bg-gray-800 dark:border-gray-600 dark:text-white
            dark:focus:border-green-400 dark:focus:ring-blue-900
          `}
        />
        
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
        
        {hasValue && !hasError && success && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
            <CheckCircle size={20} />
          </div>
        )}
        
        {hasError && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
            <AlertCircle size={20} />
          </div>
        )}
      </div>
      
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm animate-fade-in">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ModernInput;
