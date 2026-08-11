import { useState } from "react";
import "./ModalProveedor.css";
import {
  IconoPersonaMas,
  IconoTelefono,
  IconoUbicacion,
} from "../Clientes/IconosCliente";

interface Props {
  abierto: boolean;
  onClose: () => void;
  onGuardar: (
    nombreEmpresa: string,
    nombreContacto: string,
    telefono: string,
    direccion: string,
    setError: (mensaje: string) => void
  ) => Promise<boolean>;
}

function ModalAgregarProveedor({ abierto, onClose, onGuardar }: Props) {
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [nombreContacto, setNombreContacto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  const [error, setError] = useState("");

  if (!abierto) return null;

  function limpiar() {
    setNombreEmpresa("");
    setNombreContacto("");
    setTelefono("");
    setDireccion("");
  }

  function borrarError() {
    setError("");
  }

  const guardar = async () => {
    if (!nombreEmpresa.trim()) {
      setError("El campo razón social no puede estar vacío.");
      return;
    }

    if (!nombreContacto.trim()) {
      setError("El campo nombre de contacto no puede estar vacío.");
      return;
    }

    if (!telefono.trim()) {
      setError("El campo teléfono no puede estar vacío.");
      return;
    }

    const exito = await onGuardar(
      nombreEmpresa,
      nombreContacto,
      telefono,
      direccion,
      setError
    );

    if (exito) {
      limpiar();
      setError("");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-proveedor">
        <div className="modal-header">
          <h2>
            <IconoPersonaMas className="icono-titulo" />
            Agregar proveedor
          </h2>

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
          <div className="campo-fila">
            <div className="campo">
              <label>
                Razón Social <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Razón Social"
                value={nombreEmpresa}
                onChange={(e) => setNombreEmpresa(e.target.value)}
              />
            </div>

            <div className="campo">
              <label>
                Nombre de Contacto <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Contacto"
                value={nombreContacto}
                onChange={(e) => setNombreContacto(e.target.value)}
              />
            </div>
          </div>

          <div className="campo">
            <label>
              Teléfono <span style={{ color: "red" }}>*</span>
            </label>
            <div className="input-con-icono">
              <span className="icono">
                <IconoTelefono />
              </span>
              <input
                type="text"
                placeholder="Ej: 34459876"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>
          </div>

          <div className="campo">
            <label>Dirección</label>
            <div className="input-con-icono">
              <span className="icono">
                <IconoUbicacion />
              </span>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
            </div>
          </div>

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

          <button className="btn-guardar" onClick={guardar}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalAgregarProveedor;