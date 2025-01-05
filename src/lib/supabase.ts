import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://hozjcowanpngcndykljj.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export interface CapacityData {
  employee_id: string;
  full_name: string;
  month_start: string;
  working_days: number;
  absence_days: number;
  gross_hours: number | null;
  available_hours: string | null;
  charged_hours: string;
  estimated_hours: string;
  actual_load_percentage: string;
  planned_load_percentage: string;
  last_updated: string;
}

export async function fetchCapacityData(date: Date): Promise<CapacityData[]> {
    const startOfMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-01`;

  
  console.log("🔍 Buscando datos en Supabase para:", startOfMonth);

  const { data, error } = await supabase
    .from('monthly_collaborator_hours')
    .select('*')
    .eq('month_start', startOfMonth);

  if (error) {
    console.error("⚠️ Error al obtener datos:", error);
    throw error;
  }

  console.log("📊 Datos obtenidos:", data);
  return data || [];
}
