import { useEffect, useState } from "react";
import "./ModalAgregarMarca.css";
import type Marca from "./Marca";

interface Props {
    abierto: boolean;
    marca: Marca | null;
    onClose: () => void;
    onEditar: (id: number, nombre: string,
      setError: (mensaje: string) => void
    ) => Promise<boolean>;
}

function ModalEditarMarca({
  abierto,
  marca,
  onClose,
  onEditar,
}: Props) {
  const [nombre, setNombre] = useState("");

  const [error, setError] = useState("");

useEffect(() => {
    if (marca) {
        setNombre(marca.Nombre_marca);
    }
}, [marca]);

  if (!abierto) return null;

  const editar = async () => {

    if (!marca) return;

    if (!nombre.trim()){
        setError("El nombre de la marca no puede estar vacío.");
        return;
    };

    const exito = await onEditar(marca.id, nombre, setError);

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
          <h2>Editar marca</h2>

          <button
            className="modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">

          <label>Nombre de marca <span style={{ color: "red" }}>*</span></label>

          <input
            type="text"
            placeholder="Ej: Yamalube"
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

export default ModalEditarMarca;