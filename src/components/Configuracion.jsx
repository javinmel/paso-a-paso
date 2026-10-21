import React from 'react';
import './Configuracion.css';
import { esRolAdmin, etiquetaRol, nombreBonito, ordenarMiembros } from '../utils/roles';

function Configuracion({ familia, miembros = [], usuarioActual, onCambiarHogar, onCerrarSesion }) {
  const lista = ordenarMiembros(miembros || []);

  return (
    <div className="config-panel">
      <div className="config-hogar">
        <span className="config-hogar-label">Tu hogar</span>
        <h2>{nombreBonito(familia?.nombreFamilia)}</h2>
        <p>Comparte este nombre para que otros se unan</p>
      </div>

      <section className="config-seccion">
        <h4 className="config-titulo">Miembros del hogar ({lista.length})</h4>

        {lista.length === 0 ? (
          <p className="config-vacio">Aún no hay miembros en este hogar.</p>
        ) : (
          <ul className="config-miembros">
            {lista.map((m) => {
              const admin = esRolAdmin(m.rol);
              return (
                <li key={m.id || m.nombre} className={`config-miembro ${admin ? 'admin' : ''}`}>
                  <span className="config-avatar">{(m.nombre || 'U')[0].toUpperCase()}</span>
                  <div className="config-miembro-info">
                    <strong>
                      {m.nombre}
                      {m.nombre === usuarioActual && <em> (tú)</em>}
                    </strong>
                    <small>{etiquetaRol(m.rol)}</small>
                  </div>
                  {admin && <span className="config-badge admin">👑 Administrador</span>}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="config-acciones">
        <button type="button" className="config-btn cambiar" onClick={onCambiarHogar}>
          🔄 Cambiar de hogar
        </button>
        <p className="config-ayuda">Entra a otro hogar o crea uno nuevo.</p>

        <button type="button" className="config-btn salir" onClick={onCerrarSesion}>
          🚪 Cerrar sesión
        </button>
        <p className="config-ayuda">Otro miembro de la familia podrá entrar desde este mismo hogar.</p>
      </div>
    </div>
  );
}

export default Configuracion;
