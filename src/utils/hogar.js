import { supabase } from '../supabaseClient';
import { BUCKET, carpetaFamilia } from './evidencias';

// Elimina a un miembro y lo que tenía asignado
export async function eliminarMiembro(familia, nombre) {
  const { data, error } = await supabase
    .from('miembros')
    .delete()
    .eq('familia', familia)
    .eq('nombre', nombre)
    .select();

  if (error || !data || data.length === 0) {
    throw new Error('No pudimos eliminar al miembro. Inténtalo de nuevo.');
  }

  await supabase.from('tareas').delete().eq('familia', familia).eq('para', nombre);
  await supabase.from('progreso_espiritual').delete().eq('familia', familia).eq('usuario', nombre);
}

// Borra el hogar completo: fotos, deberes, agenda, progreso, miembros y el hogar
export async function borrarHogar(familia) {
  try {
    const carpeta = carpetaFamilia(familia);
    const { data: archivos } = await supabase.storage.from(BUCKET).list(carpeta, { limit: 1000 });
    if (archivos && archivos.length > 0) {
      await supabase.storage.from(BUCKET).remove(archivos.map((a) => `${carpeta}/${a.name}`));
    }
  } catch {
    /* las fotos sueltas no impiden borrar el hogar */
  }

  for (const tabla of ['tareas', 'agenda', 'progreso_espiritual', 'miembros']) {
    const { error } = await supabase.from(tabla).delete().eq('familia', familia);
    if (error) throw new Error('No pudimos borrar todo el hogar. Inténtalo de nuevo.');
  }

  const { data, error } = await supabase
    .from('familias')
    .delete()
    .eq('nombre_familia', familia)
    .select();

  if (error || !data || data.length === 0) {
    throw new Error('No pudimos borrar el hogar. Inténtalo de nuevo.');
  }
}
