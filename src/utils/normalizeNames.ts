import { supabase } from '../lib/supabase';

// Función para limpiar y normalizar nombres (quita tildes y extrae primer apellido si es necesario)
function cleanName(name: string): string {
  return name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Elimina tildes
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' '); // Elimina espacios extra
}

// Función para obtener el nombre normalizado desde Supabase
export async function normalizeName(name: string): Promise<string> {
  const cleanedName = cleanName(name);
  
  // Buscar si ya existe en name_mappings
  let { data, error } = await supabase
    .from('name_mappings')
    .select('canonical_name')
    .or(`cor_name.eq.${cleanedName},factorial_name.eq.${cleanedName}`)
    .single();

  if (!error && data) {
    return data.canonical_name; // Si ya existe, devolver el nombre normalizado
  }

  console.warn(`⚠️ Nombre no encontrado en el mapeo: ${name}`);

  // Intentar encontrarlo sin el segundo apellido
  const splitName = cleanedName.split(' ');  
  if (splitName.length > 2) {
    const firstLastName = `${splitName[0]} ${splitName[1]}`; // Primer nombre + primer apellido

    let { data: possibleMatch, error: findError } = await supabase
      .from('name_mappings')
      .select('canonical_name')
      .or(`cor_name.eq.${firstLastName},factorial_name.eq.${firstLastName}`)
      .single();

    if (!findError && possibleMatch) {
      console.log(`🔍 Se encontró coincidencia parcial para ${name}: ${possibleMatch.canonical_name}`);
      return possibleMatch.canonical_name;
    }
  }

  // Si no se encuentra, guardamos el nombre bien formateado
  const canonicalName = splitName.length > 2 ? `${splitName[0]} ${splitName[1]}` : cleanedName;

  const { error: insertError } = await supabase
    .from('name_mappings')
    .insert([{ cor_name: cleanedName, factorial_name: cleanedName, canonical_name: canonicalName }]);

  if (insertError) {
    console.error(`🚨 Error guardando nombre no mapeado: ${name}`, insertError);
  } else {
    console.log(`✅ Nombre agregado en name_mappings: ${cleanedName} → ${canonicalName}`);
  }

  return canonicalName;
}
