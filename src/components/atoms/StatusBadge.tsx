interface StatusBadgeProps {
    status: string;
    className?: string;
  }
  
  const statusStyles = {
    finalizada: 'bg-green-100 text-green-800',
    'en curso': 'bg-blue-100 text-blue-800',
    pendiente: 'bg-yellow-100 text-yellow-800',
    retrasada: 'bg-red-100 text-red-800',
    default: 'bg-gray-100 text-gray-800'
  } as const;
  
  export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    const statusStyle = statusStyles[status.toLowerCase() as keyof typeof statusStyles] || statusStyles.default;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle} ${className}`}>
        {status}
      </span>
    );
  }