import { useEffect, useState } from "react";
import styles from "./ReporteCaja.module.css";
import IconoBarras from "../IconoBarras";
import { HelpCircle, FileText, Wallet, TrendingUp, TrendingDown, Coins, Scale } from "lucide-react";
import {
  obtenerReporteArqueoPorPeriodo,
  obtenerDetalleArqueo,
} from "../../../services/reporte.service";
import {
  descargarReporteArqueoPeriodoExcel,
  descargarArchivoExcel,
} from "../../../services/reporteExcel.service";
import { descargarReporteArqueoPeriodoPdf } from "../../../services/reportePdf.service";
import type { ArqueoCajaItem, RespuestaReporteArqueo, DetalleArqueoDTO } from "../../../models/ArqueoCajaReporte";
import { formatearMoneda, obtenerFechaHoy } from "../../FuncionAuxiliar";
import ModalDetalleArqueo from "./ModalDetalleArqueo";
import { Joyride, type Step } from "react-joyride";

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

export default function ReporteArqueoPeriodo() {
  const [arqueos, setArqueos] = useState<ArqueoCajaItem[]>([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [estado, setEstado] = useState("");
  const [search, setSearch] = useState("");
  const [errorFechas, setErrorFechas] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);

  // Estadísticas consolidadas
  const [registrosTotales, setRegistrosTotales] = useState(0);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalEgresos, setTotalEgresos] = useState(0);
  const [totalContado, setTotalContado] = useState(0);
  const [totalDiferencia, setTotalDiferencia] = useState(0);

  const [exportando, setExportando] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [detalleArqueo, setDetalleArqueo] = useState<DetalleArqueoDTO | null>(null);

  const [tourActivo, setTourActivo] = useState(false);
  const pasosTour: Step[] = [
    {
      target: '[data-tour="exportar-reporte"]',
      content: "Desde aquí puedes exportar el reporte de arqueos en Excel o PDF.",
    },
    {
      target: '[data-tour="stats-reporte"]',
      content: "Métricas consolidadas de las sesiones: total de ingresos, egresos, efectivo contado y diferencias netas.",
    },
    {
      target: '[data-tour="filtrar-reporte"]',
      content: "Filtra arqueos por rango de fecha, estado de caja (Abierta o Cerrada) o búsqueda por cajero y nota.",
    },
    {
      target: '[data-tour="tabla-reporte"]',
      content: "Lista detallada de las sesiones de caja con montos de apertura, ingresos, cuadre y botón de detalle completo.",
    },
    {
      target: '[data-tour="paginacion-reporte"]',
      content: "Navega entre las páginas para revisar arqueos anteriores.",
    },
  ];

  const validarFechas = (): boolean => {
    const hoy = obtenerFechaHoy();

    if (fechaInicio && fechaInicio > hoy) {
      setErrorFechas("La fecha de inicio no puede ser mayor a la fecha actual.");
      return false;
    }

    if (fechaFin && fechaFin > hoy) {
      setErrorFechas("La fecha de fin no puede ser mayor a la fecha actual.");
      return false;
    }

    if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
      setErrorFechas("La fecha de fin no puede ser menor que la fecha de inicio.");
      return false;
    }

    setErrorFechas("");
    return true;
  };

  useEffect(() => {
    validarFechas();
  }, [fechaInicio, fechaFin]);

  const buscar = async () => {
    try {
      const response: RespuestaReporteArqueo = await obtenerReporteArqueoPorPeriodo(
        search,
        fechaInicio,
        fechaFin,
        estado,
        currentPage,
        perPage
      );

      setArqueos(response.data || []);
      setLastPage(response.last_page || 1);
      setRegistrosTotales(response.TotalRegistros || 0);
      setTotalApertura(response.TotalAperturaCordobas || 0);
      setTotalIngresos(response.TotalIngresos || 0);
      setTotalEgresos(response.TotalEgresos || 0);
      setTotalContado(response.TotalEfectivoContado || 0);
      setTotalDiferencia(response.TotalDiferencia || 0);
      setTotalSobrantes(response.TotalSobrantes || 0);
      setTotalFaltantes(response.TotalFaltantes || 0);
    } catch (error) {
      console.error("Error al obtener reporte de arqueos por período:", error);
    }
  };

  useEffect(() => {
    buscar();
  }, [currentPage]);

  const exportarExcel = async () => {
    setExportando(true);
    try {
      const blob = await descargarReporteArqueoPeriodoExcel(search, fechaInicio, fechaFin, estado);
      const fecha = new Date().toISOString().split("T")[0];
      const nombreArchivo = `reporte_arqueo_periodo_${fecha}.xlsx`;
      descargarArchivoExcel(blob, nombreArchivo);
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      alert("Error al exportar el reporte a Excel");
    } finally {
      setExportando(false);
    }
  };

  const exportarPdf = async () => {
    setExportando(true);
    try {
      const blob = await descargarReporteArqueoPeriodoPdf(search, fechaInicio, fechaFin, estado);
      const fecha = new Date().toISOString().split("T")[0];
      const nombreArchivo = `reporte_arqueo_periodo_${fechaInicio || "inicio"}_a_${fechaFin || fecha}.pdf`;
      descargarArchivoExcel(blob, nombreArchivo);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      alert("Error al exportar el reporte a PDF");
    } finally {
      setExportando(false);
    }
  };

  const verDetalle = async (idSesion: number) => {
    try {
      const data = await obtenerDetalleArqueo(idSesion);
      setDetalleArqueo(data);
      setModalDetalleAbierto(true);
    } catch (error) {
      console.error("Error al cargar detalle del arqueo:", error);
      alert("No se pudo obtener el detalle de la sesión de caja.");
    }
  };

  return (
    <div className={styles["reporte-page"]}>
      <div className={styles["reporte-contenido"]}>
        {/* Header */}
        <div className={styles["reporte-header"]}>
          <div>
            <h1>Reporte de Arqueo de Caja por Período</h1>
            <p className={styles["reporte-subtitulo"]}>
              Auditoría y conciliación de sesiones de caja, ingresos, egresos y cuadres por rango de fechas.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="categoria-add-btn"
              onClick={() => setTourActivo(true)}
              title="Guía interactiva"
            >
              <HelpCircle size={18} />
            </button>

            <div className={styles["botones-exportar"]} data-tour="exportar-reporte">
              <button
                className={styles["reporte-btn-exportar"]}
                onClick={exportarExcel}
                disabled={exportando}
              >
                <IconoBarras />
                {exportando ? "Exportando..." : "Exportar Excel"}
              </button>

              <button
                className={styles["reporte-btn-exportarPdf"]}
                onClick={exportarPdf}
                disabled={exportando}
              >
                <IconoBarras />
                {exportando ? "Exportando..." : "Exportar Pdf"}
              </button>
            </div>
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className={styles["reporte-stats-row"]} data-tour="stats-reporte">
          <div className={styles["reporte-stat-card"]}>
            <div className={styles["reporte-stat-header"]}>
              <span className={styles["reporte-stat-label"]}>Sesiones evaluadas</span>
              <span className={`${styles["reporte-stat-icono"]} ${styles["reporte-stat-icono--azul"]}`}>
                <Wallet size={18} />
              </span>
            </div>
            <span className={styles["reporte-stat-valor"]}>{registrosTotales}</span>
          </div>

          <div className={styles["reporte-stat-card"]}>
            <div className={styles["reporte-stat-header"]}>
              <span className={styles["reporte-stat-label"]}>Ingresos del sistema</span>
              <span className={`${styles["reporte-stat-icono"]} ${styles["reporte-stat-icono--verde"]}`}>
                <TrendingUp size={18} />
              </span>
            </div>
            <span className={styles["reporte-stat-valor"]}>C$ {formatearMoneda(totalIngresos)}</span>
          </div>

          <div className={styles["reporte-stat-card"]}>
            <div className={styles["reporte-stat-header"]}>
              <span className={styles["reporte-stat-label"]}>Egresos registrados</span>
              <span className={`${styles["reporte-stat-icono"]} ${styles["reporte-stat-icono--rojo"]}`}>
                <TrendingDown size={18} />
              </span>
            </div>
            <span className={styles["reporte-stat-valor"]}>C$ {formatearMoneda(totalEgresos)}</span>
          </div>

          <div className={`${styles["reporte-stat-card"]} ${styles["reporte-stat-card--oscura"]}`}>
            <div className={styles["reporte-stat-header"]}>
              <span className={styles["reporte-stat-label"]}>Efectivo contado cierre</span>
              <span className={styles["reporte-stat-icono"]}>
                <Coins size={18} />
              </span>
            </div>
            <span className={styles["reporte-stat-valor"]}>C$ {formatearMoneda(totalContado)}</span>
          </div>

          <div className={styles["reporte-stat-card"]}>
            <div className={styles["reporte-stat-header"]}>
              <span className={styles["reporte-stat-label"]}>Diferencia neta</span>
              <span className={`${styles["reporte-stat-icono"]} ${styles["reporte-stat-icono--ambar"]}`}>
                <Scale size={18} />
              </span>
            </div>
            <span
              className={styles["reporte-stat-valor"]}
              style={{
                color: totalDiferencia < 0 ? "#dc2626" : totalDiferencia > 0 ? "#16a34a" : "#0284c7",
              }}
            >
              C$ {formatearMoneda(totalDiferencia)}
            </span>
          </div>
        </div>

        {/* Filtros */}
        <div className={styles["reporte-filtro-row"]} data-tour="filtrar-reporte">
          <div className={styles["reporte-filtro-fila-1"]}>
            <div className={styles["reporte-fechas-grupo"]}>
              <div className={styles["reporte-fechas-fila"]}>
                <div className={styles["reporte-campo"]}>
                  <label>📅 Fecha inicio</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    max={obtenerFechaHoy()}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>

                <div className={styles["reporte-campo"]}>
                  <label>📅 Fecha fin</label>
                  <input
                    type="date"
                    value={fechaFin}
                    min={fechaInicio || undefined}
                    max={obtenerFechaHoy()}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </div>
              </div>
              {errorFechas && <span className={styles["reporte-error-fechas"]}>{errorFechas}</span>}
            </div>

            <div className={styles["reporte-campo"]}>
              <label>📌 Estado de Caja</label>
              <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="">Todos los estados</option>
                <option value="Cerrada">Cerrada</option>
                <option value="Abierta">Abierta</option>
              </select>
            </div>

            <div className={styles["reporte-campo"]} style={{ flex: 1, minWidth: "220px" }}>
              <label>🔍 Buscar</label>
              <input
                type="text"
                placeholder="Buscar por cajero, N° sesión u observaciones..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              className={styles["reporte-btn-filtrar"]}
              onClick={() => {
                if (!validarFechas()) return;
                setCurrentPage(1);
                buscar();
              }}
            >
              🔍 Filtrar Datos
            </button>
          </div>
        </div>

        {/* Tabla de arqueos */}
        <div className={styles["reporte-card-tabla"]} data-tour="tabla-reporte">
          <table className={styles["reporte-tabla"]}>
            <thead>
              <tr>
                <th className={styles["reporte-td-centro"]}>N° Sesión</th>
                <th>Cajero Responsable</th>
                <th>Fecha Apertura</th>
                <th>Fecha Cierre</th>
                <th className={styles["reporte-th-derecha"]}>Apertura C$</th>
                <th className={styles["reporte-th-derecha"]}>Ingresos</th>
                <th className={styles["reporte-th-derecha"]}>Egresos</th>
                <th className={styles["reporte-th-derecha"]}>Efectivo Contado</th>
                <th className={styles["reporte-th-derecha"]}>Diferencia</th>
                <th className={styles["reporte-td-centro"]}>Estado</th>
                <th className={styles["reporte-td-centro"]}>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {arqueos.map((s) => {
                const diff = Number(s.diferencia ?? 0);
                return (
                  <tr key={s.id_sesion}>
                    <td className={styles["reporte-td-centro"]}>
                      <strong>#{s.id_sesion}</strong>
                    </td>
                    <td className={styles["reporte-td-nombre"]}>{s.usuario_nombre || "Desconocido"}</td>
                    <td>{formatearFechaHora(s.fecha_apertura)}</td>
                    <td>{formatearFechaHora(s.fecha_cierre)}</td>
                    <td className={styles["reporte-td-derecha"]}>
                      C$ {formatearMoneda(Number(s.total_apertura_cordobas ?? s.monto_apertura_cordobas) || 0)}
                    </td>
                    <td className={styles["reporte-td-derecha"]} style={{ color: "#059669" }}>
                      + C$ {formatearMoneda(Number(s.total_ingresos_sistema) || 0)}
                    </td>
                    <td className={styles["reporte-td-derecha"]} style={{ color: "#dc2626" }}>
                      - C$ {formatearMoneda(Number(s.total_egresos_sistema) || 0)}
                    </td>
                    <td className={styles["reporte-td-derecha"]}>
                      C$ {formatearMoneda(Number(s.total_efectivo_contado) || 0)}
                    </td>
                    <td className={styles["reporte-td-derecha"]}>
                      <span
                        className={
                          diff > 0
                            ? styles["reporte-badge-sobrante"]
                            : diff < 0
                            ? styles["reporte-badge-faltante"]
                            : styles["reporte-badge-cuadre"]
                        }
                      >
                        {diff > 0 ? `+C$ ${formatearMoneda(diff)}` : diff < 0 ? `-C$ ${formatearMoneda(Math.abs(diff))}` : "C$ 0.00"}
                      </span>
                    </td>
                    <td className={styles["reporte-td-centro"]}>
                      <span
                        className={
                          s.estado === "Cerrada"
                            ? styles["reporte-badge-cerrada"]
                            : styles["reporte-badge-abierta"]
                        }
                      >
                        {s.estado}
                      </span>
                    </td>
                    <td className={styles["reporte-td-centro"]}>
                      <button
                        className={styles["reporte-btn-detalle"]}
                        onClick={() => verDetalle(s.id_sesion)}
                        title="Ver desglose completo de la sesión"
                      >
                        <FileText size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {arqueos.length === 0 && (
            <div className={styles["reporte-footer"]}>
              <span className={styles["reporte-count"]}>
                No hay sesiones de arqueo registradas en este período o criterio.
              </span>
            </div>
          )}

          {/* Paginación */}
          <div className={styles["reporte-footer"]} data-tour="paginacion-reporte">
            <span className={styles["reporte-pagina-info"]}>
              Página <strong>{currentPage}</strong> de <strong>{lastPage}</strong> (Total: {registrosTotales} arqueos)
            </span>
            <div className={styles["reporte-pagination"]}>
              <button
                className={styles["reporte-page-btn"]}
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                «
              </button>
              <button
                className={styles["reporte-page-btn"]}
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              <button className={`${styles["reporte-page-btn"]} ${styles["reporte-page-btn--active"]}`}>
                {currentPage}
              </button>
              <button
                className={styles["reporte-page-btn"]}
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === lastPage || lastPage === 0}
              >
                ›
              </button>
              <button
                className={styles["reporte-page-btn"]}
                onClick={() => setCurrentPage(lastPage)}
                disabled={currentPage === lastPage || lastPage === 0}
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>

      <Joyride
        steps={pasosTour}
        run={tourActivo}
        continuous
        locale={{
          back: "Atrás",
          close: "Cerrar",
          last: "Finalizar",
          next: "Siguiente",
          skip: "Omitir",
        }}
        onEvent={(data) => {
          if (data.type === "tour:end") {
            setTourActivo(false);
          }
        }}
      />

      <ModalDetalleArqueo
        abierto={modalDetalleAbierto}
        datos={detalleArqueo}
        onClose={() => setModalDetalleAbierto(false)}
      />
    </div>
  );
}
