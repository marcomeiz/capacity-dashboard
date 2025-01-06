import { Handler, schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { migrateData } from '../../src/scripts/migrateData';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
);

const refreshMaterializedViews = async () => {
  try {
    await supabase.rpc('refresh_monthly_collaborator_hours');
    await supabase.rpc('refresh_monthly_capacity');
    console.log('✅ Vistas materializadas actualizadas');
  } catch (error) {
    console.error('❌ Error actualizando vistas materializadas:', error);
    throw error;
  }
};

const updateHandler: Handler = async (event, context) => {
  try {
    console.log('🔄 Iniciando actualización nocturna...');
    await migrateData();
    await refreshMaterializedViews();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Actualización completada con éxito' })
    };
  } catch (error) {
    console.error('❌ Error en la actualización:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error en la actualización' })
    };
  }
};

export const handler = schedule('1 0 * * *', updateHandler);