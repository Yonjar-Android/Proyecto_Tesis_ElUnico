import { useState } from "react";
import "./ModalCliente.css";
import {
  IconoPersonaMas,
  IconoNumeral,
  IconoTelefono,
  IconoTarjeta,
  IconoUbicacion,
} from "./IconosCliente";

interface Props {
  abierto: boolean;
  onClose: () => void;
  onGuardar: (
    nombre: string,
    apellido: string,
    telefono: string,
    direccion: string,
    saldo_deuda: number,
    ncliente: number,
    ncedula: string,
    setError: (mensaje: string) => void
  ) => Promise<boolean>;
}

// Da formato visual 000-000000-0000L a partir del valor "crudo" (sin guiones) guardado en el estado.
function formatearCedula(valorCrudo: string): string {
  const limpio = valorCrudo.slice(0, 14); // máximo 13 dígitos + 1 letra
  const parte1 = limpio.slice(0, 3);
  const parte2 = limpio.slice(3, 9);
  const parte3 = limpio.slice(9, 13);
  const letra = limpio.slice(13, 14);

  let resultado = parte1;
  if (parte2) resultado += `-${parte2}`;
  if (parte3 || letra) resultado += `-${parte3}${letra}`;

  return resultado;
}

// Limpia lo que el usuario escribe/pega y devuelve el valor "crudo" (sin guiones) a guardar en el estado.
function limpiarCedula(valorIngresado: string): string {
  const soloAlfanumerico = valorIngresado.replace(/[^0-9a-zA-Z]/g, "");
  const digitos = soloAlfanumerico.replace(/[^0-9]/g, "").slice(0, 13);
  const letraMatch = soloAlfanumerico.match(/[a-zA-Z]/);
  const letra = letraMatch ? letraMatch[0].toUpperCase() : "";

  // La letra solo se agrega una vez que ya se completaron los 13 dígitos.
  return (digitos + (digitos.length === 13 ? letra : "")).slice(0, 14);
}

function ModalAgregarCliente({ abierto, onClose, onGuardar }: Props) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [ncliente, setNcliente] = useState("0");
  const [telefono, setTelefono] = useState("");
  const [saldo_deuda, setSaldo_Deuda] = useState("0");
  const [direccion, setDireccion] = useState("");
  const [cedula, setCedula] = useState("");

  const [error, setError] = useState("");

  if (!abierto) return null;

  function limpiar() {
    setNombre("");
    setApellido("");
    setNcliente("0");
    setTelefono("");
    setSaldo_Deuda("0");
    setDireccion("");
    setCedula("");
  }

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

if (!/^\d+$/.test(ncliente.trim())) {
  setError("Ingrese un número de cliente válido.");
  return;
}

if (Number(ncliente) <= 0) {
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
    setError("Ingrese un valor válido en el campo deuda");
    return;
    }

    if(Number(saldo_deuda) < 0){
      setError("El valor de crédito no puede ser negativo.");
      return;
    }

    if(cedula == "" && Number(saldo_deuda) > 0){
      setError("El campo número de cédula es obligatorio para un cliente con una deuda");
      return;
    }

    if(cedula != "" && Number(saldo_deuda) > 0){
      if(cedula.trim().length != 14){
        setError("Debe ingresar un número de cédula válido");
        return;
      }
    }


    const exito = await onGuardar(
      nombre,
      apellido,
      telefono,
      direccion,
      Number(saldo_deuda) || 0,
      Number(ncliente),
      cedula,
      setError
    );

    if (exito) {
      limpiar();
      setError("");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-cliente">
        <div className="modal-header">
          <h2>
            <IconoPersonaMas className="icono-titulo" />
            Agregar cliente
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
                type="number"
                min={1}
                step={1}
                placeholder="Ej: C-005"
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
                  maxLength={8}
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
                  value={saldo_deuda}
                  step={1}
                  min={0}
                  onChange={(e) => setSaldo_Deuda(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="campo">
            <label>
              Número de Cédula
              {Number(saldo_deuda) > 0 && <span style={{ color: "red" }}> *</span>}
            </label>
            <input
              type="text"
              placeholder="000-000000-0000L"
              value={formatearCedula(cedula)}
              maxLength={16}
              onChange={(e) => setCedula(limpiarCedula(e.target.value))}
            />
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

export default ModalAgregarCliente;