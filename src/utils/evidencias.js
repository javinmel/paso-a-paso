import { supabase } from '../supabaseClient';

export const BUCKET = 'evidencias';

// Nombre de carpeta seguro para el hogar (sin tildes ni espacios)
export const carpetaFamilia = (familia = '') =>
  familia.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]/g, '_');

// Sube la foto y devuelve su enlace
export async function subirEvidencia(familia, tareaId, archivo) {
  const ruta = `${carpetaFamilia(familia)}/${tareaId}-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(ruta, archivo, { contentType: 'image/jpeg' });
  if (error) {
    throw new Error('No pudimos subir la foto. Revisa tu conexión e inténtalo de nuevo.');
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(ruta);
  return data.publicUrl;
}

// Borra la foto (si falla no pasa nada, solo queda un archivo suelto)
export async function borrarEvidencia(url) {
  if (!url) return;
  const marca = `/${BUCKET}/`;
  const i = url.indexOf(marca);
  if (i === -1) return;
  const ruta = decodeURIComponent(url.slice(i + marca.length).split('?')[0]);
  try {
    await supabase.storage.from(BUCKET).remove([ruta]);
  } catch {
    /* sin problema */
  }
}
