import type { Task, CapacityData } from '../types/common';

interface RawAbsence {
  employeeName: string;
  startDate: Date;
  endDate: Date;
  type: string;
}

const HOURS_PER_DAY = 8;
const AUGUST_HOURS_PER_DAY = 7;
const DEFAULT_BUFFER_PERCENTAGE = 0.1;

export function calculateWorkingDays(
    startDate: Date,
    endDate: Date,
    absences: RawAbsence[],
    collaboratorName: string
  ): {workingDays: number, vacationDays: number, otherAbsences: number} {
    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    let workingDays = 0;
    let vacationDays = 0;
    let otherAbsences = 0;
  
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue;
  
      const absence = absences.find(a => 
        a.employeeName === collaboratorName &&
        currentDate >= a.startDate &&
        currentDate <= a.endDate
      );
  
      if (absence) {
        if (absence.type.toLowerCase().includes('vacation')) {
          vacationDays++;
        } else {
          otherAbsences++;
        }
      } else {
        workingDays++;
      }
    }
  
    return { workingDays, vacationDays, otherAbsences };
  }

export function calculateAvailableHours(
  workingDays: number,
  month: number,
  bufferPercentage = DEFAULT_BUFFER_PERCENTAGE
): number {
  const hoursPerDay = month === 7 ? AUGUST_HOURS_PER_DAY : HOURS_PER_DAY;
  const totalHours = workingDays * hoursPerDay;
  const bufferHours = totalHours * bufferPercentage;
  return totalHours - bufferHours;
}

export function processCapacityData(
    tasks: Task[],
    absences: RawAbsence[],
    dateRange: { startDate: Date; endDate: Date }
  ): CapacityData[] {
    const collaborators = new Map<string, CapacityData>();
  
    tasks.forEach(task => {
      const taskInRange = new Date(task.startDate) >= dateRange.startDate && 
                         new Date(task.startDate) <= dateRange.endDate;
      
      if (!taskInRange) return;
  
      task.collaborators.forEach(collaborator => {
        if (!collaborators.has(collaborator)) {
          const { workingDays, vacationDays, otherAbsences } = calculateWorkingDays(
            dateRange.startDate,
            dateRange.endDate,
            absences,
            collaborator
          );
  
          const availableHours = calculateAvailableHours(
            workingDays,
            dateRange.startDate.getMonth()
          );
  
          collaborators.set(collaborator, {
            collaborator,
            availableHours,
            estimatedHours: 0,
            chargedHours: 0,
            realLoadPercentage: 0,
            plannedLoadPercentage: 0,
            vacationDays,
            otherAbsences
          });
        }
  
        const data = collaborators.get(collaborator)!;
        const collaboratorCount = task.collaborators.length;
        data.estimatedHours += task.hoursEstimated / collaboratorCount;
        data.chargedHours += task.hoursCharged / collaboratorCount;
      });
    });
  
    return Array.from(collaborators.values()).map(data => ({
      ...data,
      realLoadPercentage: (data.chargedHours / data.availableHours) * 100,
      plannedLoadPercentage: (data.estimatedHours / data.availableHours) * 100
    }));
  }












































































