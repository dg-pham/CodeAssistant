import React, { SelectHTMLAttributes, forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  onChange?: (value: string) => void;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({
    label,
    options,
    error,
    helperText,
    fullWidth = false,
    className = '',
    onChange,
    ...rest
  }, ref) => {
    const baseSelectClasses = 'rounded-md border py-2 pl-3 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white';
    const errorSelectClasses = 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500';
    const normalSelectClasses = 'border-gray-300 text-gray-900';
    const widthClasses = fullWidth ? 'w-full' : '';

    const selectClasses = `
      ${baseSelectClasses}
      ${error ? errorSelectClasses : normalSelectClasses}
      ${widthClasses}
      ${className}
    `;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label htmlFor={rest.id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            className={selectClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${rest.id}-error` : undefined}
            onChange={handleChange}
            {...rest}
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

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

Select.displayName = 'Select';