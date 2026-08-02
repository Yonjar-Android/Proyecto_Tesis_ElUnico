import { useEffect, useState } from "react";
import "./ModalAbonarCliente.css";
import Cliente from "./Cliente";

interface Props {
  abierto: boolean;
  cliente: Cliente | null;
  onClose: () => void;
  onAbonar: (
    id: number,
    monto: number,
    //notas: string,
    setError: (mensaje: string) => void
  ) => Promise<boolean>;
}

function formatearMoneda(valor: number) {
  return valor.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function ModalAbonarCliente({ abierto, cliente, onClose, onAbonar }: Props) {
  const [monto, setMonto] = useState("");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (abierto) {
      setMonto("");
      setNotas("");
      setError("");
    }
  }, [abierto, cliente]);

  if (!abierto || !cliente) return null;

  const saldoActual = cliente.Saldo_Deuda ?? 0;
  const montoNumero = Number(monto) || 0;
  const saldoDespues = saldoActual - montoNumero;

  function borrarError() {
    setError("");
  }

  function cerrar() {
    onClose();
    borrarError();
  }

  const registrar = async () => {
    if (!monto.trim() || montoNumero <= 0) {
      setError("Ingresa un monto de abono válido.");
      return;
    }

    if (montoNumero > saldoActual) {
      setError("El abono no puede ser mayor al saldo actual.");
      return;
    }

    const exito = await onAbonar(cliente.id, montoNumero, /*notas.trim(),*/ setError);

    if (exito) {
      setMonto("");
      setNotas("");
      setError("");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal abono-modal">
        <div className="modal-header">
          <h2>Registrar abono</h2>
        </div>

        <div className="modal-body">
          <div className="abono-saldo-card">
            <span className="abono-saldo-label">Saldo actual</span>
            <span className="abono-saldo-monto">
              ${formatearMoneda(saldoActual)}
            </span>
            <span className="abono-saldo-cliente">
              Cliente: {cliente.Nombre} {cliente.Apellido}
            </span>
          </div>

          <div className="campo">
            <label>
              Monto del abono <span style={{ color: "red" }}>*</span>
            </label>
            <div className="abono-input-monto">
              <span className="abono-signo">C$</span>
              <input
                type="number"
                placeholder="0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                min="0"
                step="1"
              />
            </div>
          </div>

          <div className="campo">
            <label>Notas (Opcional)</label>
            <textarea
              className="abono-notas"
              placeholder="Escribe detalles adicionales aquí..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
            />
          </div>

          <div className="abono-resumen">
            <span>Saldo después de abono</span>
            <span className="abono-resumen-monto">
              C${formatearMoneda(saldoDespues)}
            </span>
          </div>

          {error && <span className="error-text">{error}</span>}
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={cerrar}>
            Cancelar
          </button>

          <button className="btn-guardar abono-btn-registrar" onClick={registrar}>
            Registrar abono
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalAbonarCliente;