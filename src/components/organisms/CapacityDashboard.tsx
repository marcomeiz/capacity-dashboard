import { useState, useEffect } from 'react';
import { DateRangeFilter } from '../molecules/DateRangeFilter';
import { MetricsSummary } from '../molecules/MetricsSummary';
import { CapacityTable } from '../molecules/CapacityTable';
import { Spinner } from '../atoms/Spinner';
import { ErrorMessage } from '../atoms/ErrorMessage';
import { useCORTasks } from '../../hooks/useCORTasks';
import { useFactorialAbsences } from '../../hooks/useFactorialAbsences';
import { useDateRange } from '../../hooks/useDateRange';
import { processCapacityData } from '../../utils/capacityCalculations';
import type { CapacityData } from '../../types/common';

export function CapacityDashboard() {
  const [capacityData, setCapacityData] = useState<CapacityData[]>([]);
  const { dateRange, setMonth } = useDateRange(new Date());
  const { tasks, status: tasksStatus, error: tasksError } = useCORTasks();
  const { absences, status: absencesStatus, error: absencesError } = useFactorialAbsences();

  const isLoading = tasksStatus === 'loading' || absencesStatus === 'loading';
  const error = tasksError || absencesError;

  useEffect(() => {
    if (tasksStatus === 'success' && absencesStatus === 'success') {
      const processedData = processCapacityData(tasks, absences, dateRange);
      setCapacityData(processedData);
    }
  }, [tasks, absences, dateRange, tasksStatus, absencesStatus]);

  // 🔹 Convertir a número y evitar NaN
  const totalChargedHours = capacityData.reduce((sum, data) => sum + Number(data.charged_hours || 0), 0);
  const totalAvailableHours = capacityData.reduce((sum, data) => sum + Number(data.available_hours || 0), 0);
  const utilizationRate = totalAvailableHours > 0 ? (totalChargedHours / totalAvailableHours) * 100 : 0;

  const metrics = {
    totalHours: totalChargedHours,
    availableHours: totalAvailableHours,
    utilizationRate,
    activeCollaborators: capacityData.length
  };

  if (error) {
    return <ErrorMessage message={error.message} className="m-4" />;
  }

  return (
    <div className="p-4 space-y-4">
      <DateRangeFilter 
        onRangeChange={(start, end) => setMonth(start)} 
        defaultMonth={dateRange.startDate}
      />
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <MetricsSummary data={metrics} />
          <CapacityTable data={capacityData} />
        </>
      )}
    </div>
  );
}
