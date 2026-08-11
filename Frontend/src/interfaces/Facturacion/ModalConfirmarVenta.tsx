import { useEffect, useState } from "react";
import "../Productos/ModalesSeleccion/ModalSeleccion.css";
import "./ModalConfirmarVenta.css";

type TipoMoneda = "cordobas" | "dolares" | "mixto";

const TASA_CAMBIO = 36.6;

export interface DetalleConfirmacionVenta {
  tipoMonedaRecibida: TipoMoneda;
  montoRecibidoCordobas: number;
  montoRecibidoDolares: number;
  cambioCordobas: number;
  tasaCambio: number;
}

interface Props {
  abierto: boolean;
  totalVenta: number;
  onClose: () => void;
  onConfirmar: (
    detalle: DetalleConfirmacionVenta,
    setError: (mensaje: string) => void
  ) => Promise<boolean>;
}

function formatearMoneda(valor: number) {
  return valor.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function ModalConfirmarVenta({
  abierto,
  totalVenta,
  onClose,
  onConfirmar,
}: Props) {
  const [tipoMonedaRecibida, setTipoMonedaRecibida] =
    useState<TipoMoneda>("cordobas");
  const [montoRecibidoCordobas, setMontoRecibidoCordobas] = useState("");
  const [montoRecibidoDolares, setMontoRecibidoDolares] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (abierto) {
      setTipoMonedaRecibida("cordobas");
      setMontoRecibidoCordobas("");
      setMontoRecibidoDolares("");
      setError("");
    }
  }, [abierto]);

  if (!abierto) return null;

  // --- Cálculo de lo recibido, normalizado a córdobas ---
  const numCordobasRecibido = Number(montoRecibidoCordobas) || 0;
  const numDolaresRecibido = Number(montoRecibidoDolares) || 0;

  const recibidoEnCordobas =
    tipoMonedaRecibida === "cordobas"
      ? numCordobasRecibido
      : tipoMonedaRecibida === "dolares"
      ? numDolaresRecibido * TASA_CAMBIO
      : numCordobasRecibido + numDolaresRecibido * TASA_CAMBIO;

  const cambioCordobas = Math.max(0, recibidoEnCordobas - totalVenta);

  function cerrar() {
    onClose();
    setError("");
  }

  function resetearCamposRecibido(tipo: TipoMoneda) {
    setTipoMonedaRecibida(tipo);
    setMontoRecibidoCordobas("");
    setMontoRecibidoDolares("");
    setError("");
  }

  const confirmar = async () => {
    if (tipoMonedaRecibida === "cordobas" && numCordobasRecibido <= 0) {
      setError("Ingresa el monto recibido en córdobas.");
      return;
    }

    if (tipoMonedaRecibida === "dolares" && numDolaresRecibido <= 0) {
      setError("Ingresa el monto recibido en dólares.");
      return;
    }

    if (
      tipoMonedaRecibida === "mixto" &&
      numCordobasRecibido <= 0 &&
      numDolaresRecibido <= 0
    ) {
      setError("Ingresa al menos un monto recibido (córdobas o dólares).");
      return;
    }

    if (recibidoEnCordobas < totalVenta) {
      setError("El monto recibido no puede ser menor al total a pagar.");
      return;
    }

    const detalle: DetalleConfirmacionVenta = {
      tipoMonedaRecibida,
      montoRecibidoCordobas:
        tipoMonedaRecibida === "dolares" ? 0 : numCordobasRecibido,
      montoRecibidoDolares:
        tipoMonedaRecibida === "cordobas" ? 0 : numDolaresRecibido,
      cambioCordobas: Number(cambioCordobas.toFixed(2)),
      tasaCambio: TASA_CAMBIO,
    };

    const exito = await onConfirmar(detalle, setError);

    if (exito) {
      setMontoRecibidoCordobas("");
      setMontoRecibidoDolares("");
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
              Moneda recibida <span style={{ color: "#e5484d" }}>*</span>
            </label>
            <div className="moneda-selector">
              <button
                type="button"
                className={`moneda-btn ${
                  tipoMonedaRecibida === "cordobas" ? "activo" : ""
                }`}
                onClick={() => resetearCamposRecibido("cordobas")}
              >
                Córdobas
              </button>
              <button
                type="button"
                className={`moneda-btn ${
                  tipoMonedaRecibida === "dolares" ? "activo" : ""
                }`}
                onClick={() => resetearCamposRecibido("dolares")}
              >
                Dólares
              </button>
              <button
                type="button"
                className={`moneda-btn ${
                  tipoMonedaRecibida === "mixto" ? "activo" : ""
                }`}
                onClick={() => resetearCamposRecibido("mixto")}
              >
                Mixto
              </button>
            </div>
          </div>

          {tipoMonedaRecibida !== "dolares" && (
            <div className="campo">
              <label>Monto recibido (córdobas)</label>
              <div className="confirmar-monto-input">
                <span>C$</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0.00"
                  value={montoRecibidoCordobas}
                  onChange={(e) => setMontoRecibidoCordobas(e.target.value)}
                />
              </div>
            </div>
          )}

          {tipoMonedaRecibida !== "cordobas" && (
            <div className="campo">
              <label>Monto recibido (dólares)</label>
              <div className="confirmar-monto-input">
                <span>$</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0.00"
                  value={montoRecibidoDolares}
                  onChange={(e) => setMontoRecibidoDolares(e.target.value)}
                />
              </div>
            </div>
          )}

          {tipoMonedaRecibida === "mixto" && (
            <p className="confirmar-nota-tasa">
              Equivalente recibido: C${formatearMoneda(recibidoEnCordobas)}{" "}
              (tasa C${formatearMoneda(TASA_CAMBIO)} por $1)
            </p>
          )}

          <div className="confirmar-cambio-card">
            <span className="confirmar-cambio-icono">💵</span>
            <span className="confirmar-cambio-label">Cambio</span>
            <span className="confirmar-cambio-monto">
              C${formatearMoneda(cambioCordobas)}
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