import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon,
  helperText,
  className = '',
  containerClassName = '',
  labelClassName = '',
  errorClassName = '',
  helperClassName = '',
  ...props
}, ref) => {
  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && (
        <label 
          htmlFor={props.id} 
          className={cn(
            "block text-sm font-semibold text-gray-700 dark:text-gray-200 text-right",
            labelClassName
          )}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          className={cn(
            `w-full px-4 py-3.5 border-2 rounded-xl 
            focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600
            text-right placeholder-gray-400 dark:placeholder-gray-600 text-base dark:text-white
            transition-all duration-200 bg-white/80 backdrop-blur-sm
            dark:bg-gray-800/90 hover:border-gray-400 dark:hover:border-gray-600
            ${error ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500' : 'border-gray-200 dark:border-gray-700'}
            ${icon ? 'pr-12' : ''}`,
            className
          )}
          // Add attributes for date inputs
          {...(props.type === 'date' ? {
            'data-calendar': 'gregory',
            'lang': 'ar'
          } : {})}
          {...props}
        />
        {icon && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <div className={cn("flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium text-right", errorClassName)}>
          <svg className="w-4 h-4 flex-shrink-0 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      {helperText && !error && (
        <p className={cn("text-xs text-gray-500 dark:text-gray-400", helperClassName)}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
