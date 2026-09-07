import { useEffect, useState } from "react";
import "../Productos/ModalesSeleccion/ModalSeleccion.css";
import "../Facturacion/ModalConfirmarVenta.css";
import styles from "./ModalAbonarCredito.module.css";
import { obtenerCuotasPendientes } from "../../services/cuota.service";
import { registrarAbono } from "../../services/abono.service";
import type { FacturaCreditoPendiente, CuotaInfo, DistribucionCuota } from "../../models/Credito";

type TipoMoneda = "cordobas" | "dolares" | "mixto";
type TipoPago = "Contado" | "Transferencia";

const TASA_CAMBIO = 36.6;

function formatearMoneda(valor: number) {
  return valor.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function claseBadge(estado: DistribucionCuota["estado_resultante"]): string {
  return estado === "pagada" ? styles.badgePagada : styles.badgePagadaParcial;
}

interface Props {
  abierto: boolean;
  factura: FacturaCreditoPendiente;
  onClose: () => void;
  onConfirmado: () => void;
}

// Distribuye el monto a abonar entre las cuotas pendientes, de la más antigua a la más nueva.
// Esto es solo una PREVISUALIZACIÓN para el usuario — la distribución real y definitiva
// la calcula el backend dentro de la transacción de registrarAbono.
function calcularDistribucion(
  montoAAbonar: number,
  cuotas: CuotaInfo[]
): { distribucion: DistribucionCuota[]; excedente: number } {
  let disponible = montoAAbonar;
  const distribucion: DistribucionCuota[] = [];

  for (const cuota of cuotas) {
    if (disponible <= 0) break;

    const saldoAntes = cuota.saldo_cuota;
    const aplicado = Math.min(disponible, saldoAntes);
    const saldoDespues = saldoAntes - aplicado;

    distribucion.push({
      id_cuota: cuota.id,
      numero_cuota: cuota.numero_cuota,
      saldo_antes: saldoAntes,
      monto_aplicado: aplicado,
      saldo_despues: saldoDespues,
      estado_resultante: saldoDespues === 0 ? "pagada" : "pagada_parcial",
    });

    disponible -= aplicado;
  }

  return { distribucion, excedente: disponible };
}

function ModalAbonarCredito({ abierto, factura, onClose, onConfirmado }: Props) {
  const [cuotasPendientes, setCuotasPendientes] = useState<CuotaInfo[]>([]);

  const [tipoPago, setTipoPago] = useState<TipoPago>("Contado");
  const [numReferencia, setNumReferencia] = useState("");

  const [tipoMonedaRecibida, setTipoMonedaRecibida] = useState<TipoMoneda>("cordobas");
  const [montoRecibidoCordobas, setMontoRecibidoCordobas] = useState("");
  const [montoRecibidoDolares, setMontoRecibidoDolares] = useState("");

  // Lo que el cliente decide abonar realmente (puede ser menor a lo recibido)
  const [montoAAbonar, setMontoAAbonar] = useState("");

  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const buscarCuotasPendientes = async () => {
    try {
      const response: CuotaInfo[] = await obtenerCuotasPendientes(factura.id);

      setCuotasPendientes(response);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!abierto) return;
    buscarCuotasPendientes();

    setTipoPago("Contado");
    setNumReferencia("");
    setTipoMonedaRecibida("cordobas");
    setMontoRecibidoCordobas("");
    setMontoRecibidoDolares("");
    setMontoAAbonar("");
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, factura.id]);

  if (!abierto) return null;

  const numCordobasRecibido = Number(montoRecibidoCordobas) || 0;
  const numDolaresRecibido = Number(montoRecibidoDolares) || 0;
  const numMontoAAbonar = Number(montoAAbonar) || 0;

  const recibidoEnCordobas =
    tipoMonedaRecibida === "cordobas"
      ? numCordobasRecibido
      : tipoMonedaRecibida === "dolares"
      ? numDolaresRecibido * TASA_CAMBIO
      : numCordobasRecibido + numDolaresRecibido * TASA_CAMBIO;

  const cambioCordobas = Math.max(0, recibidoEnCordobas - numMontoAAbonar);

  const { distribucion, excedente } = calcularDistribucion(numMontoAAbonar, cuotasPendientes);

  function resetearCamposRecibido(tipo: TipoMoneda) {
    setTipoMonedaRecibida(tipo);
    setMontoRecibidoCordobas("");
    setMontoRecibidoDolares("");
    setError("");
  }

  function cerrar() {
    onClose();
    setError("");
  }

  const confirmar = async () => {
    if (recibidoEnCordobas <= 0) {
      setError("Ingresa el monto recibido.");
      return;
    }

    if (numMontoAAbonar <= 0) {
      setError("Ingresa cuánto deseas abonar.");
      return;
    }

    if (numMontoAAbonar > recibidoEnCordobas) {
      setError("El monto a abonar no puede ser mayor al monto recibido.");
      return;
    }

    if (tipoPago === "Transferencia" && !numReferencia.trim()) {
      setError("Ingresa el número de referencia.");
      return;
    }

    // La tabla 'abono' no guarda moneda recibida/cambio como columnas propias,
    // así que se deja registrado en observaciones para trazabilidad.
    const observaciones =
      tipoMonedaRecibida === "cordobas"
        ? undefined
        : `Recibido en ${tipoMonedaRecibida === "dolares" ? "dólares" : "mixto"}: ` +
          `C$${formatearMoneda(numCordobasRecibido)} + $${formatearMoneda(numDolaresRecibido)} ` +
          `(equivalente C$${formatearMoneda(recibidoEnCordobas)}), cambio C$${formatearMoneda(cambioCordobas)}`;

    try {
      setGuardando(true);
      setError("");

      await registrarAbono({
        idCreditoFactura: factura.id,
        montoAAbonar: numMontoAAbonar,
        metodoPago: tipoPago,
        referencia: tipoPago === "Transferencia" ? numReferencia : undefined,
        observaciones,
      });

      onConfirmado();
    } catch (error: any) {
      setError(error.response?.data?.mensaje ?? "No se pudo registrar el abono. Intenta nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className={`modal modal-cliente confirmar-venta-modal ${styles.modalAbonar}`}>
        <div className="modal-header">
          <h2>Abonar — {factura.numero_factura}</h2>
          <button className="modal-close" onClick={cerrar}>✕</button>
        </div>

        <div className={`modal-body ${styles.modalBodyScroll}`}>
          <div className="confirmar-total-card">
            <span className="confirmar-total-label">Saldo pendiente de la factura</span>
            <span className="confirmar-total-monto">
              C${formatearMoneda(factura.saldo_pendiente)}
            </span>
          </div>

          <div className="campo">
            <label>Tipo de Pago <span style={{ color: "#e5484d" }}>*</span></label>
            <select
              value={tipoPago}
              onChange={(e) => {
                const nuevo = e.target.value as TipoPago;
                setTipoPago(nuevo);
                if (nuevo !== "Transferencia") setNumReferencia("");
              }}
            >
              <option value="Contado">Contado</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </div>

          {tipoPago === "Transferencia" && (
            <div className="campo">
              <label>Número de Referencia <span style={{ color: "#e5484d" }}>*</span></label>
              <input
                type="text"
                value={numReferencia}
                onChange={(e) => setNumReferencia(e.target.value)}
                placeholder="Ej. 000123456"
              />
            </div>
          )}

          <div className="campo">
            <label>Moneda recibida <span style={{ color: "#e5484d" }}>*</span></label>
            <div className="moneda-selector">
              <button type="button" className={`moneda-btn ${tipoMonedaRecibida === "cordobas" ? "activo" : ""}`} onClick={() => resetearCamposRecibido("cordobas")}>Córdobas</button>
              <button type="button" className={`moneda-btn ${tipoMonedaRecibida === "dolares" ? "activo" : ""}`} onClick={() => resetearCamposRecibido("dolares")}>Dólares</button>
              <button type="button" className={`moneda-btn ${tipoMonedaRecibida === "mixto" ? "activo" : ""}`} onClick={() => resetearCamposRecibido("mixto")}>Mixto</button>
            </div>
          </div>

          {tipoMonedaRecibida !== "dolares" && (
            <div className="campo">
              <label>Monto recibido (córdobas)</label>
              <div className="confirmar-monto-input">
                <span>C$</span>
                <input type="number" step="1" min="0" placeholder="0.00" value={montoRecibidoCordobas} onChange={(e) => setMontoRecibidoCordobas(e.target.value)} />
              </div>
            </div>
          )}

          {tipoMonedaRecibida !== "cordobas" && (
            <div className="campo">
              <label>Monto recibido (dólares)</label>
              <div className="confirmar-monto-input">
                <span>$</span>
                <input type="number" step="1" min="0" placeholder="0.00" value={montoRecibidoDolares} onChange={(e) => setMontoRecibidoDolares(e.target.value)} />
              </div>
            </div>
          )}

          {tipoMonedaRecibida !== "cordobas" && (
            <p className="abono-nota-tasa">
              Equivalente recibido: C${formatearMoneda(recibidoEnCordobas)} (tasa C${formatearMoneda(TASA_CAMBIO)} por $1)
            </p>
          )}

          <div className="campo">
            <label>¿Cuánto desea abonar? <span style={{ color: "#e5484d" }}>*</span></label>
            <div className="confirmar-monto-input">
              <span>C$</span>
              <input type="number" step="1" min="0" placeholder="0.00" value={montoAAbonar} onChange={(e) => setMontoAAbonar(e.target.value)} />
            </div>
          </div>

          {cambioCordobas > 0 && (
            <div className="confirmar-cambio-card">
              <span className="confirmar-cambio-icono">💵</span>
              <span className="confirmar-cambio-label">Cambio</span>
              <span className="confirmar-cambio-monto">C${formatearMoneda(cambioCordobas)}</span>
            </div>
          )}

          {numMontoAAbonar > 0 && (
            <div className={styles.distribucionCard}>
              <p className={styles.distribucionTitulo}>Así se aplicará el abono:</p>
              <div className={styles.distribucionTablaWrapper}>
                <table className={styles.distribucionTabla}>
                  <thead>
                    <tr>
                      <th>Cuota</th>
                      <th>Saldo antes</th>
                      <th>Aplicado</th>
                      <th>Saldo después</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distribucion.map((d) => (
                      <tr key={d.id_cuota}>
                        <td>#{d.numero_cuota}</td>
                        <td>C${formatearMoneda(d.saldo_antes)}</td>
                        <td>C${formatearMoneda(d.monto_aplicado)}</td>
                        <td>C${formatearMoneda(d.saldo_despues)}</td>
                        <td>
                          <span className={`${styles.badge} ${claseBadge(d.estado_resultante)}`}>
                            {d.estado_resultante === "pagada" ? "Pagada" : "Parcial"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {excedente > 0 && (
                <p className={styles.distribucionExcedente}>
                  ⚠️ El monto ingresado supera la deuda total. Sobran C${formatearMoneda(excedente)}.
                </p>
              )}
            </div>
          )}

          {error && <span className="error-text">{error}</span>}
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={cerrar} disabled={guardando}>Cancelar</button>
          <button className="btn-guardar confirmar-venta-btn" onClick={confirmar} disabled={guardando || excedente > 0}>
            {guardando ? "Guardando..." : "✓ Confirmar Abono"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalAbonarCredito;