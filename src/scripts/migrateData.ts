import { createClient } from '@supabase/supabase-js';
import { config } from './migrateConfig';
import { corService } from '../services/cor';
import { factorialService } from '../services/factorial';

const supabase = createClient(config.supabase.url, config.supabase.key);

async function migrateData() {
 try {
   console.log('Starting migration...');

   // Limpiar datos existentes
   console.log('Cleaning existing data...');
   await supabase.from('task_collaborators').delete().neq('id', '00000000-0000-0000-0000-000000000000');
   await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
   await supabase.from('absences').delete().neq('id', '00000000-0000-0000-0000-000000000000');
   await supabase.from('employees').delete().neq('id', '00000000-0000-0000-0000-000000000000');
   console.log('Existing data cleaned');

   // Importar empleados y sus contratos
   console.log('Migrating Factorial employees and contracts...');
   const [employees, contracts] = await Promise.all([
     factorialService.getEmployees(),
     factorialService.getContracts()
   ]);

   // Crear un mapa de contratos por empleado
   const contractsMap = new Map(
     contracts.map(contract => [contract.employee_id, contract])
   );

   // Insertar empleados con sus datos de contrato
   const { error: employeesError } = await supabase.from('employees').upsert(
     employees.map(employee => {
       const contract = contractsMap.get(employee.id);
       const yearlyAmount = contract ? 
         contract.salary_frequency === 'yearly' ? 
           contract.salary_amount : 
           contract.salary_amount * (contract.salary_frequency === 'monthly' ? 12 : 1)
         : null;

    // Normalización de horas
    const normalizedHours = contract?.working_hours ? 
        contract.working_hours / 100 : null;

       return {
         factorial_id: employee.id,
         first_name: employee.first_name,
         last_name: employee.last_name,
         full_name: employee.full_name,
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
         // Datos del contrato normalizados
         compensation_amount: yearlyAmount ? yearlyAmount / 100 : null, // Convert cents to euros
         compensation_currency: 'EUR',
         contract_starts_on: contract?.starts_on || null,
         contract_ends_on: contract?.ends_on || null,
         working_hours: normalizedHours,
         working_hours_frequency: contract?.working_hours_frequency || null
       };
     })
   );

   if (employeesError) throw employeesError;
   console.log(`Imported ${employees.length} employees with their contracts`);

   // Factorial absences
   console.log('Migrating Factorial absences...');
   const absences = await factorialService.getAbsences();
   const { error: absencesError } = await supabase.from('absences').upsert(
     absences.map(absence => ({
       factorial_id: absence.id.toString(),
       employee_name: absence.employee_full_name,
       start_date: absence.start_on,
       end_date: absence.finish_on,
       absence_type: absence.leave_type_id.toString()
     }))
   );
   if (absencesError) throw absencesError;
   console.log(`Imported ${absences.length} absences`);

   // COR data
   console.log('Migrating COR data...');
   const tasks = await corService.getAllTasks();
   console.log(`Total tasks to process: ${tasks.length}`);
   const batchSize = 100;
   let processedTasks = 0;

   for (let i = 0; i < tasks.length; i += batchSize) {
       processedTasks += batchSize;
       const batch = tasks.slice(i, i + batchSize);
       
       // Insert tasks and get their IDs
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
             project_manager: task.pm ? `${task.pm.first_name} ${task.pm.last_name}` : 'Unassigned'
           }))
         )
         .select('id, cor_id');

       if (tasksError) throw tasksError;

       // Crear un mapa de cor_id a UUID
       const taskIdMap = new Map(
         insertedTasks?.map(task => [task.cor_id, task.id])
       );

       // Insert task collaborators usando los UUIDs correctos
       const collaborators = batch.flatMap(task => {
         const taskUUID = taskIdMap.get(task.id);
         if (!taskUUID) return [];
         
         // Si no hay colaboradores, retornamos array vacío
         if (!task.collaborators?.length) return [];
         
         return task.collaborators.map(collab => ({
           task_id: taskUUID,
           collaborator_name: collab ? `${collab.first_name || ''} ${collab.last_name || ''}`.trim() || 'Unknown Collaborator' : 'Unknown Collaborator',
           hours_charged: (task.hour_charged || 0) / (task.collaborators?.length || 1),
           hours_estimated: ((task.estimated || 0) / 60) / (task.collaborators?.length || 1)
         }));
       });

       if (collaborators.length > 0) {
         const { error: collabError } = await supabase
           .from('task_collaborators')
           .upsert(collaborators);
         if (collabError) throw collabError;
       }

       if (processedTasks % 500 === 0 || processedTasks >= tasks.length) {
           console.log(`Processed ${Math.min(processedTasks, tasks.length)} of ${tasks.length} tasks`);
       }
   }

   console.log('Migration completed successfully');
 } catch (error) {
   console.error('Migration failed:', error);
   throw error;
 }
}

migrateData();