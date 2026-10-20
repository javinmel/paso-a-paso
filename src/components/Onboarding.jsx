import React, { useState } from 'react';
import './Onboarding.css';
import { supabase } from '../supabaseClient';

function Onboarding({ onFamiliaCreada }) {
  const [paso, setPaso] = useState('inicio'); // 'inicio', 'crear', 'unir'
  const [nombreFamilia, setNombreFamilia] = useState('');
  const [rol, setRol] = useState('Papá');
  const [nombreUsuario, setNombreUsuario] = useState('');
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

    // 1. Verificar si el hogar ya existe en Supabase
    const { data: hogarExistente } = await supabase
      .from('familias')
      .select('*')
      .eq('nombre_familia', familiaSlug)
      .single();

    if (hogarExistente) {
      setCargando(false);
      setError(`El hogar "${nombreFamilia}" ya existe y tiene un administrador. Usa la opción "Unirme a un Hogar".`);
      return;
    }

    // 2. Crear el hogar
    const { error: errFam } = await supabase.from('familias').insert([{
      nombre_familia: familiaSlug,
      administrador: nombreUsuario.trim(),
      rol_admin: rol
    }]);

    if (errFam) {
      setCargando(false);
      setError('Error al crear el hogar. Intenta de nuevo.');
      return;
    }

    // 3. Registrar al administrador como primer miembro
    await supabase.from('miembros').insert([{
      familia: familiaSlug,
      nombre: nombreUsuario.trim(),
      rol: 'admin'
    }]);

    setCargando(false);
    onFamiliaCreada({
      nombreFamilia: familiaSlug,
      administrador: nombreUsuario.trim(),
      rolAdmin: rol
    }, nombreUsuario.trim());
  };

  const manejarUnión = async (e) => {
    e.preventDefault();
    if (!nombreFamilia.trim() || !nombreUsuario.trim()) {
      setError('Por favor escribe el nombre del hogar y tu nombre.');
      return;
    }

    setCargando(true);
    setError('');

    const familiaSlug = nombreFamilia.trim().toLowerCase();
    const nombreClean = nombreUsuario.trim();

    // 1. Verificar si el hogar existe
    const { data: hogarExistente } = await supabase
      .from('familias')
      .select('*')
      .eq('nombre_familia', familiaSlug)
      .single();

    if (!hogarExistente) {
      setCargando(false);
      setError(`El hogar "${nombreFamilia}" no existe. Pídele al administrador que lo cree primero.`);
      return;
    }

    // 2. Validar si intentan usar el nombre del administrador por error
    if (nombreClean.toLowerCase() === hogarExistente.administrador.toLowerCase()) {
      setCargando(false);
      setError('Este nombre ya está registrado como Administrador de este hogar. Si eres el administrador, usa el mismo dispositivo o recupera sesión.');
      return;
    }

    // 3. Registrar al hijo/miembro en la tabla miembros (si ya existe, solo entra)
    await supabase.from('miembros').upsert([{
      familia: familiaSlug,
      nombre: nombreClean,
      rol: 'hijo'
    }], { onConflict: 'familia,nombre' });

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
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <option value="Papá">Papá 👨‍🦰</option>
              <option value="Mamá">Mamá 👩‍🦰</option>
            </select>

            <label className="field-label">Tu Nombre (Administrador)</label>
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
                {cargando ? 'Verificando...' : '¡Comenzar! ✨'}
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

            <label className="field-label">Tu Nombre (Ej: Sofía)</label>
            <input
              type="text"
              className="input-custom"
              placeholder="Ej: Sofía"
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