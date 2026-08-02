import { useEffect, useState } from "react";
import "../Productos/ModalesSeleccion/ModalSeleccion.css";
import "./ModalConfirmarVenta.css";

interface Props {
  abierto: boolean;
  totalVenta: number;
  onClose: () => void;
  onConfirmar: (
    montoRecibido: number,
    setError: (mensaje: string) => void
  ) => Promise<boolean>;
}

function formatearMoneda(valor: number) {
  return valor.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function ModalConfirmarVenta({ abierto, totalVenta, onClose, onConfirmar }: Props) {
  const [montoRecibido, setMontoRecibido] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (abierto) {
      setMontoRecibido("");
      setError("");
    }
  }, [abierto]);

  if (!abierto) return null;

  const montoRecibidoNumero = Number(montoRecibido) || 0;
  const cambio = montoRecibidoNumero - totalVenta;

  function cerrar() {
    onClose();
    setError("");
  }

  const confirmar = async () => {
    if (!montoRecibido.trim() || montoRecibidoNumero <= 0) {
      setError("Ingresa el monto recibido.");
      return;
    }

    if (montoRecibidoNumero < totalVenta) {
      setError("El monto recibido no puede ser menor al total a pagar.");
      return;
    }

    const exito = await onConfirmar(montoRecibidoNumero, setError);

    if (exito) {
      setMontoRecibido("");
      setError("");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-cliente confirmar-venta-modal">
        <div className="modal-header">
          <h2>Confirmar Venta</h2>
          <button className="modal-close" onClick={cerrar}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="confirmar-total-card">
            <span className="confirmar-total-label">Monto total a pagar</span>
            <span className="confirmar-total-monto">
              C${formatearMoneda(totalVenta)}
            </span>
          </div>

          <div className="campo">
            <label>
              Monto Recibido <span style={{ color: "#e5484d" }}>*</span>
            </label>
            <div className="confirmar-monto-input">
              <span>$</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={montoRecibido}
                onChange={(e) => setMontoRecibido(e.target.value)}
              />
            </div>
          </div>

          <div className="confirmar-cambio-card">
            <span className="confirmar-cambio-icono">💵</span>
            <span className="confirmar-cambio-label">Cambio</span>
            <span className="confirmar-cambio-monto">
              C${formatearMoneda(Math.max(0, cambio))}
            </span>
          </div>

          {error && <span className="error-text">{error}</span>}
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={cerrar}>
            Cancelar
          </button>

          <button className="btn-guardar confirmar-venta-btn" onClick={confirmar}>
            ✓ Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalConfirmarVenta;