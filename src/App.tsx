import { useState } from 'react';
import { DashboardLayout } from './components/templates/DashboardLayout';
import { DateFilter } from './components/filters/DateFilter';
import { CapacityGrid } from './components/grid/CapacityGrid';

function App() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const handleMonthChange = (date: Date) => {
    setSelectedMonth(date);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <DateFilter onMonthChange={handleMonthChange} />
        <CapacityGrid selectedMonth={selectedMonth} />
      </div>
    </DashboardLayout>
  );
}

export default App;