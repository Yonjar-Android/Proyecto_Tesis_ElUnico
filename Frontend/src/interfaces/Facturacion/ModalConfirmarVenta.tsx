import { useEffect, useState } from "react";
import "../Productos/ModalesSeleccion/ModalSeleccion.css";
import "./ModalConfirmarVenta.css";
import { obtenerSesionActiva } from "../../services/caja.service";

type TipoMoneda = "cordobas" | "dolares" | "mixto";

interface SesionCaja {
  id_sesion: number;
  monto_apertura_cordobas: number;
  tasa_cambio: number;
}

interface Egreso {
  id_egreso: number;
  metodo_pago: string;
  monto_cordobas: number;
  monto_dolares?: number;
}

export interface DetalleConfirmacionVenta {
  tipoMonedaRecibida: TipoMoneda;
  montoRecibidoCordobas: number;
  montoRecibidoDolares: number;
  cambioCordobas: number;
  tasaCambio: number;
  dineroRecibido: number;
}

interface Props {
  abierto: boolean;
  totalVenta: number;
  tipoPago: string;
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
  tipoPago,
  onClose,
  onConfirmar,
}: Props) {
  const [tipoMonedaRecibida, setTipoMonedaRecibida] =
    useState<TipoMoneda>("cordobas");
  const [montoRecibidoCordobas, setMontoRecibidoCordobas] = useState("");
  const [montoRecibidoDolares, setMontoRecibidoDolares] = useState("");

  // Estado de caja (mismos estados que la pantalla Caja)
  const [sesionActiva, setSesionActiva] = useState<SesionCaja | null>(null);
  const [egresos, setEgresos] = useState<Egreso[]>([]);
  const [ingresosDia, setIngresosDia] = useState(0);
  const [vueltosCordobas, setVueltosCordobas] = useState(0);

  const [cargandoCaja, setCargandoCaja] = useState(false);
  const [errorTasa, setErrorTasa] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!abierto) return;

    setTipoMonedaRecibida("cordobas");
    setMontoRecibidoCordobas("");
    setMontoRecibidoDolares("");
    setError("");
    setErrorTasa("");
    setSesionActiva(null);
    setEgresos([]);
    setIngresosDia(0);
    setVueltosCordobas(0);

    let cancelado = false;

    async function cargarEstadoCaja() {
      setCargandoCaja(true);
      try {
        const data = await obtenerSesionActiva();
        if (cancelado) return;

        setSesionActiva(data.sesion);
        setEgresos(data.egresos || []);

        // Misma normalización que en la pantalla de Caja
        const rawIngresos = Number(data.ingresosDia ?? 0);
        const rawVueltos = Number(data.vueltosCordobas ?? 0);
        if (rawIngresos < 0 && rawVueltos === 0) {
          setIngresosDia(0);
          setVueltosCordobas(-rawIngresos);
        } else {
          setIngresosDia(Math.max(0, rawIngresos));
          setVueltosCordobas(rawVueltos);
        }

        if (!data?.sesion) {
          setErrorTasa(
            "No hay una caja abierta. Solo se puede cobrar en córdobas."
          );
          return;
        }
        const tasa = Number(data.sesion.tasa_cambio);
        if (!tasa || tasa <= 0 || isNaN(tasa)) {
          setErrorTasa(
            "La caja abierta no tiene una tasa de cambio válida. Solo se puede cobrar en córdobas."
          );
        }
      } catch (e) {
        console.error(e);
        if (!cancelado) {
          setErrorTasa(
            "No se pudo obtener la información de caja. Solo se puede cobrar en córdobas."
          );
        }
      } finally {
        if (!cancelado) setCargandoCaja(false);
      }
    }

    cargarEstadoCaja();

    return () => {
      cancelado = true;
    };
  }, [abierto]);

  if (!abierto) return null;

  // --- Tasa de cambio de la sesión activa ---
  const tasaSesion = Number(sesionActiva?.tasa_cambio);
  const tasaCambio = tasaSesion > 0 && !isNaN(tasaSesion) ? tasaSesion : null;
  const tasa = tasaCambio ?? 0;

  // --- Efectivo disponible en córdobas (misma fórmula que Caja) ---
  const aperturaCordobas = Number(sesionActiva?.monto_apertura_cordobas) || 0;

  const totalEgresosCordobas = egresos
    .filter((e) => e.metodo_pago === "Efectivo")
    .reduce((acc, e) => acc + Number(e.monto_cordobas || 0), 0);

  const disponibleCordobas =
    aperturaCordobas + ingresosDia - vueltosCordobas - totalEgresosCordobas;

  // --- Cálculo de lo recibido, normalizado a córdobas ---
  const numCordobasRecibido = Number(montoRecibidoCordobas) || 0;
  const numDolaresRecibido = Number(montoRecibidoDolares) || 0;

  const recibidoEnCordobas =
    tipoMonedaRecibida === "cordobas"
      ? numCordobasRecibido
      : tipoMonedaRecibida === "dolares"
      ? numDolaresRecibido * tasa
      : numCordobasRecibido + numDolaresRecibido * tasa;

  const cambioCordobas = Math.max(0, recibidoEnCordobas - totalVenta);
  const faltanteCordobas = Math.max(0, totalVenta - recibidoEnCordobas);

  // --- Validación: el vuelto no puede superar el efectivo neto en córdobas ---
  // Los córdobas que entran en esta venta quedan en caja antes de dar el vuelto
const efectivoParaVuelto = Math.max(0, disponibleCordobas);

const vueltoExcedeCaja =
  tipoPago !== "Credito" &&
  cambioCordobas > 0 &&
  cambioCordobas > efectivoParaVuelto;

  const dolaresDeshabilitados = cargandoCaja || !tasaCambio;

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

    if (tipoMonedaRecibida !== "cordobas" && !tasaCambio) {
      setError("No se pudo determinar la tasa de cambio.");
      return;
    }

    if (recibidoEnCordobas < totalVenta) {
      setError("El monto recibido no puede ser menor al total a pagar.");
      return;
    }

    if (vueltoExcedeCaja) {
      setError(
        `No hay suficiente efectivo en caja para dar el vuelto. Disponible para vuelto: C$${formatearMoneda(
          efectivoParaVuelto
        )}.`
      );
      return;
    }

    // Efectivo FÍSICO real entregado por el cliente
    const cordobasFisicos =
      tipoMonedaRecibida === "dolares" ? 0 : numCordobasRecibido;
    const dolaresFisicos =
      tipoMonedaRecibida === "cordobas" ? 0 : numDolaresRecibido;

    const detalle: DetalleConfirmacionVenta = {
      tipoMonedaRecibida,
      montoRecibidoCordobas: Number(cordobasFisicos.toFixed(2)),
      montoRecibidoDolares: Number(dolaresFisicos.toFixed(2)),
      cambioCordobas: Math.round(cambioCordobas * 100) / 100,
      tasaCambio: tasa,
      dineroRecibido: recibidoEnCordobas,
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
                disabled={dolaresDeshabilitados}
                className={`moneda-btn ${
                  tipoMonedaRecibida === "dolares" ? "activo" : ""
                }`}
                onClick={() => resetearCamposRecibido("dolares")}
              >
                Dólares
              </button>
              <button
                type="button"
                disabled={dolaresDeshabilitados}
                className={`moneda-btn ${
                  tipoMonedaRecibida === "mixto" ? "activo" : ""
                }`}
                onClick={() => resetearCamposRecibido("mixto")}
              >
                Mixto
              </button>
            </div>
            {errorTasa && <span className="error-text">{errorTasa}</span>}
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

          {tipoMonedaRecibida !== "cordobas" && (
            <p className="abono-nota-tasa">
              {cargandoCaja
                ? "Cargando tasa de cambio..."
                : `Equivalente recibido: C$${formatearMoneda(
                    recibidoEnCordobas
                  )} (tasa C$${formatearMoneda(tasa)} por $1)`}
            </p>
          )}

          {faltanteCordobas > 0 ? (
            <div className="confirmar-cambio-card confirmar-cambio-card--falta">
              <span className="confirmar-cambio-icono">⚠️</span>
              <span className="confirmar-cambio-label">Falta</span>
              <span className="confirmar-cambio-monto">
                C${formatearMoneda(faltanteCordobas)}
              </span>
            </div>
          ) : (
            <div className="confirmar-cambio-card">
              <span className="confirmar-cambio-icono">💵</span>
              <span className="confirmar-cambio-label">Cambio</span>
              <span className="confirmar-cambio-monto">
                C${formatearMoneda(cambioCordobas)}
              </span>
            </div>
          )}

          {vueltoExcedeCaja && (
            <span className="error-text">
              El vuelto supera el efectivo en caja (disponible para vuelto: C$
              {formatearMoneda(efectivoParaVuelto)}).
            </span>
          )}

          {error && <span className="error-text">{error}</span>}
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={cerrar}>
            Cancelar
          </button>

          <button
            disabled={
              tipoPago === "Credito"
                ? false
                : recibidoEnCordobas < totalVenta ||
                  vueltoExcedeCaja ||
                  cargandoCaja
            }
            className="btn-guardar confirmar-venta-btn"
            onClick={confirmar}
          >
            ✓ Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalConfirmarVenta;