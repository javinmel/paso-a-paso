// Reduce la foto antes de subirla (una foto de celular pesa varios MB)
export function comprimirImagen(archivo, maxLado = 900, calidad = 0.7) {
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
