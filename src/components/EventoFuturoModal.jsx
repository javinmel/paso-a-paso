import React, { useState } from 'react';

const hoyISO = () => new Date().toLocaleDateString('en-CA');

function EventoFuturoModal({ onGuardar, onCerrar }) {
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('6:00 PM');
  const [tipo, setTipo] = useState('espiritual');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const guardar = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('Escribe el nombre del evento.');
      return;
    }
    if (!fecha) {
      setError('Elige la fecha del evento.');
      return;
    }
    if (fecha < hoyISO()) {
      setError('Esa fecha ya pasó. Elige una de hoy en adelante.');
      return;
    }

    setGuardando(true);
    setError('');
    try {
      await onGuardar({ titulo: titulo.trim(), fecha, hora, tipo });
    } catch (err) {
      setError(err.message || 'No pudimos guardar el evento. Inténtalo de nuevo.');
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-icon">📆</div>
        <h3>Evento futuro</h3>
        <form onSubmit={guardar} className="modal-form">
          <input
            type="text"
            className="input-custom"
            placeholder="Título (Ej: Asamblea)"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <input
            type="date"
            className="input-custom"
            min={hoyISO()}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
          <input
            type="text"
            className="input-custom"
            placeholder="Hora (Ej: 7:00 PM)"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
          />
          <select className="select-custom" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="espiritual">🟢 Espiritual</option>
            <option value="hogar">🔵 Hogar / Seglar</option>
          </select>

          {error && <p className="error-text">{error}</p>}

          <div className="modal-buttons">
            <button type="button" className="btn-cancelar" onClick={onCerrar} disabled={guardando}>Cancelar</button>
            <button type="submit" className="btn-confirmar" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventoFuturoModal;
