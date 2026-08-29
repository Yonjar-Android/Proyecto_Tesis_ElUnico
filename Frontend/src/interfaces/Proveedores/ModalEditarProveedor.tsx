import { useEffect, useState } from "react";
import "./ModalProveedor.css";
import {
  IconoPersonaMas,
  IconoTelefono,
  IconoUbicacion,
} from "../Clientes/IconosCliente";
import Proveedor from "./Proveedor";

interface Props {
  abierto: boolean;
  proveedor: Proveedor | null;
  onClose: () => void;
  onEditar: (
    id: number | string,
    nombreEmpresa: string,
    nombreContacto: string,
    telefono: string,
    direccion: string,
    setError: (mensaje: string) => void
  ) => Promise<boolean>;
}

function ModalEditarProveedor({ abierto, proveedor, onClose, onEditar }: Props) {
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [nombreContacto, setNombreContacto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  const [error, setError] = useState("");

  // Precarga el formulario cada vez que se abre el modal con un proveedor distinto.
  useEffect(() => {
    if (abierto && proveedor) {
      setNombreEmpresa(proveedor.Nombre_Empresa ?? "");
      setNombreContacto(proveedor.Nombre_Contacto ?? "");
      setTelefono(proveedor.Telefono ?? "");
      setDireccion(proveedor.Direccion ?? "");
      setError("");
    }
  }, [abierto, proveedor]);

  if (!abierto || !proveedor) return null;

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

    const exito = await onEditar(
      proveedor.id,
      nombreEmpresa,
      nombreContacto,
      telefono,
      direccion,
      setError
    );

    if (exito) {
      setError("");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-cliente">
        <div className="modal-header">
          <h2>
            <IconoPersonaMas className="icono-titulo" />
            Editar proveedor
          </h2>

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
          <div className="campo-fila">
            <div className="campo">
              <label>
                Razón Social <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Empresa"
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
                placeholder="Ej: 3445-9876"
                max={8}
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

export default ModalEditarProveedor;