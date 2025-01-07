export interface FactorialEmployee {
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
  
  export interface FactorialContract {
    id: number;
    employee_id: number;
    salary_amount: number;
    salary_frequency: string;
    starts_on: string;
    ends_on: string | null;
    working_hours: number;
    working_hours_frequency: string;
  }
  
  export interface FactorialAbsence {
    id: number;
    employee_full_name: string;
    start_on: string;
    finish_on: string;
    leave_type_id: number;
  }
  
  export interface FactorialLeaveType {
    id: number;
    name: string;
    translated_name: string;
    color: string;
  }

  export interface RawAbsence {
    employeeName: string;
    startDate: Date;
    endDate: Date;
    type: string;
  }