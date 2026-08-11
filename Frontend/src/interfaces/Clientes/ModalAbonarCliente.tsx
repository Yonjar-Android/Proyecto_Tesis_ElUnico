import { useEffect, useState } from "react";
import "./ModalAbonarCliente.css";
import Cliente from "./Cliente";

type TipoMoneda = "cordobas" | "dolares" | "mixto";

const TASA_CAMBIO = 36.6;

export interface DetalleAbono {
  montoAbonado: number;
  tipoMonedaRecibida: TipoMoneda;
  montoRecibidoCordobas: number;
  montoRecibidoDolares: number;
  cambioCordobas: number;
  tasaCambio: number;
  notas: string;
}

interface Props {
  abierto: boolean;
  cliente: Cliente | null;
  onClose: () => void;
  onAbonar: (
    id: number,
    monto: number,
    notas: string,
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
  const [montoAbonar, setMontoAbonar] = useState("");

  const [tipoMonedaRecibida, setTipoMonedaRecibida] =
    useState<TipoMoneda>("cordobas");
  const [montoRecibidoCordobas, setMontoRecibidoCordobas] = useState("");
  const [montoRecibidoDolares, setMontoRecibidoDolares] = useState("");

  const [notas, setNotas] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (abierto) {
      setMontoAbonar("");
      setTipoMonedaRecibida("cordobas");
      setMontoRecibidoCordobas("");
      setMontoRecibidoDolares("");
      setNotas("");
      setError("");
    }
  }, [abierto, cliente]);

  if (!abierto || !cliente) return null;

  const saldoActual = cliente.Saldo_Deuda ?? 0;
  const montoAbonarNumero = Number(montoAbonar) || 0;

  const numCordobasRecibido = Number(montoRecibidoCordobas) || 0;
  const numDolaresRecibido = Number(montoRecibidoDolares) || 0;

  const recibidoEnCordobas =
    tipoMonedaRecibida === "cordobas"
      ? numCordobasRecibido
      : tipoMonedaRecibida === "dolares"
      ? numDolaresRecibido * TASA_CAMBIO
      : numCordobasRecibido + numDolaresRecibido * TASA_CAMBIO;

  const cambioCordobas = Math.max(0, recibidoEnCordobas - montoAbonarNumero);
  const saldoDespues = saldoActual - montoAbonarNumero;

  function cerrar() {
    onClose();
    setError("");
  }

  function cambiarTipoMonedaRecibida(tipo: TipoMoneda) {
    setTipoMonedaRecibida(tipo);
    setMontoRecibidoCordobas("");
    setMontoRecibidoDolares("");
    setError("");
  }

const registrar = async () => {
    if (!montoAbonar.trim() || montoAbonarNumero <= 0) {
      setError("Ingresa el monto a abonar.");
      return;
    }

    if (montoAbonarNumero > saldoActual) {
      setError("El abono no puede ser mayor al saldo actual.");
      return;
    }

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

    if (recibidoEnCordobas < montoAbonarNumero) {
      setError("El monto recibido no puede ser menor al monto a abonar.");
      return;
    }

    const exito = await onAbonar(
      cliente.id,
      montoAbonarNumero,
      notas.trim(),
      setError
    );

    if (exito) {
      setMontoAbonar("");
      setMontoRecibidoCordobas("");
      setMontoRecibidoDolares("");
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
              C${formatearMoneda(saldoActual)}
            </span>
            <span className="abono-saldo-cliente">
              Cliente: {cliente.Nombre} {cliente.Apellido}
            </span>
          </div>

          <div className="campo">
            <label>
              Monto a abonar <span style={{ color: "red" }}>*</span>
            </label>
            <div className="abono-input-monto">
              <span className="abono-signo">C$</span>
              <input
                type="number"
                placeholder="0.00"
                value={montoAbonar}
                onChange={(e) => setMontoAbonar(e.target.value)}
                min="0"
                step="1"
              />
            </div>
          </div>

          <div className="campo">
            <label>
              Moneda recibida <span style={{ color: "red" }}>*</span>
            </label>
            <div className="moneda-selector">
              <button
                type="button"
                className={`moneda-btn ${
                  tipoMonedaRecibida === "cordobas" ? "activo" : ""
                }`}
                onClick={() => cambiarTipoMonedaRecibida("cordobas")}
              >
                Córdobas
              </button>
              <button
                type="button"
                className={`moneda-btn ${
                  tipoMonedaRecibida === "dolares" ? "activo" : ""
                }`}
                onClick={() => cambiarTipoMonedaRecibida("dolares")}
              >
                Dólares
              </button>
              <button
                type="button"
                className={`moneda-btn ${
                  tipoMonedaRecibida === "mixto" ? "activo" : ""
                }`}
                onClick={() => cambiarTipoMonedaRecibida("mixto")}
              >
                Mixto
              </button>
            </div>
          </div>

          <div
            className={`abono-montos-recibido ${
              tipoMonedaRecibida === "mixto" ? "en-linea" : ""
            }`}
          >
            {tipoMonedaRecibida !== "dolares" && (
              <div className="campo campo-compacto">
                <label>Recibido en córdobas</label>
                <div className="abono-input-monto">
                  <span className="abono-signo">C$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={montoRecibidoCordobas}
                    onChange={(e) => setMontoRecibidoCordobas(e.target.value)}
                    min="0"
                    step="1"
                  />
                </div>
              </div>
            )}

            {tipoMonedaRecibida !== "cordobas" && (
              <div className="campo campo-compacto">
                <label>Recibido en dólares</label>
                <div className="abono-input-monto">
                  <span className="abono-signo">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={montoRecibidoDolares}
                    onChange={(e) => setMontoRecibidoDolares(e.target.value)}
                    min="0"
                    step="1"
                  />
                </div>
              </div>
            )}
          </div>

          {tipoMonedaRecibida === "mixto" && (
            <p className="abono-nota-tasa">
              Equivalente recibido: C${formatearMoneda(recibidoEnCordobas)}{" "}
              (tasa C${formatearMoneda(TASA_CAMBIO)} por $1)
            </p>
          )}

          <div className="campo">
            <label>Notas (Opcional)</label>
            <textarea
              className="abono-notas"
              placeholder="Escribe detalles adicionales aquí..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
            />
          </div>

          <div className="abono-resumen-grupo">
            <div className="abono-resumen">
              <span>Cambio a entregar</span>
              <span className="abono-resumen-monto">
                C${formatearMoneda(cambioCordobas)}
              </span>
            </div>

            <div className="abono-resumen">
              <span>Saldo después de abono</span>
              <span className="abono-resumen-monto">
                C${formatearMoneda(Math.max(0, saldoDespues))}
              </span>
            </div>
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