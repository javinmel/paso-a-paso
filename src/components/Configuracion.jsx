import React from 'react';
import './Configuracion.css';
import { esRolAdmin, etiquetaRol, nombreBonito, ordenarMiembros } from '../utils/roles';
import { supabase } from '../supabaseClient';

function Configuracion({ familia, miembros = [], miembrosHogars = [], usuarioActual, nombre, onCambiarHogar, onCerrarSesion, onVolver }) {
  const listaMiembros = miembros.length > 0 ? miembros : miembrosHogars;
  const usuarioActivo = usuarioActual || nombre;
  const lista = ordenarMiembros(listaMiembros || []);

  // Verificar si el usuario actual es administrador
  const miembroActual = listaMiembros.find(m => m.nombre === usuarioActivo);
  const esAdminActual = esRolAdmin(miembroActual?.rol) || usuarioActivo === familia?.administrador || ['Papá', 'Mamá'].includes(usuarioActivo);

  const borrarMiembro = async (nombreMiembro) => {
    if (!window.confirm(`¿Estás seguro de eliminar a ${nombreMiembro} del hogar?`)) return;
    const { error } = await supabase
      .from('miembros')
      .delete()
      .eq('familia', familia.nombreFamilia)
      .eq('nombre', nombreMiembro);
    
    if (error) {
      alert('Error al borrar miembro: ' + error.message);
    } else {
      window.location.reload();
    }
  };

  const borrarHogar = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar por completo el hogar "${familia.nombreFamilia}" y todos sus datos?`)) return;
    
    await supabase.from('tareas').delete().eq('familia', familia.nombreFamilia);
    await supabase.from('agenda').delete().eq('familia', familia.nombreFamilia);
    await supabase.from('progreso_espiritual').delete().eq('familia', familia.nombreFamilia);
    await supabase.from('miembros').delete().eq('familia', familia.nombreFamilia);
    const { error } = await supabase.from('familias').delete().eq('nombre_familia', familia.nombreFamilia);

    if (error) {
      alert('Error al borrar hogar: ' + error.message);
    } else {
      localStorage.removeItem('familia_datos');
      localStorage.removeItem('nombre_usuario');
      window.location.reload();
    }
  };

  return (
    <div className="config-panel" style={{ width: '100%', maxWidth: '650px', margin: '0 auto', boxSizing: 'border-box' }}>
      <div className="config-hogar" style={{ width: '100%', boxSizing: 'border-box' }}>
        <span className="config-hogar-label">Tu hogar</span>
        <h2>{nombreBonito(familia?.nombreFamilia)}</h2>
        <p>Comparte este nombre para que otros se unan</p>
      </div>

      <section className="config-seccion" style={{ width: '100%', boxSizing: 'border-box' }}>
        <h4 className="config-titulo">Miembros del hogar ({lista.length})</h4>

        {lista.length === 0 ? (
          <p className="config-vacio">Aún no hay miembros en este hogar.</p>
        ) : (
          <ul className="config-miembros" style={{ width: '100%', boxSizing: 'border-box' }}>
            {lista.map((m) => {
              const admin = esRolAdmin(m.rol);
              return (
                <li key={m.id || m.nombre} className={`config-miembro ${admin ? 'admin' : ''}`} style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <span className="config-avatar">{(m.nombre || 'U')[0].toUpperCase()}</span>
                    <div className="config-miembro-info">
                      <strong>
                        {m.nombre}
                        {m.nombre === usuarioActivo && <em> (tú)</em>}
                      </strong>
                      <small>{etiquetaRol(m.rol)}</small>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {admin && <span className="config-badge admin">👑 Administrador</span>}
                    {esAdminActual && (
                      <button 
                        type="button" 
                        onClick={() => borrarMiembro(m.nombre)}
                        style={{
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        🗑️ Borrar
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="config-acciones" style={{ width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button type="button" className="config-btn cambiar" onClick={onCambiarHogar} style={{ width: '100%', boxSizing: 'border-box' }}>
          🔄 Cambiar de hogar
        </button>

        <button type="button" className="config-btn salir" onClick={onCerrarSesion} style={{ width: '100%', boxSizing: 'border-box' }}>
          🚪 Cerrar sesión
        </button>

        {esAdminActual && (
          <button 
            type="button" 
            className="config-btn" 
            onClick={borrarHogar} 
            style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            ⚠️ Borrar Hogar por Completo
          </button>
        )}
      </div>
    </div>
  );
}

export default Configuracion;