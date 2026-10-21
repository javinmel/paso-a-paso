import React from 'react';
import './Configuracion.css';
import { esRolAdmin, etiquetaRol, nombreBonito, ordenarMiembros } from '../utils/roles';
import { supabase } from '../supabaseClient';

function Configuracion({ familia, miembros = [], miembrosHogars = [], usuarioActual, nombre, onCambiarHogar, onCerrarSesion }) {
  const listaMiembros = miembros.length > 0 ? miembros : miembrosHogars;
  const usuarioActivo = usuarioActual || nombre;
  const lista = ordenarMiembros(listaMiembros || []);

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
    <div className="config-panel" style={{ width: '100%', maxWidth: '100%', margin: '0', boxSizing: 'border-box', padding: '0 4px' }}>
      <div className="config-hogar" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', marginBottom: '20px', marginLeft: '0', marginRight: '0' }}>
        <span className="config-hogar-label">Tu hogar</span>
        <h2>{nombreBonito(familia?.nombreFamilia)}</h2>
        <p>Comparte este nombre para que otros se unan</p>
      </div>

      <section className="config-seccion" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '0' }}>
        <h4 className="config-titulo" style={{ marginBottom: '12px', paddingLeft: '4px' }}>Miembros del hogar ({lista.length})</h4>

        {lista.length === 0 ? (
          <p className="config-vacio">Aún no hay miembros en este hogar.</p>
        ) : (
          <ul className="config-miembros" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none', padding: 0, margin: 0 }}>
            {lista.map((m) => {
              const admin = esRolAdmin(m.rol);
              return (
                <li key={m.id || m.nombre} className={`config-miembro ${admin ? 'admin' : ''}`} style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#f8f9fc', borderRadius: '12px', border: '1px solid #e2e8f0', gap: '10px', margin: '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <span className="config-avatar" style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: admin ? '#7e69f8' : '#cbd5e1', color: admin ? '#fff' : '#1e293b', borderRadius: '50%', fontWeight: 'bold', flexShrink: 0 }}>
                      {(m.nombre || 'U')[0].toUpperCase()}
                    </span>
                    <div className="config-miembro-info" style={{ minWidth: 0, flex: 1 }}>
                      <strong style={{ display: 'block', fontSize: '15px', color: '#1e293b', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                        {m.nombre}
                        {m.nombre === usuarioActivo && <em> (tú)</em>}
                      </strong>
                      <small style={{ color: '#64748b', fontSize: '12px' }}>{etiquetaRol(m.rol)}</small>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {admin && <span className="config-badge admin" style={{ fontSize: '11px', background: '#e2e8f0', padding: '4px 8px', borderRadius: '6px', color: '#475569', whiteSpace: 'nowrap' }}>Administrador</span>}
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
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Borrar
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="config-acciones" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px', padding: '0' }}>
        <button type="button" className="config-btn cambiar" onClick={onCambiarHogar} style={{ width: '100%', boxSizing: 'border-box', padding: '14px', margin: '0' }}>
          Cambiar de hogar
        </button>

        <button type="button" className="config-btn salir" onClick={onCerrarSesion} style={{ width: '100%', boxSizing: 'border-box', padding: '14px', margin: '0' }}>
          Cerrar sesión
        </button>

        {esAdminActual && (
          <button 
            type="button" 
            className="config-btn" 
            onClick={borrarHogar} 
            style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', margin: '0' }}
          >
            Borrar Hogar por Completo
          </button>
        )}
      </div>
    </div>
  );
}

export default Configuracion;