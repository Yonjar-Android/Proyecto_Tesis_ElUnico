import { useEffect, useState } from "react";
import "../Productos/ModalesSeleccion/ModalSeleccion.css";
import styles from "./ModalHistorialAbonos.module.css";
import { obtenerHistorialAbonos } from "../../services/abono.service";
import type { FacturaCreditoPendiente, AbonoHistorial } from "../../models/Credito";

function formatearMoneda(valor: number) {
  return valor.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function claseBadge(estado: AbonoHistorial["estado_cuota_resultante"]): string {
  return estado === "pagada" ? styles.badgePagada : styles.badgePagadaParcial;
}

interface Props {
  abierto: boolean;
  factura: FacturaCreditoPendiente;
  onClose: () => void;
}

function ModalHistorialAbonos({ abierto, factura, onClose }: Props) {
  const [abonos, setAbonos] = useState<AbonoHistorial[]>([]);
  const [cargando, setCargando] = useState(true);

  const buscar = async () => {
    try {
      setCargando(true);

      const response: AbonoHistorial[] = await obtenerHistorialAbonos(factura.id);

      setAbonos(response);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!abierto) return;
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, factura.id]);

  if (!abierto) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal modal-cliente ${styles.modalHistorial}`}>
        <div className="modal-header">
          <h2>Historial de Pagos — {factura.numero_factura}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className={`modal-body ${styles.modalBodyScroll}`}>
          <p className={styles.clienteInfo}>
            {factura.cliente_nombre} {factura.cliente_apellido}
          </p>

          {cargando ? (
            <p className={styles.estadoVacio}>Cargando historial...</p>
          ) : abonos.length === 0 ? (
            <p className={styles.estadoVacio}>Aún no hay abonos registrados.</p>
          ) : (
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Cuota</th>
                    <th>Fecha</th>
                    <th>Monto</th>
                    <th>Método</th>
                    <th>Estado cuota</th>
                  </tr>
                </thead>
                <tbody>
                  {abonos.map((a) => (
                    <tr key={a.id}>
                      <td>#{a.numero_cuota}</td>
                      <td>{a.fecha_abono}</td>
                      <td>C${formatearMoneda(a.monto_abonado)}</td>
                      <td>
                        {a.metodo_pago}
                        {a.referencia && (
                          <span className={styles.referencia}> ({a.referencia})</span>
                        )}
                      </td>
                      <td>
                        <span className={`${styles.badge} ${claseBadge(a.estado_cuota_resultante)}`}>
                          {a.estado_cuota_resultante === "pagada" ? "Pagada" : "Parcial"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default ModalHistorialAbonos;