import { useEffect, useState } from "react";
import "../Categoria/ModalAgregarCategoria.css";
import type Servicio from "./Servicio";

interface Props {
    abierto: boolean;
    servicio: Servicio | null;
    onClose: () => void;
    onEditar: (
      id: number,
      nombre: string,
      descripcion: string,
      precio: number,
      setError: (mensaje: string) => void
    ) => Promise<boolean>;
}

function ModalEditarServicio({
  abierto,
  servicio,
  onClose,
  onEditar,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");

  const [error, setError] = useState("");

useEffect(() => {
    if (servicio) {
        setNombre(servicio.Nombre_servicio);
        setDescripcion(servicio.Descripcion || "");
        setPrecio(String(servicio.Precio));
    }
}, [servicio]);

  if (!abierto) return null;

  const editar = async () => {

    if (!servicio) return;

    if (!nombre.trim()){
        setError("El nombre del servicio no puede estar vacío.");
        return;
    };

    const precioNumero = Number(precio);

    if (!precio.trim() || isNaN(precioNumero) || precioNumero <= 0) {
        setError("Ingresa un precio válido.");
        return;
    }

    const exito = await onEditar(servicio.id, nombre, descripcion, precioNumero, setError);

    if (exito) {
      setNombre("");
      setDescripcion("");
      setPrecio("");
      setError("");
        onClose();
    }

};

  return (
    <div className="modal-overlay">
      <div className="modal">

        <div className="modal-header">
          <h2>Editar servicio</h2>

          <button
            className="modal-close"
            onClick={onClose}
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
            onClick={
              () => {
                onClose();
                setNombre("");
                setDescripcion("");
                setPrecio("");
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

export default ModalEditarServicio;