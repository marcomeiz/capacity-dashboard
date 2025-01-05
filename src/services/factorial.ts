import { config } from '../scripts/migrateConfig';

interface FactorialEmployee {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  preferred_name: string | null;
  email: string;
  birthday_on: string | null;
  gender: string | null;
  identifier: string | null;
  identifier_type: string | null;
  phone_number: string | null;
  manager_id: number | null;
  timeoff_manager_id: number | null;
  active: boolean;
}

interface FactorialContract {
  id: number;
  employee_id: number;
  salary_amount: number;
  salary_frequency: string;
  starts_on: string;
  ends_on: string | null;
  working_hours: number;
  working_hours_frequency: string;
}

interface FactorialAbsence {
  id: number;
  employee_full_name: string;
  start_on: string;
  finish_on: string;
  leave_type_id: number;
}

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
}

export const factorialService = new FactorialService();