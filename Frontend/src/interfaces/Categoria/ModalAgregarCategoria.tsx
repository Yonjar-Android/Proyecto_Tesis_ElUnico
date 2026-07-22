import { useState } from "react";
import "./ModalAgregarCategoria.css";

interface Props {
  abierto: boolean;
  onClose: () => void;
  onGuardar: (
    nombre: string,
    setError: (mensaje: string) => void
  ) => Promise<boolean>;
}

function ModalAgregarCategoria({
  abierto,
  onClose,
  onGuardar,
}: Props) {
  const [nombre, setNombre] = useState("");

  const [error, setError] = useState("");


  if (!abierto) return null;

const guardar = async () => {

    if (!nombre.trim()) {
        setError("El nombre de la categoría no puede estar vacío.");
        return;
    }

    const exito = await onGuardar(nombre, setError);

    if (exito) {
        setNombre("");
        setError("");
    }
};

function borrarError() {
    setError("");
}

  return (
    <div className="modal-overlay">
      <div className="modal">

        <div className="modal-header">
          <h2>Agregar categoría</h2>

          <button
            className="modal-close"
            onClick={() => {
              onClose();
              borrarError();
            }}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">

          <label>Nombre de categoría <span style={{ color: "red" }}>*</span></label>

          <input
            type="text"
            placeholder="Ej: Aceites"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          {error && <span className="error-text">{error}</span>}

        </div>

        <div className="modal-footer">

          <button
            className="btn-cancelar"
            onClick={() => {
              onClose();
              borrarError();
              setNombre("");
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

export default ModalAgregarCategoria;