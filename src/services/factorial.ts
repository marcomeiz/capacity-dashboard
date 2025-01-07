import { config } from '../scripts/migrateConfig';
import type { 
  FactorialEmployee, 
  FactorialContract, 
  FactorialAbsence,
  FactorialLeaveType 
} from '../types/factorial';

export class FactorialService {
  private baseUrl = 'https://api.factorialhr.com/api/2025-01-01';

  private async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'accept': 'application/json',
        'x-api-key': config.factorial.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Factorial API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  async getEmployees(): Promise<FactorialEmployee[]> {
    return this.request<FactorialEmployee[]>('/resources/employees/employees?only_active=true');
  }

  async getContracts(): Promise<FactorialContract[]> {
    return this.request<FactorialContract[]>('/resources/contracts/contract_versions');
  }

  async getAbsences(): Promise<FactorialAbsence[]> {
    return this.request<FactorialAbsence[]>('/resources/timeoff/leaves');
  }

  async getLeaveTypes(): Promise<FactorialLeaveType[]> {
    return this.request<FactorialLeaveType[]>('/resources/timeoff/leave_types');
  }
}

export const factorialService = new FactorialService();