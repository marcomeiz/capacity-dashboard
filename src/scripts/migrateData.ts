import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import { config } from './migrateConfig';
import { corService } from '../services/cor';
import { factorialService } from '../services/factorial';

const supabase = createClient(config.supabase.url, config.supabase.key);

// Función para obtener el nombre canónico desde Supabase
async function getCanonicalName(name: string, source: 'cor' | 'factorial'): Promise<string> {
  const column = source === 'cor' ? 'cor_name' : 'factorial_name';
  const { data, error } = await supabase
    .from('name_mappings')
    .select('canonical_name')
    .eq(column, name)
    .maybeSingle();

  if (error) {
    console.error(`⚠️ Error buscando nombre en name_mappings (${name} desde ${source}):`, error);
  }

  return data?.canonical_name || name;
}

async function migrateData() {
  try {
    console.log('🔄 Iniciando migración...');

    // Limpiar datos existentes
    console.log('🧹 Limpiando datos antiguos...');
    await supabase.from('task_collaborators').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('absences').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('employees').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Datos antiguos eliminados');

    // Importar empleados y sus contratos desde Factorial
    console.log('📥 Importando empleados y contratos de Factorial...');
    const [employees, contracts] = await Promise.all([
      factorialService.getEmployees(),
      factorialService.getContracts(),
    ]);

    const contractsMap = new Map(contracts.map(contract => [contract.employee_id, contract]));

    // Insertar empleados
    const { error: employeesError } = await supabase.from('employees').upsert(
      await Promise.all(
        employees.map(async (employee) => {
          const contract = contractsMap.get(employee.id);
          const yearlyAmount = contract
            ? contract.salary_frequency === 'yearly'
              ? contract.salary_amount
              : contract.salary_amount * (contract.salary_frequency === 'monthly' ? 12 : 1)
            : null;

          const normalizedFullName = await getCanonicalName(employee.full_name, 'factorial');

          return {
            factorial_id: employee.id,
            first_name: employee.first_name,
            last_name: employee.last_name,
            full_name: normalizedFullName,
            preferred_name: employee.preferred_name,
            email: employee.email,
            birthday_on: employee.birthday_on,
            gender: employee.gender,
            identifier: employee.identifier,
            identifier_type: employee.identifier_type,
            phone_number: employee.phone_number,
            manager_id: employee.manager_id,
            timeoff_manager_id: employee.timeoff_manager_id,
            active: employee.active,
            compensation_amount: yearlyAmount ? yearlyAmount / 100 : null,
            compensation_currency: 'EUR',
            contract_starts_on: contract?.starts_on || null,
            contract_ends_on: contract?.ends_on || null,
            working_hours: contract?.working_hours ? contract.working_hours / 100 : null,
            working_hours_frequency: contract?.working_hours_frequency || null,
          };
        })
      )
    );

    if (employeesError) throw employeesError;
    console.log(`✅ Importados ${employees.length} empleados con sus contratos`);

    // Actualizar el estado de "operacionalidad" en la tabla employee_operational_status
    console.log('🔄 Actualizando estado de operacionalidad...');
    for (const employee of employees) {
      const normalizedFullName = await getCanonicalName(employee.full_name, 'factorial');

      // Verificar si el empleado ya existe en employee_operational_status
      const { data: operationalStatus, error: fetchError } = await supabase
        .from('employee_operational_status')
        .select('is_operational')
        .eq('employee_id', employee.id)
        .maybeSingle();

      if (fetchError) {
        console.error(`⚠️ Error obteniendo estado de operacionalidad (${employee.id}):`, fetchError);
      }

      if (!operationalStatus) {
        // Si no existe, insertar el registro con el nombre y el valor por defecto (true)
        const { error: insertError } = await supabase
          .from('employee_operational_status')
          .insert([{ 
            employee_id: employee.id, 
            employee_name: normalizedFullName, 
            is_operational: true 
          }]);

        if (insertError) {
          console.error(`⚠️ Error insertando estado de operacionalidad (${employee.id}):`, insertError);
        }
      } else {
        // Si existe, actualizar el nombre del empleado (por si cambió)
        const { error: updateError } = await supabase
          .from('employee_operational_status')
          .update({ employee_name: normalizedFullName })
          .eq('employee_id', employee.id);

        if (updateError) {
          console.error(`⚠️ Error actualizando nombre del empleado (${employee.id}):`, updateError);
        }
      }
    }
    console.log('✅ Estado de operacionalidad actualizado');

    // Importar ausencias desde Factorial
    console.log('📥 Importando ausencias de Factorial...');
    const absences = await factorialService.getAbsences();
    const { error: absencesError } = await supabase.from('absences').upsert(
      absences.map(absence => ({
        factorial_id: absence.id.toString(),
        employee_name: absence.employee_full_name,
        start_date: absence.start_on,
        end_date: absence.finish_on,
        absence_type: absence.leave_type_id.toString(),
      }))
    );
    if (absencesError) throw absencesError;
    console.log(`✅ Importadas ${absences.length} ausencias`);

    // Importar datos de COR
    console.log('📥 Importando tareas de COR...');
    const tasks = await corService.getAllTasks();
    console.log(`📌 Total de tareas a procesar: ${tasks.length}`);

    const batchSize = 100;
    let processedTasks = 0;

    for (let i = 0; i < tasks.length; i += batchSize) {
      processedTasks += batchSize;
      const batch = tasks.slice(i, i + batchSize);

      const { data: insertedTasks, error: tasksError } = await supabase
        .from('tasks')
        .upsert(
          batch.map(task => ({
            cor_id: task.id,
            title: task.title || 'Untitled Task',
            project_name: task.project?.name || 'Unknown Project',
            client_name: task.project?.client?.name || 'Unknown Client',
            status: task.status || 'unknown',
            start_date: task.datetime,
            deadline: task.deadline || null,
            hours_charged: task.hour_charged || 0,
            hours_estimated: (task.estimated || 0) / 60,
            project_manager: task.pm ? `${task.pm.first_name} ${task.pm.last_name}` : 'Unassigned',
          }))
        )
        .select('id, cor_id');

      if (tasksError) throw tasksError;

      const taskIdMap = new Map(insertedTasks?.map(task => [task.cor_id, task.id]));

      // Insertar colaboradores con nombres normalizados
      const collaborators = await Promise.all(
        batch.flatMap(async (task) => {
          const taskUUID = taskIdMap.get(task.id);
          if (!taskUUID) return [];

          if (!task.collaborators?.length) return [];

          return Promise.all(
            task.collaborators.map(async (collab) => {
              // Obtener el nombre completo directamente de COR
              const collaboratorFullName = collab.first_name && collab.last_name 
                ? `${collab.first_name} ${collab.last_name}`.trim()
                : 'Unknown Collaborator';

              // Obtener el nombre canónico
              const canonicalName = await getCanonicalName(collaboratorFullName, 'cor');
              
        
        
        
        
        

              return {
                task_id: taskUUID,
                collaborator_name: canonicalName,
                hours_charged: (task.hour_charged || 0) / (task.collaborators?.length || 1),
                hours_estimated: ((task.estimated || 0) / 60) / (task.collaborators?.length || 1),
              };
            })
          );
        })
      );

      if (collaborators.length > 0) {
        const { error: collabError } = await supabase.from('task_collaborators').upsert(collaborators.flat());
        if (collabError) throw collabError;
      }

      if (processedTasks % 500 === 0 || processedTasks >= tasks.length) {
        console.log(`🔹 Procesadas ${Math.min(processedTasks, tasks.length)} de ${tasks.length} tareas`);
      }
    }

    console.log('✅ Migración completada con éxito');
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  }
}

export { migrateData };