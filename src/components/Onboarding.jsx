import React, { useState, useEffect } from 'react';
import './Onboarding.css';
import { supabase } from '../supabaseClient';
import { esRolAdmin, etiquetaRol, nombreBonito, ordenarMiembros, hashClave } from '../utils/roles';

const CLAVE_MINIMA = 4;

function Onboarding({ onFamiliaCreada, familiaInicial = null }) {
  // inicio | crear | hogar | miembros | clave | nuevo
  const [paso, setPaso] = useState('inicio');
  const [nombreFamilia, setNombreFamilia] = useState('');
  const [hogar, setHogar] = useState(null);
  const [miembros, setMiembros] = useState([]);
  const [miembroElegido, setMiembroElegido] = useState(null);

  // Crear hogar
  const [rolAdmin, setRolAdmin] = useState('Papá');
  const [nombreUsuario, setNombreUsuario] = useState('');

  // Miembro nuevo en un hogar que ya existe
  const [rolUnido, setRolUnido] = useState('Hijo');
  const [nombreUnido, setNombreUnido] = useState('');
  const [claveAdmin, setClaveAdmin] = useState('');

  // Claves
  const [clave, setClave] = useState('');
  const [claveConfirm, setClaveConfirm] = useState('');

  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const datosHogar = (h) => ({
    nombreFamilia: h.nombre_familia,
    administrador: h.administrador,
    rolAdmin: h.rol_admin
  });

  const limpiarClaves = () => {
    setClave('');
    setClaveConfirm('');
    setClaveAdmin('');
  };

  const irA = (nuevoPaso) => {
    setError('');
    limpiarClaves();
    setPaso(nuevoPaso);
  };

  const entrar = (nombre, h = hogar) => onFamiliaCreada(datosHogar(h), nombre);

  // Busca el hogar y sus miembros
  const cargarHogar = async (slug) => {
    setCargando(true);
    setError('');

    const { data: h } = await supabase
      .from('familias')
      .select('*')
      .eq('nombre_familia', slug)
      .maybeSingle();

    if (!h) {
      setCargando(false);
      setError(`No encontramos el hogar "${slug}". Revisa cómo está escrito o pídele a papá o mamá que lo cree.`);
      return false;
    }

    const { data: m } = await supabase.from('miembros').select('*').eq('familia', slug);

    setHogar(h);
    setMiembros(ordenarMiembros(m || []));
    setCargando(false);
    setPaso('miembros');
    return true;
  };

  // Al cerrar sesión se vuelve directo a la lista de miembros del mismo hogar
  useEffect(() => {
    if (!familiaInicial) return;
    setNombreFamilia(familiaInicial.nombreFamilia);
    cargarHogar(familiaInicial.nombreFamilia).then((ok) => {
      if (!ok) setPaso('hogar');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buscarHogar = async (e) => {
    e.preventDefault();
    if (!nombreFamilia.trim()) {
      setError('Escribe el nombre del hogar.');
      return;
    }
    await cargarHogar(nombreFamilia.trim().toLowerCase());
  };

  const elegirMiembro = (m) => {
    setError('');
    limpiarClaves();
    if (esRolAdmin(m.rol)) {
      setMiembroElegido(m);
      setPaso('clave');
    } else {
      entrar(m.nombre); // los hijos entran sin clave
    }
  };

  const confirmarClave = async (e) => {
    e.preventDefault();
    if (!miembroElegido || !hogar) return;

    const slug = hogar.nombre_familia;
    const primeraVez = !miembroElegido.clave_hash;
    setError('');
    setCargando(true);

    try {
      if (primeraVez) {
        if (clave.length < CLAVE_MINIMA) {
          setError(`La clave debe tener al menos ${CLAVE_MINIMA} caracteres.`);
          return;
        }
        if (clave !== claveConfirm) {
          setError('Las dos claves no son iguales.');
          return;
        }
        const codigo = await hashClave(clave, slug, miembroElegido.nombre);
        const { data, error: errUp } = await supabase
          .from('miembros')
          .update({ clave_hash: codigo })
          .eq('familia', slug)
          .eq('nombre', miembroElegido.nombre)
          .select();
        if (errUp || !data || data.length === 0) {
          setError('No pudimos guardar la clave. Inténtalo de nuevo.');
          return;
        }
      } else {
        const codigo = await hashClave(clave, slug, miembroElegido.nombre);
        if (codigo !== miembroElegido.clave_hash) {
          setError('Clave incorrecta. Inténtalo de nuevo.');
          return;
        }
      }
      entrar(miembroElegido.nombre);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const manejarCreacion = async (e) => {
    e.preventDefault();
    if (!nombreFamilia.trim() || !nombreUsuario.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }
    if (clave.length < CLAVE_MINIMA) {
      setError(`La clave debe tener al menos ${CLAVE_MINIMA} caracteres.`);
      return;
    }
    if (clave !== claveConfirm) {
      setError('Las dos claves no son iguales.');
      return;
    }

    setCargando(true);
    setError('');

    const familiaSlug = nombreFamilia.trim().toLowerCase();
    const adminNombre = nombreUsuario.trim();

    try {
      const { data: hogarExistente } = await supabase
        .from('familias')
        .select('*')
        .eq('nombre_familia', familiaSlug)
        .maybeSingle();

      if (hogarExistente) {
        setError(`El hogar "${nombreFamilia}" ya existe. Usa la opción "Entrar a mi hogar".`);
        return;
      }

      const codigo = await hashClave(clave, familiaSlug, adminNombre);

      const { error: errFam } = await supabase.from('familias').insert([{
        nombre_familia: familiaSlug,
        administrador: adminNombre,
        rol_admin: rolAdmin
      }]);

      if (errFam) {
        setError(`Error al crear el hogar: ${errFam.message}`);
        return;
      }

      const { error: errMiembro } = await supabase.from('miembros').upsert([{
        familia: familiaSlug,
        nombre: adminNombre,
        rol: rolAdmin,
        clave_hash: codigo
      }], { onConflict: 'familia,nombre' });

      if (errMiembro) {
        setError(`El hogar se creó, pero no pudimos guardar tu clave: ${errMiembro.message}`);
        return;
      }

      onFamiliaCreada({
        nombreFamilia: familiaSlug,
        administrador: adminNombre,
        rolAdmin: rolAdmin
      }, adminNombre);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const hayAdminConClave = miembros.some((m) => esRolAdmin(m.rol) && m.clave_hash);

  const manejarNuevo = async (e) => {
    e.preventDefault();
    const nombreClean = nombreUnido.trim();
    if (!nombreClean) {
      setError('Escribe tu nombre.');
      return;
    }
    if (miembros.some((m) => (m.nombre || '').toLowerCase() === nombreClean.toLowerCase())) {
      setError('Ese nombre ya está en el hogar. Búscalo en la lista y tócalo para entrar.');
      return;
    }

    const slug = hogar.nombre_familia;
    const esPadre = esRolAdmin(rolUnido);

    setCargando(true);
    setError('');

    try {
      let codigo = null;

      if (esPadre) {
        if (clave.length < CLAVE_MINIMA) {
          setError(`La clave debe tener al menos ${CLAVE_MINIMA} caracteres.`);
          return;
        }
        if (clave !== claveConfirm) {
          setError('Las dos claves no son iguales.');
          return;
        }

        // Para ser papá o mamá hace falta la clave de un administrador del hogar
        const admins = miembros.filter((m) => esRolAdmin(m.rol) && m.clave_hash);
        if (admins.length > 0) {
          const codigos = await Promise.all(admins.map((a) => hashClave(claveAdmin, slug, a.nombre)));
          const autorizado = admins.some((a, i) => codigos[i] === a.clave_hash);
          if (!autorizado) {
            setError('La clave del administrador no es correcta. Pídesela a papá o mamá.');
            return;
          }
        }
        codigo = await hashClave(clave, slug, nombreClean);
      }

      const nuevo = { familia: slug, nombre: nombreClean, rol: rolUnido };
      if (codigo) nuevo.clave_hash = codigo;

      const { error: errMemb } = await supabase.from('miembros').insert([nuevo]);
      if (errMemb) {
        setError(`No pudimos unirte al hogar: ${errMemb.message}`);
        return;
      }

      entrar(nombreClean);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const primeraVezClave = miembroElegido && !miembroElegido.clave_hash;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="onboarding-icon">🏡</div>
        <h2>Paso a Paso Familiar</h2>
        {paso === 'inicio' && <p>Organiza deberes y bienestar con principios en el hogar.</p>}

        {paso === 'inicio' && (
          <div className="onboarding-actions">
            <button className="btn-primary-custom" onClick={() => irA('crear')}>
              Crear un Hogar 👨‍👩‍👧‍👦
            </button>
            <button className="btn-primary-custom" onClick={() => irA('hogar')} style={{ backgroundColor: '#6366f1' }}>
              Entrar a mi Hogar 🔑
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
            <select className="select-custom" value={rolAdmin} onChange={(e) => setRolAdmin(e.target.value)}>
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

            <label className="field-label">Crea tu clave de administrador</label>
            <input
              type="password"
              className="input-custom"
              placeholder="Mínimo 4 caracteres"
              autoComplete="new-password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              required
            />
            <input
              type="password"
              className="input-custom"
              placeholder="Repite tu clave"
              autoComplete="new-password"
              value={claveConfirm}
              onChange={(e) => setClaveConfirm(e.target.value)}
              required
            />
            <p className="onboarding-hint">Esta clave protege tu cuenta. Tus hijos entran sin clave.</p>

            {error && <p className="error-text">{error}</p>}

            <div className="modal-buttons">
              <button type="button" className="btn-cancelar" onClick={() => irA('inicio')}>
                Volver
              </button>
              <button type="submit" className="btn-confirmar" disabled={cargando}>
                {cargando ? 'Creando...' : '¡Comenzar! ✨'}
              </button>
            </div>
          </form>
        )}

        {paso === 'hogar' && (
          <form onSubmit={buscarHogar} className="onboarding-form">
            <h3>Entrar a mi Hogar</h3>

            <label className="field-label">Nombre del Hogar (Ej: seven)</label>
            <input
              type="text"
              className="input-custom"
              placeholder="Ej: seven"
              value={nombreFamilia}
              onChange={(e) => setNombreFamilia(e.target.value)}
              autoFocus
              required
            />

            {error && <p className="error-text">{error}</p>}

            <div className="modal-buttons">
              <button type="button" className="btn-cancelar" onClick={() => irA('inicio')}>
                Volver
              </button>
              <button type="submit" className="btn-confirmar" disabled={cargando}>
                {cargando ? 'Buscando...' : 'Ver miembros 👀'}
              </button>
            </div>
          </form>
        )}

        {paso === 'miembros' && hogar && (
          <div className="onboarding-form">
            <h3>¿Quién eres en {nombreBonito(hogar.nombre_familia)}?</h3>
            <p className="onboarding-hint">Toca tu nombre para entrar. Papá y mamá necesitan su clave.</p>

            {miembros.length === 0 ? (
              <p className="onboarding-hint">Aún no hay miembros. ¡Sé el primero!</p>
            ) : (
              <div className="miembros-lista">
                {miembros.map((m) => {
                  const admin = esRolAdmin(m.rol);
                  return (
                    <button
                      key={m.id || m.nombre}
                      type="button"
                      className={`miembro-card ${admin ? 'admin' : ''}`}
                      onClick={() => elegirMiembro(m)}
                    >
                      <span className="miembro-avatar">{(m.nombre || 'U')[0].toUpperCase()}</span>
                      <span className="miembro-info">
                        <strong>{m.nombre}</strong>
                        <small>{etiquetaRol(m.rol)}{admin ? ' · Administrador' : ''}</small>
                      </span>
                      <span className="miembro-flecha">{admin ? '🔒' : '›'}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {error && <p className="error-text">{error}</p>}

            <button type="button" className="onboarding-link" onClick={() => irA('nuevo')}>
              ➕ Soy nuevo en este hogar
            </button>

            <div className="modal-buttons">
              <button type="button" className="btn-cancelar" onClick={() => irA('inicio')}>
                Cambiar de hogar
              </button>
            </div>
          </div>
        )}

        {paso === 'clave' && miembroElegido && (
          <form onSubmit={confirmarClave} className="onboarding-form">
            <div className="clave-avatar">{(miembroElegido.nombre || 'U')[0].toUpperCase()}</div>
            <h3>Hola, {miembroElegido.nombre}</h3>
            <p className="onboarding-hint">
              {primeraVezClave
                ? 'Es tu primera vez como administrador. Crea una clave para proteger tu cuenta.'
                : 'Escribe tu clave para entrar.'}
            </p>

            <input
              type="password"
              className="input-custom"
              placeholder={primeraVezClave ? 'Crea tu clave (mínimo 4)' : 'Tu clave'}
              autoComplete={primeraVezClave ? 'new-password' : 'current-password'}
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              autoFocus
              required
            />
            {primeraVezClave && (
              <input
                type="password"
                className="input-custom"
                placeholder="Repite tu clave"
                autoComplete="new-password"
                value={claveConfirm}
                onChange={(e) => setClaveConfirm(e.target.value)}
                required
              />
            )}

            {error && <p className="error-text">{error}</p>}

            <div className="modal-buttons">
              <button type="button" className="btn-cancelar" onClick={() => irA('miembros')}>
                Volver
              </button>
              <button type="submit" className="btn-confirmar" disabled={cargando}>
                {cargando ? 'Entrando...' : 'Entrar 🚀'}
              </button>
            </div>
          </form>
        )}

        {paso === 'nuevo' && hogar && (
          <form onSubmit={manejarNuevo} className="onboarding-form">
            <h3>Unirme a {nombreBonito(hogar.nombre_familia)}</h3>

            <label className="field-label">¿Cuál es tu rol en el hogar?</label>
            <select className="select-custom" value={rolUnido} onChange={(e) => setRolUnido(e.target.value)}>
              <option value="Hijo">Hijo / Hija 🧒</option>
              <option value="Mamá">Mamá 👩‍🦰</option>
              <option value="Papá">Papá 👨‍🦰</option>
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

            {esRolAdmin(rolUnido) && (
              <>
                <label className="field-label">Crea tu clave de administrador</label>
                <input
                  type="password"
                  className="input-custom"
                  placeholder="Mínimo 4 caracteres"
                  autoComplete="new-password"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  required
                />
                <input
                  type="password"
                  className="input-custom"
                  placeholder="Repite tu clave"
                  autoComplete="new-password"
                  value={claveConfirm}
                  onChange={(e) => setClaveConfirm(e.target.value)}
                  required
                />
                {hayAdminConClave && (
                  <>
                    <label className="field-label">Clave de un administrador del hogar</label>
                    <input
                      type="password"
                      className="input-custom"
                      placeholder="La clave de papá o mamá"
                      autoComplete="off"
                      value={claveAdmin}
                      onChange={(e) => setClaveAdmin(e.target.value)}
                      required
                    />
                    <p className="onboarding-hint">Así confirmamos que puedes ser administrador.</p>
                  </>
                )}
              </>
            )}

            {error && <p className="error-text">{error}</p>}

            <div className="modal-buttons">
              <button type="button" className="btn-cancelar" onClick={() => irA('miembros')}>
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
