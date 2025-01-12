// scripts/updateData.ts
import { createClient } from '@supabase/supabase-js';
import { migrateData } from './migrateData';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function refreshMaterializedViews() {
  try {
    await supabase.rpc('refresh_monthly_collaborator_hours');
    await supabase.rpc('refresh_monthly_capacity');
    console.log('✅ Vistas materializadas actualizadas');
  } catch (error) {
    console.error('❌ Error actualizando vistas materializadas:', error);
    throw error;
  }
}

async function updateData() {
  try {
    console.log('🔄 Iniciando actualización...');
    await migrateData();
    await refreshMaterializedViews();
    console.log('✅ Actualización completada con éxito');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la actualización:', error);
    process.exit(1);
  }
}

updateData();