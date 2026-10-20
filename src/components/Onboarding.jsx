import React, { useState } from 'react';
import './Onboarding.css';
import { supabase } from '../supabaseClient';

function Onboarding({ onFamiliaCreada }) {
  const [paso, setPaso] = useState('inicio'); // 'inicio', 'crear', 'unir'
  const [nombreFamilia, setNombreFamilia] = useState('');
  const [rolAdmin, setRolAdmin] = useState('Papá');
  const [nombreUsuario, setNombreUsuario] = useState('');
  
  const [rolUnido, setRolUnido] = useState('Mamá');
  const [nombreUnido, setNombreUnido] = useState('');

  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarCreacion = async (e) => {
    e.preventDefault();
    if (!nombreFamilia.trim() || !nombreUsuario.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setCargando(true);
    setError('');

    const familiaSlug = nombreFamilia.trim().toLowerCase();
    const adminNombre = nombreUsuario.trim();

    const { data: hogarExistente } = await supabase
      .from('familias')
      .select('*')
      .eq('nombre_familia', familiaSlug)
      .maybeSingle();

    if (hogarExistente) {
      setCargando(false);
      setError(`El hogar "${nombreFamilia}" ya existe. Usa la opción "Unirme a un Hogar".`);
      return;
    }

    const { error: errFam } = await supabase.from('familias').insert([{
      nombre_familia: familiaSlug,
      administrador: adminNombre,
      rol_admin: rolAdmin
    }]);

    if (errFam) {
      setCargando(false);
      setError(`Error al crear hogar: ${errFam.message}`);
      return;
    }

    await supabase.from('miembros').upsert([{
      familia: familiaSlug,
      nombre: adminNombre,
      rol: rolAdmin
    }], { onConflict: 'familia,nombre' });

    setCargando(false);
    onFamiliaCreada({
      nombreFamilia: familiaSlug,
      administrador: adminNombre,
      rolAdmin: rolAdmin
    }, adminNombre);
  };

  const manejarUnión = async (e) => {
    e.preventDefault();
    if (!nombreFamilia.trim() || !nombreUnido.trim()) {
      setError('Por favor escribe el nombre del hogar y tu nombre.');
      return;
    }

    setCargando(true);
    setError('');

    const familiaSlug = nombreFamilia.trim().toLowerCase();
    const nombreClean = nombreUnido.trim();

    const { data: hogarExistente } = await supabase
      .from('familias')
      .select('*')
      .eq('nombre_familia', familiaSlug)
      .maybeSingle();

    if (!hogarExistente) {
      setCargando(false);
      setError(`El hogar "${nombreFamilia}" no existe. Pídele al administrador que lo cree primero.`);
      return;
    }

    const { error: errMemb } = await supabase.from('miembros').upsert([{
      familia: familiaSlug,
      nombre: nombreClean,
      rol: rolUnido
    }], { onConflict: 'familia,nombre' });

    if (errMemb) {
      setCargando(false);
      setError(`Error al unirse: ${errMemb.message}`);
      return;
    }

    setCargando(false);
    onFamiliaCreada({
      nombreFamilia: familiaSlug,
      administrador: hogarExistente.administrador,
      rolAdmin: hogarExistente.rol_admin
    }, nombreClean);
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="onboarding-icon">🏡</div>
        <h2>Paso a Paso Familiar</h2>
        <p>Organiza deberes y bienestar con principios en el hogar.</p>

        {paso === 'inicio' && (
          <div className="onboarding-actions">
            <button className="btn-primary-custom" onClick={() => setPaso('crear')}>
              Crear un Hogar 👨‍👩‍👧‍👦
            </button>
            <button className="btn-primary-custom" onClick={() => setPaso('unir')} style={{ backgroundColor: '#6366f1' }}>
              Unirme a un Hogar existente 🔑
            </button>
          </div>
        )}

        {paso === 'crear' && (
          <form onSubmit={manejarCreacion} className="onboarding-form">
            <h3>Configurar Nuevo Hogar</h3>
            
            <label className="field-label">Nombre del Hogar (Ej: seven)</label>
            <input
              type="text"
              className="input-custom"
              placeholder="Ej: seven"
              value={nombreFamilia}
              onChange={(e) => setNombreFamilia(e.target.value)}
              required
            />

            <label className="field-label">Tu Rol</label>
            <select
              className="select-custom"
              value={rolAdmin}
              onChange={(e) => setRolAdmin(e.target.value)}
            >
              <option value="Papá">Papá 👨‍🦰</option>
              <option value="Mamá">Mamá 👩‍🦰</option>
            </select>

            <label className="field-label">Tu Nombre</label>
            <input
              type="text"
              className="input-custom"
              placeholder="Ej: Luis"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              required
            />

            {error && <p className="error-text">{error}</p>}

            <div className="modal-buttons">
              <button type="button" className="btn-cancelar" onClick={() => setPaso('inicio')}>
                Volver
              </button>
              <button type="submit" className="btn-confirmar" disabled={cargando}>
                {cargando ? 'Creando...' : '¡Comenzar! ✨'}
              </button>
            </div>
          </form>
        )}

        {paso === 'unir' && (
          <form onSubmit={manejarUnión} className="onboarding-form">
            <h3>Unirse a un Hogar</h3>
            
            <label className="field-label">Nombre del Hogar (Ej: seven)</label>
            <input
              type="text"
              className="input-custom"
              placeholder="Ej: seven"
              value={nombreFamilia}
              onChange={(e) => setNombreFamilia(e.target.value)}
              required
            />

            <label className="field-label">¿Cuál es tu rol en el hogar?</label>
            <select
              className="select-custom"
              value={rolUnido}
              onChange={(e) => setRolUnido(e.target.value)}
            >
              <option value="Mamá">Mamá 👩‍🦰</option>
              <option value="Papá">Papá 👨‍🦰</option>
              <option value="Hijo">Hijo / Hija 🧒</option>
            </select>

            <label className="field-label">Tu Nombre (Ej: Sofía o Ana)</label>
            <input
              type="text"
              className="input-custom"
              placeholder="Ej: Sofía"
              value={nombreUnido}
              onChange={(e) => setNombreUnido(e.target.value)}
              required
            />

            {error && <p className="error-text">{error}</p>}

            <div className="modal-buttons">
              <button type="button" className="btn-cancelar" onClick={() => setPaso('inicio')}>
                Volver
              </button>
              <button type="submit" className="btn-confirmar" disabled={cargando}>
                {cargando ? 'Conectando...' : 'Entrar al Hogar 🚀'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Onboarding;