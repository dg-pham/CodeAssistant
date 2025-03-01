import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  variant?: 'default' | 'outline' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  footer,
  children,
  className = '',
  onClick,
  hoverable = false,
  variant = 'default',
}) => {
  const baseClasses = 'rounded-lg overflow-hidden';

  const variantClasses = {
    default: 'bg-white border border-gray-200',
    outline: 'bg-white border border-gray-300',
    elevated: 'bg-white shadow-md',
  };

  const hoverClasses = hoverable
    ? 'transition-all duration-200 hover:shadow-lg cursor-pointer'
    : '';

  const cardClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${hoverClasses}
    ${className}
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      {(title || subtitle) && (
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          {title && <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>}
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}

      <div className="px-4 py-5 sm:p-6">
        {children}
      </div>

      {footer && (
        <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};