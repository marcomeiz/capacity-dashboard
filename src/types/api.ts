// COR API Types
export interface CORResponse<T> {
    data: T[];
    total: number;
    per_page: number;
    current_page: number;
  }
  
  export interface CORError {
    message: string;
    code: string;
    status: number;
  }
  
  // Factorial API Types
  export interface FactorialResponse<T> {
    data: T;
    meta?: {
      total: number;
      per_page: number;
      current_page: number;
    };
  }
  
  export interface FactorialError {
    error: string;
    message: string;
    status: number;
  }