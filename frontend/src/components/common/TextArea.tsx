import React, { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  rows?: number;
  resizable?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({
    label,
    error,
    helperText,
    fullWidth = false,
    rows = 4,
    resizable = true,
    className = '',
    ...rest
  }, ref) => {
    const baseTextareaClasses = 'rounded-md border py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500';
    const errorTextareaClasses = 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500';
    const normalTextareaClasses = 'border-gray-300 placeholder-gray-400';
    const widthClasses = fullWidth ? 'w-full' : '';
    const resizableClasses = resizable ? '' : 'resize-none';

    const textareaClasses = `
      ${baseTextareaClasses}
      ${error ? errorTextareaClasses : normalTextareaClasses}
      ${widthClasses}
      ${resizableClasses}
      ${className}
    `;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label htmlFor={rest.id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          rows={rows}
          className={textareaClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${rest.id}-error` : undefined}
          {...rest}
        />

        {error && (
          <p className="mt-1 text-sm text-red-600" id={`${rest.id}-error`}>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500" id={`${rest.id}-helper`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';