import React from 'react';
import { supabase } from '../supabaseClient';

function Configuracion({ familia, miembrosHogars = [], onCambiarHogar, onCerrarSesion, onVolver }) {
  const miembros = miembrosHogars || [];

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
    <div className="spiritual-panel" style={{ width: '100%', maxWidth: '650px', margin: '0 auto', boxSizing: 'border-box' }}>
      <div className="panel-title-row">
        <h3>⚙️ Configuración</h3>
        <button className="icon-btn" onClick={onVolver}>⬅️</button>
      </div>

      <div className="tab-content" style={{ textAlign: 'left', width: '100%', boxSizing: 'border-box' }}>
        {/* Cuadro principal más ancho */}
        <div style={{
          background: '#2b2d42',
          color: '#fff',
          padding: '22px',
          borderRadius: '16px',
          marginBottom: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <span style={{ fontSize: '11px', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '1px' }}>Tu hogar</span>
          <h2 style={{ fontSize: '26px', margin: '4px 0 0 0', fontWeight: 'bold' }}>{familia?.nombreFamilia}</h2>
          {/* Textos inferiores retirados por completo */}
        </div>

        <div style={{ marginBottom: '24px', width: '100%', boxSizing: 'border-box' }}>
          <h4 style={{ fontSize: '15px', color: '#423267', marginBottom: '10px' }}>
            Miembros del hogar ({miembros.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
            {miembros.map((m) => {
              const rolStr = m.rol || 'Miembro';
              const esAdmin = m.nombre === familia?.administrador || ['Papá', 'Mamá', 'admin', 'admin_secundario'].includes(rolStr);
              return (
                <div key={m.id || m.nombre} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  background: '#f8f9fc', 
                  padding: '14px 16px', 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <span style={{
                    background: esAdmin ? '#7e69f8' : '#cbd5e1',
                    color: esAdmin ? '#fff' : '#1e293b',
                    width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold', fontSize: '15px', flexShrink: 0
                  }}>
                    {m.nombre ? m.nombre[0].toUpperCase() : 'U'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#1e293b' }}>{m.nombre}</strong>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Rol: {rolStr}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', background: '#e2e8f0', padding: '4px 8px', borderRadius: '6px', color: '#475569', flexShrink: 0 }}>
                    {esAdmin ? '👑 Admin' : '🧒 Miembro'}
                  </span>
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
                      flexShrink: '0'
                    }}
                  >
                    🗑️ Borrar
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botones de acción sin textos adicionales debajo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', width: '100%', boxSizing: 'border-box' }}>
          <button type="button" className="btn-action-main" onClick={onCambiarHogar} style={{ backgroundColor: '#2563eb', color: '#fff', width: '100%', padding: '14px', boxSizing: 'border-box' }}>
            🔄 Cambiar de hogar
          </button>
          <button type="button" className="btn-action-main" onClick={onCerrarSesion} style={{ backgroundColor: '#475569', color: '#fff', width: '100%', padding: '14px', boxSizing: 'border-box' }}>
            🚪 Cerrar sesión
          </button>
          <button type="button" className="btn-action-main" onClick={borrarHogar} style={{ backgroundColor: '#dc2626', color: '#fff', width: '100%', padding: '14px', boxSizing: 'border-box' }}>
            ⚠️ Borrar Hogar por Completo
          </button>
        </div>
      </div>
    </div>
  );
}

export default Configuracion;