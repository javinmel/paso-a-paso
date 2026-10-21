import { supabase } from '../supabaseClient';

export const BUCKET = 'evidencias';

// Reduce la foto antes de subirla para que sea ligera y rápida
export function comprimirImagen(archivo, maxLado = 800, calidad = 0.6) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();

    img.onload = () => {
      const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('No pudimos preparar la foto. Prueba con otra.'))),
        'image/jpeg',
        calidad
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No pudimos leer la foto. Prueba con otra.'));
    };

    img.src = url;
  });
}

// Sube la foto optimizada al Storage y devuelve su enlace público corto
export async function subirEvidencia(familia, tareaId, archivo) {
  const rutaLimpiada = familia.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const ruta = `${rutaLimpiada}/${tareaId}-${Date.now()}.jpg`;
  
  const { error } = await supabase.storage.from(BUCKET).upload(ruta, archivo, { contentType: 'image/jpeg', upsert: true });
  if (error) {
    throw new Error('No pudimos subir la foto. Revisa que el bucket "evidencias" exista en Supabase.');
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(ruta);
  return data.publicUrl;
}