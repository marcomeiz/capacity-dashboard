import { describe, it, expect } from 'vitest';
import { calculateWorkingDays, calculateAvailableHours, processCapacityData } from '../capacityCalculations';
import type { Task } from '../../types/cor';
import type { RawAbsence } from '../../types/factorial';

describe('calculateWorkingDays', () => {
  it('calculates working days correctly excluding weekends', () => {
    const startDate = new Date('2024-01-01'); // Monday
    const endDate = new Date('2024-01-05'); // Friday
    const result = calculateWorkingDays(startDate, endDate, [], 'Test User');
    expect(result.workingDays).toBe(5);
  });

  it('handles vacations correctly', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-05');
    const absences = [{
      employeeName: 'Test User',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-02'),
      type: 'Vacation'
    }];
    const result = calculateWorkingDays(startDate, endDate, absences, 'Test User');
    expect(result.vacationDays).toBe(2);
    expect(result.workingDays).toBe(3);
  });
});

describe('calculateAvailableHours', () => {
  it('calculates regular month hours correctly', () => {
    const result = calculateAvailableHours(20, 1); // January
    expect(result).toBe(144); // 20 days * 8 hours * 0.9 (buffer)
  });

  it('calculates August hours correctly', () => {
    const result = calculateAvailableHours(20, 7); // August
    expect(result).toBe(126); // 20 days * 7 hours * 0.9 (buffer)
  });
});

describe('processCapacityData', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    
    const mockTasks: Task[] = [{
      id: 1,
      title: 'Test Task',
      clientName: 'Client',
      projectName: 'Project',
      status: 'active',
      startDate: new Date('2024-01-15'),
      projectManager: 'PM',
      collaborators: ['User 1', 'User 2'],
      hoursCharged: 16,
      hoursEstimated: 20,
      taskUrl: 'url'
    }];
  
    const mockAbsences: RawAbsence[] = [{
      employeeName: 'User 1',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-05'),
      type: 'Vacation'
    }];
  
    it('calculates capacity data correctly', () => {
      const result = processCapacityData(mockTasks, mockAbsences, { startDate, endDate });
      
      expect(result).toHaveLength(2);
      const user1Data = result.find(d => d.collaborator === 'User 1');
      const user2Data = result.find(d => d.collaborator === 'User 2');
  
      expect(user1Data?.chargedHours).toBe(8);
      expect(user1Data?.estimatedHours).toBe(10);
      expect(user1Data?.vacationDays).toBe(5);
  
      expect(user2Data?.chargedHours).toBe(8);
      expect(user2Data?.estimatedHours).toBe(10);
      expect(user2Data?.vacationDays).toBe(0);
    });
  });