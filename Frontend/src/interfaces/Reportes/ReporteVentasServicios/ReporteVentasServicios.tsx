import { useEffect, useState } from "react";
import styles from "./ReporteVentasServicio.module.css";
import IconoBarras from "../IconoBarras"; // ajustar ruta según ubicación real del componente
import { IconoCuboOutline, IconoTendencia } from "../IconosReporte"; // ajustar ruta según ubicación real del componente
import { formatearMoneda, obtenerFechaHoy } from "../../FuncionAuxiliar"; // ajustar ruta según ubicación real del componente
import {
    obtenerReporteVentasServiciosPorPeriodo,
 } from "../../../services/reporte.service";
import { descargarReporteVentasServicioExcel, descargarArchivoExcel } from "../../../services/reporteExcel.service";
import type { RespuestaReporteVentasServicios, DetalleVentaServicio } from "../../../models/RespuestaReporteVentasServicios";
import { Joyride, type Step } from "react-joyride";
import { HelpCircle } from 'lucide-react';

function ReporteVentasServicio() {
  const [detalles, setDetalles] = useState<DetalleVentaServicio[]>([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [servicioBuscado, setServicioBuscado] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [errorFechas, setErrorFechas] = useState("");

  const [registrosTotales, setRegistrosTotales] = useState(0);
  const [totalFacturadoServicios, setTotalFacturadoServicios] = useState(0);

  const [exportando, setExportando] = useState(false);

 const [tourActivo, setTourActivo] = useState(false);
 const pasosTour: Step[] = [
  {
    target: '[data-tour="exportar-reporte"]',
    content: "Desde aquí puedes exportar el reporte a Excel.",
  },
  {
    target: '[data-tour="filtrar-reporte"]',
    content: "Aquí puedes buscar servicios por su nombre o también filtrar por fecha.",
  },
  {
    target: '[data-tour="tabla-reporte"]',
    content: "Aquí puedes ver la lista de servicios y las ventas generadas.",
  },
  {
    target: '[data-tour="paginacion-reporte"]',
    content: "Con estos botones puedes navegar entre las páginas de servicios para buscar alguno que no aparezca en la lista actual.",
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

  // Validación en vivo mientras el usuario cambia las fechas
  useEffect(() => {
    validarFechas();
  }, [fechaInicio, fechaFin]);

  const buscar = async () => {
    if (!validarFechas()) return;

    try {

       const response: RespuestaReporteVentasServicios = await obtenerReporteVentasServiciosPorPeriodo(
         servicioBuscado,
         fechaInicio,
         fechaFin,
         currentPage,
         perPage
       );
      
       setDetalles(response.data);
       setLastPage(response.last_page);
       setRegistrosTotales(response.TotalRegistros);

      setLastPage(1);
      setRegistrosTotales(response.data.length);
      setTotalFacturadoServicios(response.TotalFacturadoServicios);
      // --------------------------------------------------------------------------------------
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

       const blob = await descargarReporteVentasServicioExcel(
         servicioBuscado,
         fechaInicio,
         fechaFin
      );
      
       const fecha = new Date().toISOString().split("T")[0];
       const nombreArchivo = `reporte_ventas_servicio_${fecha}.xlsx`;
       descargarArchivoExcel(blob, nombreArchivo);

    } catch (error) {
      console.error("Error al exportar:", error);
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className={styles["reporte-page"]}>
      <div className={styles["reporte-contenido"]}>
        <div className={styles["reporte-header"]}>
          <div>
            <h1>Reporte de Ventas por Servicio</h1>
            <p className={styles["reporte-subtitulo"]}>
              Consulta los servicios facturados y el total generado por cada uno.
            </p>
          </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button className="categoria-add-btn" onClick={() => setTourActivo(true)}>
            <HelpCircle size={18} />
          </button>

          <button
            className={styles["reporte-btn-exportar"]}
            onClick={exportar}
            disabled={exportando}
            data-tour="exportar-reporte"
          >
            <IconoBarras />
            {exportando ? "Exportando..." : "Exportar Excel"}
          </button>
        </div>
        </div>

        <div className={styles["reporte-stats-row"]}>
          <div className={styles["reporte-stat-card"]}>
            <div className={styles["reporte-stat-header"]}>
              <span className={styles["reporte-stat-label"]}>Registros totales</span>
              <span className={styles["reporte-stat-icono"]}>
                <IconoCuboOutline />
              </span>
            </div>
            <span className={styles["reporte-stat-valor"]}>{registrosTotales}</span>
          </div>

          <div className={`${styles["reporte-stat-card"]} ${styles["reporte-stat-card--oscura"]}`}>
            <div className={styles["reporte-stat-header"]}>
              <span className={styles["reporte-stat-label"]}>Total facturado en servicios</span>
              <span className={`${styles["reporte-stat-icono"]} ${styles["reporte-stat-icono--verde"]}`}>
                <IconoTendencia />
              </span>
            </div>
            <span className={styles["reporte-stat-valor"]}>
              C$ {formatearMoneda(totalFacturadoServicios)}
            </span>
          </div>
        </div>

        <div className={styles["reporte-filtro-row"]}>
          <div className={styles["reporte-filtro-fila-1"]} data-tour="filtrar-reporte">
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
              <label>🛠 Servicio</label>
              <input
                type="text"
                placeholder="Buscar por nombre de servicio..."
                value={servicioBuscado}
                onChange={(e) => setServicioBuscado(e.target.value)}
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
        </div>

        <div className={styles["reporte-card-tabla"]}>
          <table className={styles["reporte-tabla"]} data-tour="tabla-reporte">
  <thead>
    <tr>
      <th>Servicio</th>
      <th className={styles["reporte-td-centro"]}>Cantidad</th>
      <th className={styles["reporte-th-derecha"]}>Descuento</th>
      <th className={styles["reporte-th-derecha"]}>Total</th>
    </tr>
  </thead>
  <tbody>
    {detalles.map((d) => (
      <tr key={d.Id_servicio}>
        <td className={styles["reporte-td-nombre"]}>{d.Nombre_servicio}</td>
        <td className={styles["reporte-td-centro"]}>{d.CantidadTotal}</td>
        <td className={styles["reporte-th-derecha"]}>C$ {formatearMoneda(d.TotalDescuento)}</td>
        <td className={styles["reporte-td-derecha"]}>C$ {formatearMoneda(d.TotalFacturado)}</td>
      </tr>
    ))}
  </tbody>
</table>

          {detalles.length === 0 && (
            <div className={styles["reporte-footer"]}>
              <span className={styles["reporte-count"]}>
                No hay servicios facturados en este rango.
              </span>
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

export default ReporteVentasServicio;