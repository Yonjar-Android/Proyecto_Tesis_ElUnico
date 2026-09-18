import { useEffect, useState } from "react";
import styles from "./ReporteDevoluciones.module.css";
import IconoBarras from "../IconoBarras"; // ajustar ruta
import { IconoCuboOutline, IconoTendencia } from "../IconosReporte"; // ajustar ruta
import { formatearMoneda, formatearFecha, obtenerFechaHoy } from "../../FuncionAuxiliar"; // ajustar ruta
import {
  obtenerReporteDevolucionesPorPeriodo,
} from "../../../services/reporte.service";
import {   
  descargarReporteDevolucionesExcel,
  descargarArchivoExcel, } from "../../../services/reporteExcel.service";
import type {
  RespuestaReporteDevoluciones,
  DevolucionReporte,
} from "../../../models/RespuestaReporteDevoluciones";
import { descargarReporteDevolucionesPdf } from "../../../services/reportePdf.service";
import { Joyride, type Step } from "react-joyride";
import { HelpCircle } from 'lucide-react';

function ReporteDevoluciones() {
  const [devoluciones, setDevoluciones] = useState<DevolucionReporte[]>([]);
  const [search, setSearch] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [errorFechas, setErrorFechas] = useState("");

  const [registrosTotales, setRegistrosTotales] = useState(0);
  const [productosDevueltos, setProductosDevueltos] = useState(0);
  const [totalDevuelto, setTotalDevuelto] = useState(0);

  const [exportando, setExportando] = useState(false);

  const [tourActivo, setTourActivo] = useState(false);
  const pasosTour: Step[] = [
  {
    target: '[data-tour="exportar-reporte"]',
    content: "Desde aquí puedes exportar el reporte en excel o pdf.",
  },
  {
    target: '[data-tour="filtrar-reporte"]',
    content: "Aquí puedes buscar clientes por su nombre, número o también filtrar por fecha.",
  },
  {
    target: '[data-tour="tabla-reporte"]',
    content: "Aquí puedes ver la lista de devoluciones y el total devuelto.",
  },
  {
    target: '[data-tour="paginacion-reporte"]',
    content: "Con estos botones puedes navegar entre las páginas de devoluciones para buscar alguna que no aparezca en la lista actual.",
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
    if (!validarFechas()) return;

    try {
      const response: RespuestaReporteDevoluciones = await obtenerReporteDevolucionesPorPeriodo(
        search,
        fechaInicio,
        fechaFin,
        currentPage,
        perPage
      );

      setDevoluciones(response.data);
      setLastPage(response.last_page);
      setRegistrosTotales(response.TotalRegistros);
      setProductosDevueltos(response.TotalProductosDevueltos);
      setTotalDevuelto(response.TotalDevuelto);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    buscar();
  }, [currentPage]);

  const exportar = async () => {
    setExportando(true);
    try {
      const blob = await descargarReporteDevolucionesExcel(search, fechaInicio, fechaFin);

      const fecha = new Date().toISOString().split("T")[0];
      const nombreArchivo = `reporte_devoluciones_${fecha}.xlsx`;

      descargarArchivoExcel(blob, nombreArchivo);

      console.log("Reporte exportado exitosamente");
    } catch (error) {
      console.error("Error al exportar:", error);
      alert("Error al exportar el reporte");
    } finally {
      setExportando(false);
    }
  };

  const handleDescargarPdfDevoluciones = async () => {
    try {
        const blob = await descargarReporteDevolucionesPdf(search, fechaInicio, fechaFin);
        descargarArchivoExcel(blob, `reporte_devoluciones_${fechaInicio}_a_${fechaFin}.pdf`);
    } catch (error) {
        console.error('Error al descargar PDF:', error);
    }
};

  return (
    <div className={styles["reporte-page"]}>
      <div className={styles["reporte-contenido"]}>
        <div className={styles["reporte-header"]}>
          <div>
            <h1>Reporte de Devoluciones</h1>
            <p className={styles["reporte-subtitulo"]}>
              Consulta las devoluciones registradas, el cliente y el monto devuelto.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
          <button className="categoria-add-btn" onClick={() => setTourActivo(true)}>
            <HelpCircle size={18} />
          </button>

          <div className={styles["botones-exportar"]}
          data-tour="exportar-reporte">

          <button
            className={styles["reporte-btn-exportar"]}
            onClick={exportar}
            disabled={exportando}
            data-tour="exportar-reporte"
          >
            <IconoBarras />
            {exportando ? "Exportando..." : "Exportar Excel"}
          </button>

          <button 
                className={styles["reporte-btn-exportarPdf"]}
                onClick={handleDescargarPdfDevoluciones}
                disabled={exportando}
                data-tour="exportar-reporte"
            >
                <IconoBarras />
                {exportando ? 'Exportando...' : 'Exportar Pdf'}
            </button>
            </div>
        </div>
        </div>

        <div className={styles["reporte-stats-row"]}>
          <div className={styles["reporte-stat-card"]}>
            <div className={styles["reporte-stat-header"]}>
              <span className={styles["reporte-stat-label"]}>Devoluciones registradas</span>
              <span className={styles["reporte-stat-icono"]}>
                <IconoCuboOutline />
              </span>
            </div>
            <span className={styles["reporte-stat-valor"]}>{registrosTotales}</span>
          </div>

          <div className={styles["reporte-stat-card"]}>
            <div className={styles["reporte-stat-header"]}>
              <span className={styles["reporte-stat-label"]}>Productos devueltos</span>
              <span className={styles["reporte-stat-icono"]}>
                <IconoCuboOutline />
              </span>
            </div>
            <span className={styles["reporte-stat-valor"]}>{productosDevueltos}</span>
          </div>

          <div className={`${styles["reporte-stat-card"]} ${styles["reporte-stat-card--oscura"]}`}>
            <div className={styles["reporte-stat-header"]}>
              <span className={styles["reporte-stat-label"]}>Total devuelto</span>
              <span className={`${styles["reporte-stat-icono"]} ${styles["reporte-stat-icono--rojo"]}`}>
                <IconoTendencia />
              </span>
            </div>
            <span className={styles["reporte-stat-valor"]}>C$ {formatearMoneda(totalDevuelto)}</span>
          </div>
        </div>

        <div className={styles["reporte-filtro-row"]} data-tour="filtrar-reporte">
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
            <label>👤 Cliente</label>
            <input
              type="text"
              placeholder="Buscar por nombre o N° de cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            className={styles["reporte-btn-filtrar"]}
            onClick={() => {
              setCurrentPage(1);
              buscar();
            }}
          >
            🔍 Filtrar Datos
          </button>
        </div>

        <div className={styles["reporte-card-tabla"]}>
          <table className={styles["reporte-tabla"]} data-tour="tabla-reporte">
            <thead>
              <tr>
                <th>Fecha</th>
                <th className={styles["reporte-td-centro"]}>N° Factura</th>
                <th>Cliente</th>
                <th className={styles["reporte-td-centro"]}>Cant. Productos</th>
                <th className={styles["reporte-th-derecha"]}>Total Devuelto</th>
              </tr>
            </thead>
            <tbody>
              {devoluciones.map((d) => (
                <tr key={d.id}>
                  <td>{formatearFecha(d.Fecha)}</td>
                  <td className={styles["reporte-td-centro"]}>{d.NFactura}</td>
                  <td className={styles["reporte-td-nombre"]}>{d.Cliente}</td>
                  <td className={styles["reporte-td-centro"]}>{d.CantidadProductos}</td>
                  <td className={styles["reporte-td-derecha"]}>C$ {formatearMoneda(d.TotalDevuelto)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {devoluciones.length === 0 && (
            <div className={styles["reporte-footer"]}>
              <span className={styles["reporte-count"]}>No hay devoluciones registradas en este rango.</span>
            </div>
          )}

          <div className={styles["reporte-footer"]}>
            <span className={styles["reporte-pagina-info"]}>
              Página <strong>{currentPage}</strong> de <strong>{lastPage}</strong>
            </span>
            <div className={styles["reporte-pagination"]} data-tour="paginacion-reporte">
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
    </div>
  );
}

export default ReporteDevoluciones;