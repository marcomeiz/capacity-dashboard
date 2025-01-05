import { useState, useEffect } from 'react';
import { corService } from '../services/cor';
import type { Task, LoadingState } from '../types/common';

export function useCORTasks(enabled = true) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState<LoadingState>('idle');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchTasks = async () => {
      try {
        setStatus('loading');
        const rawTasks = await corService.getAllTasks();
        
        // Transformamos los datos al formato que necesitamos
        const formattedTasks = rawTasks.map(task => ({
          id: task.id,
          title: task.title,
          clientName: task.project.client.name,
          projectName: task.project.name,
          status: task.status,
          startDate: new Date(task.datetime),
          deadline: task.deadline ? new Date(task.deadline) : undefined,
          projectManager: `${task.pm.first_name} ${task.pm.last_name}`,
          collaborators: task.collaborators.map(c => `${c.first_name} ${c.last_name}`),
          hoursCharged: task.hour_charged,
          hoursEstimated: task.estimated / 60, // Convertimos minutos a horas
          taskUrl: `https://ooptimo.cor.works/tasks/${task.id}/`
        }));

        setTasks(formattedTasks);
        setStatus('success');
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setStatus('error');
      }
    };

    fetchTasks();
  }, [enabled]);

  return { tasks, status, error, refetch: () => setStatus('idle') };
}