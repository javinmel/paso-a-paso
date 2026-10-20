import React from 'react';

function Configuracion({ familia, miembrosHogars, onCambiarHogar, onCerrarSesion, onVolver }) {
  return (
    <div className="spiritual-panel">
      <div className="panel-title-row">
        <h3>⚙️ Configuración</h3>
        <button className="icon-btn" onClick={onVolver}>⬅️</button>
      </div>

      <div className="tab-content" style={{ textAlign: 'left' }}>
        <div style={{
          background: '#2b2d42',
          color: '#fff',
          padding: '18px',
          borderRadius: '16px',
          marginBottom: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <span style={{ fontSize: '11px', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '1px' }}>Tu hogar</span>
          <h2 style={{ fontSize: '24px', margin: '4px 0 6px 0', fontWeight: 'bold' }}>{familia?.nombreFamilia}</h2>
          <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0 }}>Comparte este nombre para que otros se unan</p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '15px', color: '#423267', marginBottom: '10px' }}>
            Miembros del hogar ({miembrosHogars.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {miembrosHogars.map((m) => {
              const rolStr = m.rol || 'Miembro';
              const esAdmin = m.nombre === familia?.administrador || ['Papá', 'Mamá'].includes(rolStr);
              return (
                <div key={m.id || m.nombre} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8f9fc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{
                    background: esAdmin ? '#7e69f8' : '#cbd5e1',
                    color: esAdmin ? '#fff' : '#1e293b',
                    width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold', fontSize: '15px'
                  }}>
                    {m.nombre[0].toUpperCase()}
                  </span>
                  <div style={{ flex: 1 }}>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#1e293b' }}>{m.nombre}</strong>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Rol: {rolStr}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', background: '#e2e8f0', padding: '3px 8px', borderRadius: '6px', color: '#475569' }}>
                    {esAdmin ? '👑 Admin' : '🧒 Miembro'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          <button type="button" className="btn-action-main" onClick={onCambiarHogar} style={{ backgroundColor: '#2563eb', color: '#fff' }}>
            🔄 Cambiar de hogar
          </button>
          <button type="button" className="btn-action-main" onClick={onCerrarSesion} style={{ backgroundColor: '#dc2626', color: '#fff' }}>
            🚪 Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export default Configuracion;