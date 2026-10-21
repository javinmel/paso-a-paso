import React, { useRef, useState, useEffect } from 'react';
import './ModalCompletar.css';
import { comprimirImagen } from '../utils/imagen';

function ModalCompletar({ tarea, esAdministrador, onConfirmar, onCerrar }) {
  const inputRef = useRef(null);
  const [foto, setFoto] = useState(null);
  const [vista, setVista] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  // Libera la vista previa al cambiar de foto o al cerrar
  useEffect(() => () => { if (vista) URL.revokeObjectURL(vista); }, [vista]);

  const elegirFoto = async (e) => {
    const archivo = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!archivo) return;
    setError('');
    try {
      const blob = await comprimirImagen(archivo);
      setFoto(blob);
      setVista(URL.createObjectURL(blob));
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmar = async () => {
    setEnviando(true);
    setError('');
    try {
      await onConfirmar(foto);
    } catch (err) {
      setError(err.message || 'No pudimos guardar el cambio. Inténtalo de nuevo.');
      setEnviando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-icon">{vista ? '📷' : '✔️'}</div>
        <h3>Completar deber</h3>
        <p><strong>{tarea.texto}</strong></p>
        <p>
          {esAdministrador
            ? 'Puedes agregar una foto como evidencia.'
            : 'Si quieres, toma una foto para que papá o mamá vean que lo hiciste.'}
        </p>

        {vista && <img className="foto-preview" src={vista} alt="Foto del deber" />}

        <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={elegirFoto} hidden />
        <button type="button" className="btn-foto" onClick={() => inputRef.current && inputRef.current.click()} disabled={enviando}>
          {vista ? '🔄 Cambiar foto' : '📷 Tomar foto'}
        </button>

        {error && <p className="error-text">{error}</p>}

        <div className="modal-buttons">
          <button type="button" className="btn-cancelar" onClick={onCerrar} disabled={enviando}>Cancelar</button>
          <button type="button" className="btn-confirmar" onClick={confirmar} disabled={enviando}>
            {enviando ? 'Guardando...' : vista ? 'Completar con foto' : 'Completar sin foto'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalCompletar;
