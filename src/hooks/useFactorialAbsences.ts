import { useState, useEffect } from 'react';
import { factorialService } from '../services/factorial';
import type { LoadingState } from '../types/common';

interface Absence {
  employeeName: string;
  startDate: Date;
  endDate: Date;
  type: string;
}

export function useFactorialAbsences(enabled = true) {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [status, setStatus] = useState<LoadingState>('idle');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      try {
        setStatus('loading');
        
        const rawAbsences = await factorialService.getAbsences();
        
        const formattedAbsences = rawAbsences.map(absence => ({
          employeeName: absence.employee_full_name,
          startDate: new Date(absence.start_on),
          endDate: new Date(absence.finish_on),
          type: absence.leave_type_id.toString()
        }));

        setAbsences(formattedAbsences);
        setStatus('success');
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setStatus('error');
      }
    };

    fetchData();
  }, [enabled]);

  return { 
    absences,
    status, 
    error,
    refetch: () => setStatus('idle')
  };
}