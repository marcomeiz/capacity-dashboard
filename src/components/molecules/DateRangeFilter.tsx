import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../atoms/Card';

interface DateRangeFilterProps {
  onRangeChange: (startDate: Date, endDate: Date) => void;
  defaultMonth?: Date;
}

export function DateRangeFilter({ onRangeChange, defaultMonth = new Date() }: DateRangeFilterProps) {
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  const handleMonthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(event.target.value + '-01');
    setSelectedMonth(newDate);
    
    const startDate = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
    const endDate = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);
    
    onRangeChange(startDate, endDate);
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Filtro de Fecha</CardTitle>
      </CardHeader>
      <CardContent>
        <input
          type="month"
          value={`${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`}
          onChange={handleMonthChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </CardContent>
    </Card>
  );
}