export interface Collaborator {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    pictureUrl?: string;
    remainingHours?: number;
  }
  
  export interface Task {
    id: number;
    title: string;
    clientName: string;
    projectName: string;
    status: string;
    startDate: Date;
    deadline?: Date;
    projectManager: string;
    collaborators: string[];
    hoursCharged: number;
    hoursEstimated: number;
    taskUrl: string;
  }
  
  export interface CapacityData {
    collaborator: string;
    availableHours: number;
    estimatedHours: number;
    chargedHours: number;
    realLoadPercentage: number;
    plannedLoadPercentage: number;
    vacationDays: number;
    otherAbsences: number;
  }
  
  export type DateRange = {
    startDate: Date;
    endDate: Date;
  };
  
  export type LoadingState = 'idle' | 'loading' | 'error' | 'success';