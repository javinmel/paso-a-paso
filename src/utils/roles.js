// Utilidades de roles y claves del hogar (sin dependencias externas)

export const ROLES_ADMIN = ['Papá', 'Mamá', 'admin', 'admin_secundario'];

// ¿Este rol es de administrador (papá o mamá)?
export const esRolAdmin = (rol) => ROLES_ADMIN.includes(rol);

// Texto corto que se muestra junto al nombre: Papá, Mamá o Hijo
export const etiquetaRol = (rol) => {
  if (rol === 'Papá') return 'Papá';
  if (rol === 'Mamá') return 'Mamá';
  if (esRolAdmin(rol)) return 'Administrador';
  return 'Hijo';
};

// "seven" -> "Seven"
export const nombreBonito = (texto = '') =>
  texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : '';

// Administradores primero y luego por orden alfabético
export const ordenarMiembros = (lista = []) =>
  [...lista].sort(
    (a, b) =>
      Number(esRolAdmin(b.rol)) - Number(esRolAdmin(a.rol)) ||
      (a.nombre || '').localeCompare(b.nombre || '')
  );

// Convierte la clave en un código (SHA-256) para no guardarla en texto plano
export async function hashClave(clave, familia, nombre) {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error('Este navegador no puede proteger la clave. Abre la app desde el enlace seguro (https).');
  }
  const datos = new TextEncoder().encode(`${familia}|${(nombre || '').trim().toLowerCase()}|${clave}`);
  const resultado = await window.crypto.subtle.digest('SHA-256', datos);
  return Array.from(new Uint8Array(resultado))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}