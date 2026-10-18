import { useEffect, useState } from "react";
import { Eye, SquarePen } from "lucide-react";
import { formatearMoneda } from "../FuncionAuxiliar";
import { obtenerHistorialVentas } from "../../services/venta.service";
import styles from "./HistorialVentas.module.css";

interface VentaResumen {
  idVenta: number;
  clienteNombre: string;
  estado: "Pagada" | "Pendiente" | "Anulada";
  tipoPago: string;
  total: number;
  tieneDevoluciones: boolean;
}

interface Paginacion {
  page: number;
  limit: number;
  total: number;
  totalPaginas: number;
}

interface Props {
  refrescar: number;
  onVerDetalle: (idVenta: number) => void;
  onEditar: (idVenta: number) => void;
}

function motivoNoEditable(v: VentaResumen): string | null {
  if (v.estado === "Anulada") return "Factura anulada";
  if (v.tipoPago.toUpperCase() === "CREDITO") return "Las facturas al crédito no se pueden editar";
  if (v.tieneDevoluciones) return "La factura tiene devoluciones";
  return null;
}

function HistorialVentas({ refrescar, onVerDetalle, onEditar }: Props) {
  const [ventas, setVentas] = useState<VentaResumen[]>([]);
  const [paginacion, setPaginacion] = useState<Paginacion | null>(null);
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError("");

    obtenerHistorialVentas(pagina, 10)
      .then((r) => {
        if (cancelado) return;
        setVentas(r.datos);
        setPaginacion(r.paginacion);
      })
      .catch((err: any) => {
        if (!cancelado)
          setError(err?.response?.data?.mensaje ?? "No se pudo cargar el historial de ventas.");
      })
      .finally(() => !cancelado && setCargando(false));

    return () => {
      cancelado = true;
    };
  }, [pagina, refrescar]);

  const claseEstado = (estado: string) =>
    estado === "Pagada" ? styles.estadoPagada : estado === "Anulada" ? styles.estadoAnulada : styles.estadoPendiente;

  return (
    <section className={styles.seccion} data-tour="historial-ventas">
      <h2 className={styles.titulo}>Historial de Ventas</h2>

      <div className={styles.card}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>N° Factura</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Tipo de pago</th>
              <th>Total</th>
              <th className={styles.thAccion}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v) => {
              const bloqueo = motivoNoEditable(v);
              return (
                <tr key={v.idVenta}>
                  <td>#{v.idVenta}</td>
                  <td>{v.clienteNombre}</td>
                  <td>
                    <span className={`${styles.estado} ${claseEstado(v.estado)}`}>{v.estado}</span>
                  </td>
                  <td>{v.tipoPago}</td>
                  <td className={styles.total}>C${formatearMoneda(v.total)}</td>
                  <td className={styles.tdAccion}>
                    <button
                      className={styles.btnAccion}
                      onClick={() => onVerDetalle(v.idVenta)}
                      aria-label="Ver detalle"
                      title="Ver detalle"
                    >
                      <Eye size={22} />
                    </button>
                    <button
                      className={styles.btnAccion}
                      onClick={() => onEditar(v.idVenta)}
                      disabled={bloqueo !== null}
                      aria-label="Editar factura"
                      title={bloqueo ?? "Editar"}
                    >
                      <SquarePen size={22} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {paginacion && paginacion.total > 0 && (
            <tfoot>
              <tr>
                <td colSpan={6}>
                  <div className={styles.footer}>
                    <span className={styles.count}>
                      Mostrando {ventas.length} de {paginacion.total} ventas
                    </span>
                    <div className={styles.pagination}>
                      <button className={styles.pageBtn} onClick={() => setPagina(1)} disabled={pagina === 1}>«</button>
                      <button className={styles.pageBtn} onClick={() => setPagina((p) => p - 1)} disabled={pagina === 1}>‹</button>
                      <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>{pagina}</button>
                      <button
                        className={styles.pageBtn}
                        onClick={() => setPagina((p) => p + 1)}
                        disabled={pagina >= paginacion.totalPaginas}
                      >›</button>
                      <button
                        className={styles.pageBtn}
                        onClick={() => setPagina(paginacion.totalPaginas)}
                        disabled={pagina >= paginacion.totalPaginas}
                      >»</button>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>

        {!cargando && ventas.length === 0 && !error && (
          <div className={styles.vacio}>Aún no hay ventas registradas.</div>
        )}
        {cargando && <div className={styles.vacio}>Cargando...</div>}
      </div>

      {error && <span className="error-text">{error}</span>}
    </section>
  );
}

export default HistorialVentas;