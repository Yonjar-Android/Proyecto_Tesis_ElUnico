import styles from "./ModalDetalleArqueo.module.css";
import type { DetalleArqueoDTO } from "../../../models/ArqueoCajaReporte";
import { formatearMoneda } from "../../FuncionAuxiliar";

interface Props {
  abierto: boolean;
  datos: DetalleArqueoDTO | null;
  onClose: () => void;
}

function formatearFechaHora(fechaStr: string | null) {
  if (!fechaStr) return "---";
  try {
    const d = new Date(fechaStr);
    if (isNaN(d.getTime())) return fechaStr;
    return d.toLocaleDateString("es-NI", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return fechaStr;
  }
}

export default function ModalDetalleArqueo({ abierto, datos, onClose }: Props) {
  if (!abierto || !datos || !datos.sesion) return null;

  const s = datos.sesion;
  const dif = Number(s.diferencia ?? 0);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.caja} onClick={(e) => e.stopPropagation()}>
        <div className={styles.encabezado}>
          <div>
            <h3>Detalle de Sesión de Caja #{s.id_sesion}</h3>
            <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
              Responsable: <strong>{s.usuario_nombre || "Desconocido"}</strong>
            </span>
          </div>
          <button className={styles.cerrarX} onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className={styles.gridDatos}>
          <div className={styles.filaDato}>
            <label>Estado</label>
            <span>
              <span className={s.estado === "Cerrada" ? styles.badgeCerrada : styles.badgeAbierta}>
                {s.estado}
              </span>
            </span>
          </div>

          <div className={styles.filaDato}>
            <label>Fecha Apertura</label>
            <span>{formatearFechaHora(s.fecha_apertura)}</span>
          </div>

          <div className={styles.filaDato}>
            <label>Fecha Cierre</label>
            <span>{formatearFechaHora(s.fecha_cierre)}</span>
          </div>

          <div className={styles.filaDato}>
            <label>Apertura C$</label>
            <span>C$ {formatearMoneda(Number(s.monto_apertura_cordobas) || 0)}</span>
          </div>

          <div className={styles.filaDato}>
            <label>Apertura USD ($)</label>
            <span>$ {formatearMoneda(Number(s.monto_apertura_dolares) || 0)} (Tasa: {s.tasa_cambio})</span>
          </div>

          <div className={styles.filaDato}>
            <label>Total Apertura en C$</label>
            <span>C$ {formatearMoneda(Number(s.total_apertura_cordobas ?? s.monto_apertura_cordobas) || 0)}</span>
          </div>

          <div className={styles.filaDato}>
            <label>Ingresos del Sistema</label>
            <span style={{ color: "#059669" }}>+ C$ {formatearMoneda(Number(s.total_ingresos_sistema) || 0)}</span>
          </div>

          <div className={styles.filaDato}>
            <label>Egresos del Sistema</label>
            <span style={{ color: "#dc2626" }}>- C$ {formatearMoneda(Number(s.total_egresos_sistema) || 0)}</span>
          </div>

          <div className={styles.filaDato}>
            <label>Efectivo Físico Contado</label>
            <span>C$ {formatearMoneda(Number(s.total_efectivo_contado) || 0)}</span>
          </div>

          <div className={styles.filaDato}>
            <label>Tarjeta / Transferencias</label>
            <span>C$ {formatearMoneda(Number(s.total_tarjeta_transferencia) || 0)}</span>
          </div>

          <div className={styles.filaDato}>
            <label>Diferencia de Caja</label>
            <span
              className={
                dif > 0 ? styles.diffPositiva : dif < 0 ? styles.diffNegativa : styles.diffCuadrada
              }
            >
              {dif > 0 ? `+ C$ ${formatearMoneda(dif)} (Sobrante)` : dif < 0 ? `- C$ ${formatearMoneda(Math.abs(dif))} (Faltante)` : "C$ 0.00 (Cuadrada)"}
            </span>
          </div>
        </div>

        {s.observaciones && (
          <div className={styles.observacionesCaja}>
            <strong>Observaciones registradas:</strong> {s.observaciones}
          </div>
        )}

        {datos.egresos && datos.egresos.length > 0 && (
          <>
            <h4 className={styles.seccionTitulo}>📋 Egresos Registrados en la Sesión ({datos.egresos.length})</h4>
            <table className={styles.tablaDetalle}>
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Tipo</th>
                  <th>Método Pago</th>
                  <th className={styles.derecha}>Monto C$</th>
                </tr>
              </thead>
              <tbody>
                {datos.egresos.map((e) => (
                  <tr key={e.id_egreso}>
                    <td>{e.concepto}</td>
                    <td>{e.tipo_egreso}</td>
                    <td>{e.metodo_pago}</td>
                    <td className={styles.derecha}>C$ {formatearMoneda(Number(e.monto_cordobas) || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {datos.desgloseBilletes && datos.desgloseBilletes.length > 0 && (
          <>
            <h4 className={styles.seccionTitulo}>💵 Desglose de Conteo de Billetes</h4>
            <table className={styles.tablaDetalle}>
              <thead>
                <tr>
                  <th>Moneda</th>
                  <th className={styles.derecha}>Denominación</th>
                  <th className={styles.centro}>Cantidad</th>
                  <th className={styles.derecha}>Subtotal C$</th>
                </tr>
              </thead>
              <tbody>
                {datos.desgloseBilletes.map((b) => (
                  <tr key={b.id_desglose}>
                    <td>{b.moneda === "USD" ? "Dólares ($)" : "Córdobas (C$)"}</td>
                    <td className={styles.derecha}>{b.denominacion}</td>
                    <td className={styles.centro}>{b.cantidad}</td>
                    <td className={styles.derecha}>C$ {formatearMoneda(Number(b.subtotal_cordobas) || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <button className={styles.botonCerrar} onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
