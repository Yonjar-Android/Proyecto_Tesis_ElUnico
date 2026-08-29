import { useEffect, useState } from "react";
import "./ModalCliente.css";
import {
  IconoPersonaMas,
  IconoNumeral,
  IconoTelefono,
  IconoTarjeta,
  IconoUbicacion,
} from "./IconosCliente";
import Cliente from "./Cliente";

interface Props {
  abierto: boolean;
  cliente: Cliente | null;
  onClose: () => void;
  onEditar: (
    id: number | string,
    nombre: string,
    apellido: string,
    telefono: string,
    direccion: string,
    saldo_deuda: number,
    ncliente: number,
    setError: (mensaje: string) => void
  ) => Promise<boolean>;
}

function ModalEditarCliente({ abierto, cliente, onClose, onEditar }: Props) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [ncliente, setNcliente] = useState("0");
  const [telefono, setTelefono] = useState("");
  const [saldo_deuda, setSaldo_Deuda] = useState("0");
  const [direccion, setDireccion] = useState("");

  const [error, setError] = useState("");

  // Precarga el formulario cada vez que se abre el modal con un cliente distinto.
  useEffect(() => {
    if (abierto && cliente) {
      setNombre(cliente.Nombre ?? "");
      setApellido(cliente.Apellido ?? "");
      setNcliente(String(cliente.NCliente ?? 0));
      setTelefono(cliente.Telefono ?? "");
      setSaldo_Deuda(String(cliente.Saldo_Deuda ?? 0));
      setDireccion(cliente.Direccion ?? "");
      setError("");
    }
  }, [abierto, cliente]);

  if (!abierto || !cliente) return null;

  function borrarError() {
    setError("");
  }

  const guardar = async () => {
    if (!nombre.trim()) {
      setError("El campo nombre no puede estar vacío.");
      return;
    }

    if (!apellido.trim()) {
      setError("El campo apellido no puede estar vacío.");
      return;
    }

    if (!ncliente.trim()) {
      setError("El campo número de cliente no puede estar vacío.");
      return;
    }

    if (!/^\d+$/.test(ncliente)) {
    setError("Ingrese un número de cliente válido.");
    return;
    }

    if (Number(ncliente.trim()) <= 0) {
      setError("El campo número de cliente debe ser mayor que 0.");
      return;
    }


    if (!/^\d+$/.test(telefono) && telefono.length != 0) {
    setError("El número de teléfono solo puede contener dígitos del 0 al 9.");
    return;
    }

    if(telefono.length != 8 && telefono.length != 0){
      setError("El número de teléfono debe contener 8 caracteres.");
      return;
    }

    if (isNaN(Number(saldo_deuda))) {
    setError("Ingrese un valor válido en el campo crédito");
    return;
    }

    if(Number(saldo_deuda) < 0){
      setError("El valor de crédito no puede ser negativo.");
      return;
    }

    const exito = await onEditar(
      cliente.id,
      nombre,
      apellido,
      telefono,
      direccion,
      Number(saldo_deuda) || 0,
      Number(ncliente),
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
            Editar cliente
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
                Nombre <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="campo">
              <label>
                Apellido <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
              />
            </div>
          </div>

          <div className="campo">
            <label>
              Número <span style={{ color: "red" }}>*</span>
            </label>
            <div className="input-con-icono">
              <span className="icono">
                <IconoNumeral />
              </span>
              <input
                type="text"
                placeholder="Ej: C-005"
                readOnly
                value={ncliente}
                onChange={(e) => setNcliente(e.target.value)}
              />
            </div>
          </div>

          <div className="separador-opcional">Información opcional</div>

          <div className="campo-fila">
            <div className="campo">
              <label>Teléfono</label>
              <div className="input-con-icono">
                <span className="icono">
                  <IconoTelefono />
                </span>
                <input
                  type="text"
                  value={telefono}
                  max={8}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>
            </div>

            <div className="campo">
              <label>Deuda de Crédito</label>
              <div className="input-con-icono">
                <span className="icono">
                  <IconoTarjeta />
                </span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  readOnly
                  value={saldo_deuda}
                  onChange={(e) => setSaldo_Deuda(e.target.value)}
                />
              </div>
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

export default ModalEditarCliente;