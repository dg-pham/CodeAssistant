import React from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  rounded = false,
  children,
  className = '',
  onClick,
}) => {
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  const roundedClasses = rounded ? 'rounded-full' : 'rounded';
  const cursorClasses = onClick ? 'cursor-pointer hover:opacity-80' : '';

  const badgeClasses = `
    inline-flex items-center
    font-medium
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${roundedClasses}
    ${cursorClasses}
    ${className}
  `;

  return (
    <span className={badgeClasses} onClick={onClick}>
      {children}
    </span>
  );
};