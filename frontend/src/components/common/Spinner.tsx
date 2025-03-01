import React from 'react';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  thickness?: 'thin' | 'regular' | 'thick';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  thickness = 'regular',
  className = '',
}) => {
  const sizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const colorClasses = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    white: 'text-white',
    gray: 'text-gray-300',
  };

  const thicknessClasses = {
    thin: 'border-2',
    regular: 'border-3',
    thick: 'border-4',
  };

  const spinnerClasses = `
    ${sizeClasses[size]}
    ${colorClasses[color]}
    ${thicknessClasses[thickness]}
    animate-spin rounded-full border-t-transparent
    ${className}
  `;

  return (
    <div className={spinnerClasses} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  spinnerProps?: SpinnerProps;
  overlayColor?: string;
  children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  text = 'Loading...',
  spinnerProps = { size: 'lg', color: 'primary' },
  overlayColor = 'bg-white bg-opacity-80',
  children,
}) => {
  return (
    <div className="relative">
      {children}

      {isLoading && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center ${overlayColor} z-10`}>
          <Spinner {...spinnerProps} />
          {text && <p className="mt-4 text-gray-700 font-medium">{text}</p>}
        </div>
      )}
    </div>
  );
};