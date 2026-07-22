import { useEffect, useState } from "react";
import "./ModalAgregarCategoria.css";
import type Categoria from "./Categoria";

interface Props {
    abierto: boolean;
    categoria: Categoria | null;
    onClose: () => void;
    onEditar: (id: number, nombre: string,
      setError: (mensaje: string) => void
    ) => Promise<boolean>;
}

function ModalEditarCategoria({
  abierto,
  categoria,
  onClose,
  onEditar,
}: Props) {
  const [nombre, setNombre] = useState("");

  const [error, setError] = useState("");

useEffect(() => {
    if (categoria) {
        setNombre(categoria.Nombre_categoria);
    }
}, [categoria]);

  if (!abierto) return null;

  const editar = async () => {

    if (!categoria) return;

    if (!nombre.trim()){
        setError("El nombre de la categoría no puede estar vacío.");
        return;
    };

    const exito = await onEditar(categoria.id, nombre, setError);

    if (exito) {
      setNombre("");
      setError("");
        onClose();
    }

};

  return (
    <div className="modal-overlay">
      <div className="modal">

        <div className="modal-header">
          <h2>Editar categoría</h2>

          <button
            className="modal-close"
            onClick={onClose}
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
            onClick={
              () => {
                onClose();
                setNombre("");
                setError("");
              }
            }
          >
            Cancelar
          </button>

          <button
            className="btn-guardar"
            onClick={editar}
          >
            Guardar
          </button>

        </div>

      </div>
    </div>
  );
}

export default ModalEditarCategoria;