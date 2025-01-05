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
  const [leaveTypes, setLeaveTypes] = useState<Record<number, string>>({});
  const [status, setStatus] = useState<LoadingState>('idle');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      try {
        setStatus('loading');
        
        // Obtenemos los tipos de ausencia primero
        const types = await factorialService.getLeaveTypes();
        const typesMap = Object.fromEntries(
          types.map(type => [type.id, type.translated_name])
        );
        setLeaveTypes(typesMap);

        // Luego obtenemos las ausencias
        const rawAbsences = await factorialService.getAbsences();
        
        const formattedAbsences = rawAbsences.map(absence => ({
          employeeName: absence.employee_full_name,
          startDate: new Date(absence.start_on),
          endDate: new Date(absence.finish_on),
          type: typesMap[absence.leave_type_id] || 'Unknown'
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
    leaveTypes,
    status, 
    error,
    refetch: () => setStatus('idle')
  };
}