import { useEffect, useState } from "react";
import styles from "./ReporteVentasProducto.module.css";
import IconoBarras from "../IconoBarras"; // ajustar ruta según ubicación real del componente
import { IconoCuboOutline, IconoTendencia } from "../IconosReporte"; // ajustar ruta según ubicación real del componente
import { formatearMoneda, obtenerFechaHoy } from "../../FuncionAuxiliar"; // ajustar ruta según ubicación real del componente
import {
    obtenerReporteVentasProductosPorPeriodo,
} from "../../../services/reporte.service";
import { descargarArchivoExcel, descargarReporteVentasProductoExcel } from "../../../services/reporteExcel.service";
import { descargarReporteVentasProductoPdf } from "../../../services/reportePdf.service";
import type { RespuestaReporteVentasProductos, DetalleVentaProducto } from "../../../models/DetalleVentaProducto";
import { Joyride, type Step } from "react-joyride";
import { HelpCircle } from 'lucide-react';

function ReporteVentasProducto() {
  const [detalles, setDetalles] = useState<DetalleVentaProducto[]>([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [productoBuscado, setProductoBuscado] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [errorFechas, setErrorFechas] = useState("");

  const [registrosTotales, setRegistrosTotales] = useState(0);
  const [totalFacturadoProductos, setTotalFacturadoProductos] = useState(0);

  const [exportando, setExportando] = useState(false);

  const [tourActivo, setTourActivo] = useState(false);
 const pasosTour: Step[] = [
  {
    target: '[data-tour="exportar-reporte"]',
    content: "Desde aquí puedes exportar el reporte en excel o pdf.",
  },
  {
    target: '[data-tour="filtrar-reporte"]',
    content: "Aquí puedes buscar productos por su nombre o también filtrar por fecha.",
  },
  {
    target: '[data-tour="tabla-reporte"]',
    content: "Aquí puedes ver la lista de productos y las ventas generadas.",
  },
  {
    target: '[data-tour="paginacion-reporte"]',
    content: "Con estos botones puedes navegar entre las páginas de productos para buscar alguno que no aparezca en la lista actual.",
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
      const response: RespuestaReporteVentasProductos = await obtenerReporteVentasProductosPorPeriodo(
        productoBuscado,
        fechaInicio,
        fechaFin,
        currentPage,
        perPage
      );

      setDetalles(response.data);
      setLastPage(response.last_page);
      setRegistrosTotales(response.TotalRegistros);
      setTotalFacturadoProductos(response.TotalFacturadoProductos);
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
       const blob = await descargarReporteVentasProductoExcel(
         productoBuscado,
         fechaInicio,
         fechaFin
       );
      
       const fecha = new Date().toISOString().split("T")[0];
       const nombreArchivo = `reporte_ventas_producto_${fecha}.xlsx`;
       descargarArchivoExcel(blob, nombreArchivo);

    } catch (error) {
      console.error("Error al exportar:", error);
    } finally {
      setExportando(false);
    }
  };

  const handleDescargarPdfProducto = async () => {
    try {
        const blob = await descargarReporteVentasProductoPdf(productoBuscado, fechaInicio, fechaFin);
        descargarArchivoExcel(blob, `reporte_ventas_producto_${fechaInicio}_a_${fechaFin}.pdf`);
    } catch (error) {
        console.error('Error al descargar PDF:', error);
    }
};

  return (
    <div className={styles["reporte-page"]}>
      <div className={styles["reporte-contenido"]}>
        <div className={styles["reporte-header"]}>
          <div>
            <h1>Reporte de Ventas por Producto</h1>
            <p className={styles["reporte-subtitulo"]}>
              Consulta los productos facturados y el total generado por cada uno.
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
                onClick={handleDescargarPdfProducto}
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
              <span className={styles["reporte-stat-label"]}>Productos distintos</span>
              <span className={styles["reporte-stat-icono"]}>
                <IconoCuboOutline />
              </span>
            </div>
            <span className={styles["reporte-stat-valor"]}>{registrosTotales}</span>
          </div>

          <div className={`${styles["reporte-stat-card"]} ${styles["reporte-stat-card--oscura"]}`}>
            <div className={styles["reporte-stat-header"]}>
              <span className={styles["reporte-stat-label"]}>Total facturado en productos</span>
              <span className={`${styles["reporte-stat-icono"]} ${styles["reporte-stat-icono--verde"]}`}>
                <IconoTendencia />
              </span>
            </div>
            <span className={styles["reporte-stat-valor"]}>
              C$ {formatearMoneda(totalFacturadoProductos)}
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
              <label>📦 Producto</label>
              <input
                type="text"
                placeholder="Buscar por nombre de producto..."
                value={productoBuscado}
                onChange={(e) => setProductoBuscado(e.target.value)}
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
                <th>Producto</th>
                <th className={styles["reporte-td-centro"]}>Cantidad</th>
                <th className={styles["reporte-th-derecha"]}>Descuento</th>
                <th className={styles["reporte-th-derecha"]}>Total</th>
              </tr>
            </thead>
            <tbody>
              {detalles.map((d) => (
                <tr key={d.Id_producto}>
                  <td className={styles["reporte-td-nombre"]}>{d.Nombre_producto}</td>
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
                No hay productos facturados en este rango.
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

export default ReporteVentasProducto;