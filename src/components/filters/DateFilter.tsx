import { useState } from 'react';

interface DateFilterProps {
  onMonthChange: (date: Date) => void;
}

export function DateFilter({ onMonthChange }: DateFilterProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const handleMonthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(event.target.value + '-01');
    setSelectedMonth(newDate);
    onMonthChange(newDate);
  };

  return (
    <div className="mb-4 p-4 bg-white rounded shadow">
      <label className="block text-sm font-medium text-gray-700">
        Seleccionar Mes
        <input
          type="month"
          value={`${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`}
          onChange={handleMonthChange}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </label>
    </div>
  );
}