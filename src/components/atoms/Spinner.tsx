interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
  }
  
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  } as const;
  
  export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
    return (
      <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 ${sizes[size]} ${className}`} />
    );
  }