import { useState } from "react";
import "../Categoria/ModalAgregarCategoria.css";

interface Props {
  abierto: boolean;
  onClose: () => void;
  onGuardar: (
    nombre: string,
    descripcion: string,
    precio: number,
    setError: (mensaje: string) => void
  ) => Promise<boolean>;
}

function ModalAgregarServicio({
  abierto,
  onClose,
  onGuardar,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");

  const [error, setError] = useState("");


  if (!abierto) return null;

const guardar = async () => {

    if (!nombre.trim()) {
        setError("El nombre del servicio no puede estar vacío.");
        return;
    }

    const precioNumero = Number(precio);

    if (!precio.trim() || isNaN(precioNumero) || precioNumero <= 0) {
        setError("Ingresa un precio válido.");
        return;
    }

    const exito = await onGuardar(nombre, descripcion, precioNumero, setError);

    if (exito) {
        setNombre("");
        setDescripcion("");
        setPrecio("");
        setError("");
    }
};

function borrarError() {
    setError("");
}

function limpiar() {
    setNombre("");
    setDescripcion("");
    setPrecio("");
}

  return (
    <div className="modal-overlay">
      <div className="modal">

        <div className="modal-header">
          <h2>Agregar servicio</h2>

          <button
            className="modal-close"
            onClick={() => {
              onClose();
              borrarError();
              limpiar();
            }}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">

          <label>Nombre del servicio <span style={{ color: "red" }}>*</span></label>

          <input
            type="text"
            placeholder="Ej: Instalación de llantas"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <label>Descripción</label>

          <textarea
            placeholder="Detalles del servicio (opcional)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
          />

          <label>Precio <span style={{ color: "red" }}>*</span></label>

          <input
            type="number"
            min="0"
            step="1"
            placeholder="0.00"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />

          {error && <span className="error-text">{error}</span>}

        </div>

        <div className="modal-footer">

          <button
            className="btn-cancelar"
            onClick={() => {
              onClose();
              borrarError();
              limpiar();
            }}
          >
            Cancelar
          </button>

          <button
            className="btn-guardar"
            onClick={guardar}
          >
            Guardar
          </button>

        </div>

      </div>
    </div>
  );
}

export default ModalAgregarServicio;