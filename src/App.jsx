import React, { useState, useEffect } from 'react';
import './App.css';
import Onboarding from './components/Onboarding';
import Configuracion from './components/Configuracion';
import { supabase } from './supabaseClient';
import { esRolAdmin, etiquetaRol } from './utils/roles';
import { comprimirImagen, subirEvidencia } from './utils/evidencias';

const fechaHoy = () => new Date().toLocaleDateString('en-CA');
const MIN_POR_TAREA = 15;

const formatearTiempo = (min) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
};

const saludos = [
  '¡Qué alegría verte de vuelta!',
  '¿Cómo está lo más lindo de la casa?',
  '¡Hoy va a ser un gran día!',
  '¡Qué bueno que estás aquí!',
  '¡Llegó lo mejor del día!',
  '¡Mira quién llegó! Qué alegría'
];

const animos = [
  'Paso a pasito, vas muy bien 🌱',
  'Hoy brillas, y se nota ✨',
  'Lo estás haciendo genial 🌈',
  'Aquí estamos contigo 🤗',
  'Un día a la vez, tú puedes ☀️'
];

const bancoFrasesMensual = [
  { texto: "Tu forma de ser es una luz para quienes te rodean; hoy es un buen día para dejarla brillar.", ref: "Salmo 119:105" },
  { texto: "Eres valioso, fuiste creado con un propósito hermoso y único.", ref: "Salmo 139:14" },
  { texto: "No temas a los retos de hoy; tienes una fuerza interior increíble y no estás solo.", ref: "Josué 1:9" },
  { texto: "Un corazón alegre y agradecido es la mejor medicina para el alma.", ref: "Proverbios 17:22" },
  { texto: "Tu sonrisa ilumina el hogar y transmite una paz que vale oro.", ref: "Colosenses 3:15" },
  { texto: "Cada pequeño paso que das hoy te acerca con seguridad a tus metas.", ref: "Gálatas 6:9" },
  { texto: "La verdadera belleza nace de un espíritu bondadoso, tierno y paciente.", ref: "1 Pedro 3:4" },
  { texto: "Confía en tus capacidades; tienes talentos maravillosos listos para brillar.", ref: "Filipenses 4:13" },
  { texto: "La paciencia y la constancia superan cualquier obstáculo por difícil que parezca.", ref: "Eclesiastés 7:8" },
  { texto: "Recuerda que eres amado y valorado profundamente por quienes te rodean.", ref: "Juan 15:12" },
  { texto: "Un día a la vez; con calma y confianza puedes lograr cosas extraordinarias.", ref: "Mateo 6:34" },
  { texto: "Tu bondad deja huellas hermosas en el corazón de los demás.", ref: "Proverbios 3:3, 4" },
  { texto: "Disfruta de este día con entusiasmo, sabiendo que cada esfuerzo cuenta.", ref: "Colosenses 3:23" },
  { texto: "La paz mental y la tranquilidad son un tesoro que cuidas con cada buena elección.", ref: "Filipenses 4:7" },
  { texto: "Eres capaz de aprender, crecer y superar cualquier dificultad con una actitud positiva.", ref: "Romanos 12:2" },
  { texto: "Tu esfuerzo constante en el hogar y en tus deberes es muy apreciado y especial.", ref: "Proverbios 31:28" },
  { texto: "Mantén la cabeza en alto; la valentía se demuestra dando el primer paso.", ref: "Salmo 27:14" },
  { texto: "Que la alegría y la armonía guíen cada una de tus palabras y acciones de hoy.", ref: "Efesios 4:29" },
  { texto: "El amor y la comprensión hacen que el hogar sea un refugio de paz.", ref: "Salmo 133:1" },
  { texto: "Cada amanecer es una nueva oportunidad para empezar de nuevo con energía.", ref: "Lamentaciones 3:22, 23" },
  { texto: "Tus talentos y tu forma de ser hacen que este mundo sea un lugar mejor.", ref: "Mateo 5:16" },
  { texto: "La humildad y la gentileza son las joyas más brillantes que puedes llevar.", ref: "Miqueas 6:8" },
  { texto: "No te compares con nadie; tu camino es único y maravilloso.", ref: "Gálatas 6:4" },
  { texto: "El respeto y el cariño mutuo fortalecen los lazos de nuestra hermosa familia.", ref: "Colosenses 3:14" },
  { texto: "Confía en que el día de hoy traerá momentos hermosos para recordar.", ref: "Salmo 118:24" },
  { texto: "Tu dedicación en lo que haces demuestra el gran valor que hay en tu interior.", ref: "Proverbios 22:29" },
  { texto: "Una palabra amable puede cambiar por completo el día de alguien más.", ref: "Proverbios 15:1" },
  { texto: "Eres fuerte, inteligente y capaz de alcanzar lo que te propongas con buen ánimo.", ref: "Proverbios 31:25" },
  { texto: "La gratitud abre las puertas a la verdadera felicidad en el día a día.", ref: "1 Tesalonicenses 5:18" },
  { texto: "Brilla con confianza hoy y siempre, recordando lo especial que eres.", ref: "Mateo 5:14" }
];

const todosLosLibros = (
  "Génesis:50,Éxodo:40,Levítico:27,Números:36,Deuteronomio:34,Josué:24,Jueces:21,Rut:4," +
  "1 Samuel:31,2 Samuel:24,1 Reyes:22,2 Reyes:25,1 Crónicas:29,2 Crónicas:36,Esdras:10," +
  "Nehemías:13,Ester:10,Job:42,Salmos:150,Proverbios:31,Eclesiastés:12,Cantar de los Cantares:8," +
  "Isaías:66,Jeremías:52,Lamentaciones:5,Ezequiel:48,Daniel:12,Oseas:14,Joel:3,Amós:9,Abdías:1," +
  "Jonás:4,Miqueas:7,Nahum:3,Habacuc:3,Sofonías:3,Hageo:2,Zacarías:14,Malaquías:4,Mateo:28," +
  "Marcos:16,Lucas:24,Juan:21,Hechos:28,Romanos:16,1 Corintios:16,2 Corintios:13,Gálatas:6," +
  "Efesios:6,Filipenses:4,Colosenses:4,1 Tesalonicenses:5,2 Tesalonicenses:3,1 Timoteo:6," +
  "2 Timoteo:4,Tito:3,Filemón:1,Hebreos:13,Santiago:5,1 Pedro:5,2 Pedro:3,1 Juan:5,2 Juan:1," +
  "3 Juan:1,Judas:1,Apocalipsis:22"
).split(',').map((item, i) => {
  const [nombre, caps] = item.split(':');
  return { nombre, idNum: i + 1, caps: Number(caps) };
});

const recursosEmocion = {
  triste: {
    emoji: '🌧️', etiqueta: 'Triste',
    titulo: 'Está bien sentirse triste',
    mensaje: 'Tu tristeza es real y no tienes que esconderla. Cuéntale a Jehová cómo te sientes y busca un abrazo de alguien que te quiere.',
    ref: 'Salmo 34:18',
    accion: 'Respira lento tres veces y dile a alguien de casa: "Necesito un abrazo" 🤗',
    busquedaUrl: 'https://wol.jw.org/es/wol/s/r4/lp-s?q=tristeza'
  },
  miedo: {
    emoji: '😨', etiqueta: 'Con miedo',
    titulo: 'Sentir miedo es normal',
    mensaje: 'Hasta las personas más valientes sienten temor a veces. No tienes que enfrentarlo solo: Jehová y tu familia están contigo.',
    ref: 'Isaías 41:10',
    accion: 'Pon una mano en el pecho, respira lento y busca tres cosas que veas a tu alrededor 👀',
    busquedaUrl: 'https://wol.jw.org/es/wol/s/r4/lp-s?q=miedo+ansiedad'
  },
  desilusion: {
    emoji: '😞', etiqueta: 'Desilusionado',
    titulo: 'Cuando algo no salió como esperabas',
    mensaje: 'Equivocarse o que algo salga mal no define quién eres. Lo importante es que sigues intentándolo con ánimo.',
    ref: 'Salmo 55:22',
    accion: 'Piensa en algo que sí salió bien hoy, aunque sea pequeñito 🌱',
    busquedaUrl: 'https://wol.jw.org/es/wol/s/r4/lp-s?q=paciencia+animo'
  },
  enojo: {
    emoji: '⚡', etiqueta: 'Molesto',
    titulo: 'Cuando el enojo se siente muy fuerte',
    mensaje: 'Sentir enojo no es malo; lo importante es qué hacemos con él. Una respuesta tranquila ayuda a que la paz vuelva al corazón.',
    ref: 'Proverbios 15:1',
    accion: 'Antes de hablar, cuenta hasta 10 y toma un poco de agua 💧',
    busquedaUrl: 'https://wol.jw.org/es/wol/s/r4/lp-s?q=enojo+paz'
  },
  cansancio: {
    emoji: '😴', etiqueta: 'Cansado',
    titulo: 'Tu cuerpo y tu mente también necesitan descansar',
    mensaje: 'Descansar no es perder el tiempo: es cuidar el regalo de la vida. Mañana tendrás más fuerzas.',
    ref: 'Salmo 4:8',
    accion: 'Descansa 10 minutos lejos de pantallas y toma algo rico 🍃',
    busquedaUrl: 'https://wol.jw.org/es/wol/s/r4/lp-s?q=descanso'
  },
  contento: {
    emoji: '😊', etiqueta: 'Contento',
    titulo: '¡Qué bonito que te sientas así!',
    mensaje: 'La alegría crece cuando se comparte. Dale gracias a Jehová por este momento y contágiale tu sonrisa a alguien más.',
    ref: 'Salmo 100:2',
    accion: 'Cuéntale a alguien qué fue lo que te hizo feliz hoy 🎉',
    busquedaUrl: 'https://wol.jw.org/es/wol/s/r4/lp-s?q=alegria'
  }
};

function App() {
  const [familia, setFamilia] = useState(() => {
    try {
      const g = localStorage.getItem('familia_datos');
      return g ? JSON.parse(g) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState('home');
  const [activeTab, setActiveTab] = useState('texto');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [pendingTask, setPendingTask] = useState('');
  const [currentChapterKey, setCurrentChapterKey] = useState(null);

  const [pasoAudio, setPasoAudio] = useState('libros');
  const [libroElegido, setLibroElegido] = useState(null);
  const [emocionSeleccionada, setEmocionSeleccionada] = useState(null);
  const [imagenPreviewUrl, setImagenPreviewUrl] = useState(null);

  const [nombre, setNombre] = useState(() => {
    try {
      const guardado = localStorage.getItem('nombre_usuario');
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  });

  const diaHoy = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][new Date().getDay()];
  const [diaSeleccionado, setDiaSeleccionado] = useState(diaHoy === 'Domingo' ? 'Lunes' : diaHoy);

  const diaDelMes = new Date().getDate();
  const fraseActual = bancoFrasesMensual[(diaDelMes - 1) % bancoFrasesMensual.length];
  const saludoActual = saludos[diaDelMes % saludos.length];
  const animoActual = animos[diaDelMes % animos.length];

  const [capitulosCompletados, setCapitulosCompletados] = useState({});
  const [textoDiarioDias, setTextoDiarioDias] = useState([]);
  const [lecturaDias, setLecturaDias] = useState([]);

  // Carga inicial desde localStorage para evitar parpadeo en blanco al refrescar
  const [tareasDeberes, setTareasDeberes] = useState(() => {
    try {
      const t = localStorage.getItem('tareas_datos');
      return t ? JSON.parse(t) : [];
    } catch {
      return [];
    }
  });

  const [eventosAgenda, setEventosAgenda] = useState([]);
  const [miembrosHogar, setMiembrosHogar] = useState([]);

  const [nuevaTarea, setNuevaTarea] = useState('');
  const [nuevoPara, setNuevoPara] = useState('todos');
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoDia, setNuevoDia] = useState('Lunes');
  const [nuevaHora, setNuevaHora] = useState('6:00 PM');
  const [nuevoTipo, setNuevoTipo] = useState('espiritual');

  const miembroActual = miembrosHogar.find(m => m.nombre === nombre);
  const esAdministrador = !!familia && !!nombre && (
    nombre === familia.administrador || esRolAdmin(miembroActual?.rol)
  );

  const rolVisible = etiquetaRol(miembroActual?.rol ?? (esAdministrador ? familia?.rolAdmin : 'Hijo'));
  
  const listaHijos = miembrosHogar.filter(m => 
    m.nombre !== familia?.administrador && 
    !esRolAdmin(m.rol)
  ).map(m => m.nombre);

  useEffect(() => {
    if (!familia || !nombre) return;

    const cargarDatosSupabase = async () => {
      const { data: tareasData } = await supabase
        .from('tareas')
        .select('*')
        .eq('familia', familia.nombreFamilia);
      if (tareasData) {
        setTareasDeberes(tareasData);
        localStorage.setItem('tareas_datos', JSON.stringify(tareasData));
      }

      const { data: agendaData } = await supabase
        .from('agenda')
        .select('*')
        .eq('familia', familia.nombreFamilia);
      if (agendaData) setEventosAgenda(agendaData);

      const { data: miembrosData } = await supabase
        .from('miembros')
        .select('*')
        .eq('familia', familia.nombreFamilia);
      if (miembrosData) setMiembrosHogar(miembrosData);

      const { data: progData } = await supabase
        .from('progreso_espiritual')
        .select('*')
        .eq('familia', familia.nombreFamilia);

      if (progData) {
        const caps = {};
        const textDias = [];
        const lecDias = [];
        progData.forEach(item => {
          if (item.usuario !== nombre) return;
          if (item.tipo === 'biblia') {
            caps[item.clave] = true;
            if (item.fecha && !lecDias.includes(item.fecha)) lecDias.push(item.fecha);
          } else if (item.tipo === 'texto_diario') {
            if (item.fecha && !textDias.includes(item.fecha)) textDias.push(item.fecha);
          }
        });
        setCapitulosCompletados(caps);
        setTextoDiarioDias(textDias);
        setLecturaDias(lecDias);
      }
    };

    cargarDatosSupabase();

    const canal = supabase
      .channel('cambios-hogar')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tareas' }, () => cargarDatosSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agenda' }, () => cargarDatosSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'miembros' }, () => cargarDatosSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'progreso_espiritual' }, () => cargarDatosSupabase())
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [familia, nombre]);

  const manejarFamiliaCreada = (datos, usuarioNombre) => {
    setFamilia(datos);
    setNombre(usuarioNombre);
    localStorage.setItem('familia_datos', JSON.stringify(datos));
    localStorage.setItem('nombre_usuario', JSON.stringify(usuarioNombre));
  };

  const cerrarSesion = () => {
    localStorage.removeItem('nombre_usuario');
    setNombre(null);
    setCurrentView('home');
  };

  const cambiarHogar = () => {
    localStorage.removeItem('familia_datos');
    localStorage.removeItem('nombre_usuario');
    setFamilia(null);
    setNombre(null);
    setCurrentView('home');
  };

  const textoLeidoHoy = textoDiarioDias.includes(fechaHoy());
  const tareasVisibles = tareasDeberes.filter(t => (t.para || 'todos') === 'todos' || t.para === nombre);
  const totalTareas = tareasVisibles.length;
  const tareasHechas = tareasVisibles.filter(t => t.estado === 'realizado').length;
  const porcentaje = totalTareas ? Math.round((tareasHechas / totalTareas) * 100) : 0;
  const totalCapitulos = Object.keys(capitulosCompletados).length;
  const lecturaHoy = lecturaDias.includes(fechaHoy());
  const emojiEstado = totalTareas > 0 && tareasHechas === totalTareas ? '🏆' : tareasHechas > 0 ? '🔥' : '';
  const minutosGanados = tareasHechas * MIN_POR_TAREA;
  
  const tareasOrdenadas = [
    ...tareasVisibles.filter(t => t.estado === 'pendiente'),
    ...tareasVisibles.filter(t => t.estado === 'realizado')
  ];
  
  const eventosHoy = eventosAgenda.filter(ev => ev.dia === diaHoy);

  const mensajeProgreso = () => {
    if (totalTareas === 0) return 'Agrega tu primer deber para comenzar 🌱';
    if (tareasHechas === totalTareas) return '¡Lo lograste todo! Estamos muy orgullosos de ti 🎉';
    if (tareasHechas === 0) return 'Un paso a la vez, ¡tú puedes empezar!';
    return `¡Vas muy bien! Ya llevas ${tareasHechas} de ${totalTareas} 🌟`;
  };

  const progresoLibro = (nombreLibro) =>
    Object.keys(capitulosCompletados).filter(k => k.startsWith(`${nombreLibro}_`)).length;

  const seleccionarLibro = (libro) => {
    setLibroElegido(libro);
    setPasoAudio('capitulos');
  };

  const abrirCapitulo = (capNum) => {
    const urlCapitulo = `https://wol.jw.org/es/wol/b/r4/lp-s/nwtsty/${libroElegido.idNum}/${capNum}#study=discover`;
    window.open(urlCapitulo, '_blank');
    setPendingTask(`${libroElegido.nombre} capítulo ${capNum}`);
    setCurrentChapterKey(`${libroElegido.nombre}_${capNum}`);
    setIsModalOpen(true);
  };

  const abrirTextoDiario = () => {
    window.open('https://wol.jw.org/es/wol/h/r4/lp-s', '_blank');
    setPendingTask('el texto diario');
    setCurrentChapterKey(null);
    setIsModalOpen(true);
  };

  const confirmarLectura = async () => {
    const hoy = fechaHoy();
    if (currentChapterKey) {
      setCapitulosCompletados(prev => ({ ...prev, [currentChapterKey]: true }));
      await supabase.from('progreso_espiritual').insert([{
        usuario: nombre,
        tipo: 'biblia',
        clave: currentChapterKey,
        fecha: hoy,
        familia: familia.nombreFamilia
      }]);
    } else {
      setTextoDiarioDias(prev => (prev.includes(hoy) ? prev : [...prev, hoy]));
      await supabase.from('progreso_espiritual').insert([{
        usuario: nombre,
        tipo: 'texto_diario',
        clave: 'texto_diario',
        fecha: hoy,
        familia: familia.nombreFamilia
      }]);
    }
    setIsModalOpen(false);
  };

  const agregarTarea = async (e) => {
    e.preventDefault();
    if (!nuevaTarea.trim()) return;
    const origen = esAdministrador ? 'padres' : 'propio';
    const para = esAdministrador ? nuevoPara : nombre;
    
    const nuevaObj = {
      texto: nuevaTarea.trim(),
      estado: 'pendiente',
      origen,
      para,
      familia: familia.nombreFamilia
    };

    setNuevaTarea('');
    const { data } = await supabase.from('tareas').insert([nuevaObj]).select();
    if (data) {
      const actualizadas = [...tareasDeberes, data[0]];
      setTareasDeberes(actualizadas);
      localStorage.setItem('tareas_datos', JSON.stringify(actualizadas));
    }
  };

  const eliminarTarea = async (id) => {
    const actualizadas = tareasDeberes.filter(t => t.id !== id);
    setTareasDeberes(actualizadas);
    localStorage.setItem('tareas_datos', JSON.stringify(actualizadas));
    await supabase.from('tareas').delete().eq('id', id);
  };

  const agregarEvento = async (e) => {
    e.preventDefault();
    if (!nuevoTitulo.trim()) return;

    const nuevoObj = {
      titulo: nuevoTitulo.trim(),
      dia: nuevoDia,
      hora: nuevaHora,
      tipo: nuevoTipo,
      familia: familia.nombreFamilia
    };

    setNuevoTitulo('');
    setIsEventModalOpen(false);

    const { data } = await supabase.from('agenda').insert([nuevoObj]).select();
    if (data) {
      setEventosAgenda(prev => [data[0], ...prev]);
    }
  };

  const eliminarEvento = async (id) => {
    setEventosAgenda(prev => prev.filter(ev => ev.id !== id));
    await supabase.from('agenda').delete().eq('id', id);
  };

  const tableroEspiritual = (
    <div className="board-box">
      <div className="board-title">Actividades espirituales</div>
      <ul className="duties-list">
        <li className={`duty-row ${textoLeidoHoy ? 'realizado' : 'pendiente'}`}>
          <span className="duty-mark">{textoLeidoHoy ? '✓' : ''}</span>
          <span className="duty-text">📖 Texto diario</span>
          <span className={`duty-pill ${textoLeidoHoy ? 'realizado' : 'pendiente'}`}>{textoLeidoHoy ? 'Realizado' : 'Pendiente'}</span>
        </li>
        <li className={`duty-row ${lecturaHoy ? 'realizado' : 'pendiente'}`}>
          <span className="duty-mark">{lecturaHoy ? '✓' : ''}</span>
          <span className="duty-text">🌿 Lectura bíblica · {totalCapitulos} cap.</span>
          <span className={`duty-pill ${lecturaHoy ? 'realizado' : 'pendiente'}`}>{lecturaHoy ? 'Realizado' : 'Pendiente'}</span>
        </li>
      </ul>
    </div>
  );

  return (
    <div className="app-container">
      {(!familia || !nombre) && <Onboarding familiaInicial={familia} onFamiliaCreada={manejarFamiliaCreada} />}

      <header className="app-header">
        <div className="header-left">
          {currentView !== 'home' ? (
            <button className="icon-btn" onClick={() => setCurrentView('home')}>⬅️ Volver</button>
          ) : (
            <button className="icon-btn" onClick={() => setCurrentView('config')} aria-label="Configuración">⚙️</button>
          )}
          <span className="app-title">
            {currentView === 'config' && 'Configuración'}
            {currentView === 'spiritual' && 'Guía y Bienestar'}
            {currentView === 'calendar' && 'Agenda Familiar'}
            {currentView === 'tareas' && (esAdministrador ? 'Asignar Deberes' : 'Mis Deberes')}
            {currentView === 'home' && (familia ? familia.nombreFamilia : 'Paso a Paso')}
          </span>
        </div>
        <div className="header-right">
          <span>
            {nombre}
            {nombre && <b className={`rol-chip ${esAdministrador ? 'admin' : ''}`}>{rolVisible}</b>}
          </span>
        </div>
      </header>

      {currentView === 'config' && (
        <Configuracion
          familia={familia}
          miembros={miembrosHogar}
          usuarioActual={nombre}
          onCambiarHogar={cambiarHogar}
          onCerrarSesion={cerrarSesion}
        />
      )}

      {currentView === 'home' && (
        <>
          {esAdministrador ? (
            <div className="main-card-pastel">
              <div className="hero-top">
                <div className="main-card-body">
                  <h2>Panel de Control Familiar</h2>
                  <p className="main-card-subtext">Supervisión de actividades y deberes del hogar</p>
                </div>
              </div>

              <div className="board-box">
                <div className="board-title">👥 Estado de los Hijos</div>
                {listaHijos.length === 0 ? (
                  <p className="duties-empty">Aún no hay hijos conectados. Comparte el nombre del hogar ("{familia.nombreFamilia}") para que ingresen.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
                    {listaHijos.map(hijo => {
                      const tareasHijo = tareasDeberes.filter(t => t.para === hijo || t.para === 'todos');
                      const realizadasHijo = tareasHijo.filter(t => t.estado === 'realizado');
                      return (
                        <div key={hijo} style={{ background: '#f8f9fc', padding: '12px', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#423267', marginBottom: '6px' }}>
                            <span>🧒 {hijo}</span>
                            <span>{realizadasHijo.length} / {tareasHijo.length} completadas</span>
                          </div>
                          {tareasHijo.length === 0 ? (
                            <p style={{ fontSize: '12px', color: '#736298' }}>Sin deberes asignados</p>
                          ) : (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {tareasHijo.map(t => (
                                <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', background: '#fff', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                  <span>{t.texto}</span>
                                  <span style={{ color: t.estado === 'realizado' ? '#16a34a' : '#d97706', fontWeight: 'bold' }}>
                                    {t.estado === 'realizado' ? '✅ Hecho' : '⏳ Pendiente'}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {tableroEspiritual}

              {eventosHoy.length > 0 && (
                <div className="board-note">
                  {eventosHoy.map(ev => (
                    <span key={ev.id}>📅 Hoy: {ev.titulo} · {ev.hora}</span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="main-card-pastel">
                <div className="hero-top">
                  <div className="main-card-body">
                    <h2>{saludoActual}</h2>
                    <p className="main-card-subtext">{animoActual}</p>
                  </div>
                  {emojiEstado && <div className="hero-sticker">{emojiEstado}</div>}
                </div>
                
                <div className="board-box">
                  <div className="board-title">📌 Mis deberes</div>
                  {tareasOrdenadas.length === 0 ? (
                    <p className="duties-empty">Aún no tienes deberes. Agrégalos en el botón Deberes 🌱</p>
                  ) : (
                    <ul className="duties-list">
                      {tareasOrdenadas.map(t => (
                        <li key={t.id} className={`duty-row ${t.estado}`}>
                          <span className="duty-mark">{t.estado === 'realizado' ? '✓' : ''}</span>
                          <span className="duty-text">{t.origen === 'padres' ? '👨‍👩‍👧 ' : ''}{t.texto}</span>
                          <span className={`duty-pill ${t.estado}`}>{t.estado === 'realizado' ? 'Realizado' : 'Pendiente'}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="phone-time">
                  <div className="phone-time-row">
                    <span className="phone-icon">📱</span>
                    <span className="phone-time-label">Tiempo de celular ganado</span>
                    <span className="phone-time-value">{formatearTiempo(minutosGanados)}{totalTareas > 0 && tareasHechas === totalTareas ? ' 🎉' : ''}</span>
                  </div>
                  <div className="phone-progress"><div className="phone-progress-fill" style={{ width: `${porcentaje}%` }}></div></div>
                </div>

                {tableroEspiritual}

                {eventosHoy.length > 0 && (
                  <div className="board-note">
                    {eventosHoy.map(ev => (
                      <span key={ev.id}>📅 Hoy: {ev.titulo} · {ev.hora}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="inspiration-board-pastel">
                <p className="inspiration-text">{fraseActual.texto}</p>
                <span className="inspiration-ref">📖 {fraseActual.ref}</span>
              </div>
            </>
          )}

          <div className="grid-buttons">
            <button className="action-btn btn-tareas" onClick={() => setCurrentView('tareas')}>
              <span className="btn-icon">📌</span>
              <span className="btn-text">{esAdministrador ? 'Asignar Deberes' : 'Deberes y Tareas'}</span>
            </button>
            <button className="action-btn btn-spiritual" onClick={() => setCurrentView('spiritual')}>
              <span className="btn-icon">📖</span>
              <span className="btn-text">Texto Diario y Biblia</span>
            </button>
            <button className="action-btn btn-calendar" onClick={() => setCurrentView('calendar')}>
              <span className="btn-icon">📅</span>
              <span className="btn-text">Agenda Familiar</span>
            </button>
          </div>
        </>
      )}

      {/* VISTA DE DEBERES / ASIGNACIÓN */}
      {currentView === 'tareas' && (
        <div className="tasks-board-section">
          <div className="tasks-board-header">
            <h3>{esAdministrador ? '📝 Asignar Deberes a los Hijos' : '📌 Mis deberes'}</h3>
            <span className="tasks-subtitle">{esAdministrador ? 'Crea tareas y asígnalas a tus hijos' : mensajeProgreso()}</span>
          </div>

          {!esAdministrador && (
            <div className="progress-track" aria-label={`Progreso ${porcentaje}%`}>
              <div className="progress-fill" style={{ width: `${porcentaje}%` }}></div>
            </div>
          )}

          {esAdministrador ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
              {listaHijos.length === 0 ? (
                <p className="duties-empty">Aún no hay hijos registrados en este hogar.</p>
              ) : (
                listaHijos.map(hijo => {
                  const tareasHijo = tareasDeberes.filter(t => t.para === hijo || t.para === 'todos');
                  return (
                    <div key={hijo} style={{ background: '#f8f9fc', padding: '16px', borderRadius: '18px', border: '1.5px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#423267' }}>Deberes de</span>
                        <span style={{ fontSize: '12px', background: '#ede8ff', color: '#7e69f8', padding: '4px 12px', borderRadius: '999px', fontWeight: '800' }}>
                          🧒 {hijo}
                        </span>
                      </div>
                      
                      {tareasHijo.length === 0 ? (
                        <p style={{ fontSize: '12px', color: '#736298', fontStyle: 'italic', padding: '6px 0' }}>Sin deberes asignados para este hijo</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {tareasHijo.map(tarea => {
                            const esRealizado = tarea.estado === 'realizado';
                            const esSuTareaCreada = tarea.origen !== 'padres';

                            return (
                              <div 
                                key={tarea.id} 
                                className="task-item-card" 
                                style={{ 
                                  padding: '12px 14px', 
                                  borderRadius: '16px', 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  gap: '2px', 
                                  background: esRealizado ? '#f0fdf4' : '#fef2f2', 
                                  border: `1.5px solid ${esRealizado ? '#10b981' : '#ef4444'}`,
                                  position: 'relative'
                                }}
                              >
                                {(esAdministrador || esSuTareaCreada) && (
                                  <button 
                                    type="button" 
                                    className="task-delete-btn" 
                                    onClick={() => eliminarTarea(tarea.id)} 
                                    aria-label="Eliminar deber"
                                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.7)', borderRadius: '50%' }}
                                  >
                                    ✕
                                  </button>
                                )}

                                <span style={{ fontSize: '15px', fontWeight: '900', color: '#1f2937', paddingRight: '24px', lineHeight: '1.2' }}>
                                  {tarea.texto}
                                </span>

                                <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '700', marginBottom: '2px' }}>
                                  {tarea.origen === 'padres' ? 'Asignada por ti' : `Creada por ${hijo}`}
                                </span>

                                {tarea.evidencia_url && (
                                  <div 
                                    onClick={() => setImagenPreviewUrl(tarea.evidencia_url)}
                                    style={{ background: '#fff', padding: '4px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', margin: '2px 0' }}
                                  >
                                    <span style={{ fontSize: '11px', color: '#7e69f8', fontWeight: 'bold', textDecoration: 'underline' }}>
                                      📷 Ver foto de evidencia
                                    </span>
                                    <img src={tarea.evidencia_url} alt="Evidencia" style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                                  </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                                  <button 
                                    type="button"
                                    className={`task-toggle-btn ${tarea.estado}`}
                                    style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '8px' }}
                                    onClick={async () => {
                                      const nuevoEstado = esRealizado ? 'pendiente' : 'realizado';
                                      const actualizadas = tareasDeberes.map(t => t.id === tarea.id ? { ...t, estado: nuevoEstado } : t);
                                      setTareasDeberes(actualizadas);
                                      localStorage.setItem('tareas_datos', JSON.stringify(actualizadas));
                                      await supabase.from('tareas').update({ estado: nuevoEstado }).eq('id', tarea.id);
                                    }}
                                  >
                                    {esRealizado ? 'Marcar Pendiente' : 'Marcar Hecho'}
                                  </button>

                                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: esRealizado ? '#059669' : '#d97706' }}>
                                    {esRealizado ? '✅ Realizado' : '⏳ Pendiente'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="tasks-grid-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              {tareasVisibles.length === 0 ? (
                <p className="duties-empty">Aún no tienes deberes. Agrégalos o pídele a tus papás que te asignen 🌱</p>
              ) : (
                tareasVisibles.map(tarea => {
                  const esRealizado = tarea.estado === 'realizado';
                  const esSuTareaCreada = tarea.origen !== 'padres';
                  const puedeBorrar = esAdministrador || esSuTareaCreada;

                  return (
                    <div 
                      key={tarea.id} 
                      className="task-item-card" 
                      style={{ 
                        padding: '12px 14px', 
                        borderRadius: '16px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '2px', 
                        background: esRealizado ? '#f0fdf4' : '#fef2f2', 
                        border: `1.5px solid ${esRealizado ? '#10b981' : '#ef4444'}`,
                        position: 'relative'
                      }}
                    >
                      {puedeBorrar && (
                        <button 
                          type="button" 
                          className="task-delete-btn" 
                          onClick={() => eliminarTarea(tarea.id)} 
                          aria-label="Eliminar deber"
                          style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.7)', borderRadius: '50%' }}
                        >
                          ✕
                        </button>
                      )}

                      <span style={{ fontSize: '15px', fontWeight: '900', color: '#1f2937', paddingRight: '24px', lineHeight: '1.2' }}>
                        {tarea.texto}
                      </span>

                      <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '700', marginBottom: '2px' }}>
                        {tarea.origen === 'padres' ? 'Asignada por papá o mamá' : 'Creada por ti'}
                      </span>

                      {tarea.evidencia_url && (
                        <div 
                          onClick={() => setImagenPreviewUrl(tarea.evidencia_url)}
                          style={{ background: '#fff', padding: '4px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', margin: '2px 0' }}
                        >
                          <span style={{ fontSize: '11px', color: '#7e69f8', fontWeight: 'bold', textDecoration: 'underline' }}>
                            📷 Ver foto de evidencia
                          </span>
                          <img src={tarea.evidencia_url} alt="Evidencia" style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        </div>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <button 
                            type="button"
                            className={`task-toggle-btn ${tarea.estado}`}
                            style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '8px' }}
                            onClick={async () => {
                              const nuevoEstado = esRealizado ? 'pendiente' : 'realizado';
                              const actualizadas = tareasDeberes.map(t => t.id === tarea.id ? { ...t, estado: nuevoEstado } : t);
                              setTareasDeberes(actualizadas);
                              localStorage.setItem('tareas_datos', JSON.stringify(actualizadas));
                              await supabase.from('tareas').update({ estado: nuevoEstado }).eq('id', tarea.id);
                            }}
                          >
                            {esRealizado ? 'Marcar Pendiente' : 'Marcar Hecho'}
                          </button>

                          {/* Tomar foto sin icono de cámara */}
                          <label style={{ cursor: 'pointer', fontSize: '11px', background: '#ede8ff', color: '#7e69f8', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center' }}>
                            Tomar foto
                            <input 
                              type="file" 
                              accept="image/*" 
                              capture="environment"
                              style={{ display: 'none' }} 
                              onChange={async (e) => {
                                const archivo = e.target.files[0];
                                if (!archivo) return;
                                try {
                                  alert('Subiendo foto de evidencia...');
                                  const archivoComprimido = await comprimirImagen(archivo, 800, 0.6);
                                  const urlPublica = await subirEvidencia(familia.nombreFamilia, tarea.id, archivoComprimido);
                                  
                                  await supabase.from('tareas').update({ evidencia_url: urlPublica }).eq('id', tarea.id);
                                  const actualizadas = tareasDeberes.map(t => t.id === tarea.id ? { ...t, evidencia_url: urlPublica } : t);
                                  setTareasDeberes(actualizadas);
                                  localStorage.setItem('tareas_datos', JSON.stringify(actualizadas));
                                  alert('¡Foto de evidencia enviada con éxito!');
                                } catch (err) {
                                  alert(err.message || 'No se pudo subir la foto.');
                                }
                              }}
                            />
                          </label>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: esRealizado ? '#059669' : '#d97706' }}>
                            {esRealizado ? '✅ Realizado' : '⏳ Pendiente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          <form className="add-task-form" onSubmit={agregarTarea} style={{ marginTop: '16px' }}>
            <input
              type="text"
              className="input-custom"
              placeholder={esAdministrador ? "Escribe la tarea para tus hijos..." : "Nuevo deber (Ej: Ordenar mi cuarto)"}
              value={nuevaTarea}
              onChange={(e) => setNuevaTarea(e.target.value)}
            />
            <button type="submit" className="btn-add-event">+ Agregar</button>
            {esAdministrador && (
              <div className="task-options">
                <select className="select-custom" value={nuevoPara} onChange={(e) => setNuevoPara(e.target.value)}>
                  <option value="todos">Para todos los hijos</option>
                  {listaHijos.map(h => <option key={h} value={h}>Para {h}</option>)}
                </select>
              </div>
            )}
          </form>
        </div>
      )}

      {currentView === 'calendar' && (
        <div className="spiritual-panel" style={{ width: '100%', boxSizing: 'border-box' }}>
          <div className="panel-title-row">
            <h3>📅 Agenda Familiar</h3>
            {esAdministrador && (
              <button className="btn-add-event" onClick={() => setIsEventModalOpen(true)}>+ Nuevo Evento</button>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            background: '#f8fafc', 
            padding: '10px 8px', 
            borderRadius: '14px', 
            marginBottom: '16px', 
            overflowX: 'auto',
            border: '1.5px solid #cbd5e1',
            gap: '6px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((d) => {
              const activo = diaSeleccionado === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDiaSeleccionado(d)}
                  style={{
                    background: activo ? '#4f46e5' : '#ffffff',
                    color: activo ? '#ffffff' : '#475569',
                    border: activo ? 'none' : '1.5px solid #94a3b8',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '13px',
                    flex: '1',
                    textAlign: 'center',
                    boxShadow: activo ? '0 4px 10px rgba(79, 70, 229, 0.2)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.8 }}>{d.slice(0, 3)}</div>
                  <div style={{ fontSize: '14px', marginTop: '2px' }}>{d[0]}</div>
                </button>
              );
            })}
          </div>

          <div style={{ marginBottom: '14px', fontSize: '14px', color: '#4b5563', fontWeight: '500' }}>
            Mostrando agenda semanal (Día activo destacado: <strong style={{ color: '#4f46e5' }}>{diaSeleccionado}</strong>)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
            {eventosAgenda.length === 0 ? (
              <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '30px', color: '#64748b', background: '#f8fafc', borderRadius: '14px', border: '1.5px solid #cbd5e1' }}>
                No hay actividades programadas en la agenda. ¡Agrega la primera! 🌈
              </div>
            ) : (
              eventosAgenda.map((ev) => {
                const esDelDiaSeleccionado = ev.dia === diaSeleccionado;
                const esEspiritual = ev.tipo === 'espiritual';

                return (
                  <div key={ev.id} style={{
                    background: esDelDiaSeleccionado ? (esEspiritual ? '#f0fdf4' : '#eff6ff') : '#ffffff',
                    borderLeft: esDelDiaSeleccionado ? `4px solid ${esEspiritual ? '#16a34a' : '#2563eb'}` : '4px solid #64748b',
                    padding: '14px 14px',
                    borderRadius: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    border: `1.5px solid ${esDelDiaSeleccionado ? (esEspiritual ? '#86efac' : '#93c5fd') : '#cbd5e1'}`,
                    minHeight: '90px',
                    boxSizing: 'border-box',
                    opacity: esDelDiaSeleccionado ? 1 : 0.85
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{
                          fontSize: '10px',
                          background: esDelDiaSeleccionado ? (esEspiritual ? '#dcfce7' : '#dbeafe') : '#f1f5f9',
                          color: esDelDiaSeleccionado ? (esEspiritual ? '#15803d' : '#1d4ed8') : '#475569',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontWeight: '600'
                        }}>
                          {esEspiritual ? 'Espiritual' : 'Hogar'}
                        </span>
                        <span style={{ fontSize: '11px', color: esDelDiaSeleccionado ? '#374151' : '#64748b', fontWeight: 'bold' }}>{ev.dia}</span>
                      </div>
                      <strong style={{ display: 'block', fontSize: '14px', color: esDelDiaSeleccionado ? '#1f2937' : '#334155', marginBottom: '4px', lineHeight: '1.2' }}>{ev.titulo}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#4b5563' }}>🕒 {ev.hora}</span>
                      {esAdministrador && (
                        <button className="task-delete-btn" onClick={() => eliminarEvento(ev.id)} aria-label="Eliminar evento" style={{ fontSize: '12px', padding: '2px 6px' }}>✕</button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {currentView === 'spiritual' && (
        <div className="spiritual-panel">
          <div className="tabs-container">
            <button className={`tab-btn ${activeTab === 'texto' ? 'active' : ''}`} onClick={() => setActiveTab('texto')}>Texto Diario</button>
            <button className={`tab-btn ${activeTab === 'audio' ? 'active' : ''}`} onClick={() => { setActiveTab('audio'); setPasoAudio('libros'); }}>🎧 66 Libros</button>
            <button className={`tab-btn ${activeTab === 'emociones' ? 'active' : ''}`} onClick={() => setActiveTab('emociones')}>❤️ Emociones</button>
          </div>

          {activeTab === 'texto' && (
            <div className="tab-content">
              <h3>Texto Diario del Día</h3>
              <p>Empieza el día con un pensamiento que da ánimo y fortalece.</p>
              {textoLeidoHoy && <p className="done-note">✅ ¡Ya leíste el texto de hoy! Qué buen hábito.</p>}
              <button className="btn-action-main" onClick={abrirTextoDiario}>
                Abrir Texto Diario 📖
              </button>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="tab-content">
              {pasoAudio === 'libros' && (
                <>
                  <h3>📚 Los 66 Libros de la Biblia</h3>
                  <p>Toca un libro para ver sus capítulos:</p>
                  <div className="all-books-grid">
                    {todosLosLibros.map((lib) => {
                      const leidos = progresoLibro(lib.nombre);
                      return (
                        <button
                          key={lib.idNum}
                          className={`bible-book-chip ${leidos === lib.caps ? 'completed' : ''}`}
                          onClick={() => seleccionarLibro(lib)}
                        >
                          {lib.nombre}
                          {leidos > 0 && <span className="book-progress">{leidos}/{lib.caps}</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {pasoAudio === 'capitulos' && libroElegido && (
                <>
                  <div className="book-title-row">
                    <button className="icon-btn" onClick={() => setPasoAudio('libros')} aria-label="Volver a los libros">⬅️</button>
                    <h3>{libroElegido.nombre}</h3>
                  </div>
                  <p>Toca un capítulo para abrirlo. ¡Se pondrá verde al completarlo!</p>
                  <div className="chapters-grid">
                    {Array.from({ length: libroElegido.caps }, (_, i) => i + 1).map((cap) => {
                      const isCompleted = capitulosCompletados[`${libroElegido.nombre}_${cap}`];
                      return (
                        <button key={cap} className={`chapter-chip-box ${isCompleted ? 'completed' : ''}`} onClick={() => abrirCapitulo(cap)}>
                          {cap} {isCompleted && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'emociones' && (
            <div className="tab-content">
              <h3>¿Cómo te sientes hoy?</h3>
              <p>Todas las emociones son valiosas. Toca la que más se parezca a lo que sientes:</p>

              <div className="emotions-grid">
                {Object.entries(recursosEmocion).map(([clave, r]) => (
                  <button
                    key={clave}
                    className={`emotion-btn ${emocionSeleccionada === clave ? 'selected' : ''}`}
                    onClick={() => setEmocionSeleccionada(clave)}
                  >
                    <span className="emotion-emoji">{r.emoji}</span>
                    {r.etiqueta}
                  </button>
                ))}
              </div>

              {emocionSeleccionada && recursosEmocion[emocionSeleccionada] && (
                <div className="emotion-result-card">
                  <h4>{recursosEmocion[emocionSeleccionada].titulo}</h4>
                  <p>{recursosEmocion[emocionSeleccionada].mensaje}</p>
                  <span className="emotion-ref">📖 {recursosEmocion[emocionSeleccionada].ref}</span>
                  <div className="emotion-action">
                    <strong>Algo pequeño que puedes hacer:</strong>
                    <p>{recursosEmocion[emocionSeleccionada].accion}</p>
                  </div>
                  <button
                    className="btn-action-main"
                    onClick={() => window.open(recursosEmocion[emocionSeleccionada].busquedaUrl, '_blank')}
                  >
                    Ver artículos y guías de apoyo 🌐
                  </button>
                  <p className="emotion-footnote">
                    Si te sientes así por varios días, habla con tus papás o con alguien de confianza. No tienes que cargarlo solo 💛
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isEventModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Programar Actividad Familiar</h3>
            <form onSubmit={agregarEvento} className="modal-form">
              <input type="text" placeholder="Título (Ej: Estudio de Familia)" value={nuevoTitulo} onChange={(e) => setNuevoTitulo(e.target.value)} className="input-custom" required />
              <div className="modal-form-row">
                <select value={nuevoDia} onChange={(e) => setNuevoDia(e.target.value)} className="select-custom">
                  {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input type="text" placeholder="Hora (Ej: 7:00 PM)" value={nuevaHora} onChange={(e) => setNuevaHora(e.target.value)} className="input-custom" />
              </div>
              <select value={nuevoTipo} onChange={(e) => setNuevoTipo(e.target.value)} className="select-custom">
                <option value="espiritual">🟢 Espiritual</option>
                <option value="hogar">🔵 Hogar / Seglar</option>
              </select>
              <div className="modal-buttons">
                <button type="button" className="btn-cancelar" onClick={() => setIsEventModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-confirmar">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-icon">📖</div>
            <h3>¡Progreso Bíblico!</h3>
            <p>¿Ya leíste o escuchaste <strong>{pendingTask}</strong>?</p>
            <div className="modal-buttons">
              <button className="btn-cancelar" onClick={() => setIsModalOpen(false)}>Aún no</button>
              <button className="btn-confirmar" onClick={confirmarLectura}>¡Sí, listo! 🟢</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VISOR DE FOTO DE EVIDENCIA */}
      {imagenPreviewUrl && (
        <div className="modal-overlay" onClick={() => setImagenPreviewUrl(null)}>
          <div className="modal-card" style={{ maxWidth: '90vw', width: '380px', padding: '20px' }} onClick={e => e.stopPropagation()}>
            <h3>Foto de Evidencia</h3>
            <div style={{ width: '100%', maxHeight: '65vh', overflow: 'hidden', borderRadius: '12px', margin: '10px 0', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={imagenPreviewUrl} alt="Evidencia completa" style={{ width: '100%', height: 'auto', maxHeight: '60vh', objectFit: 'contain' }} />
            </div>
            <button className="btn-confirmar" onClick={() => setImagenPreviewUrl(null)} style={{ width: '100%' }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;