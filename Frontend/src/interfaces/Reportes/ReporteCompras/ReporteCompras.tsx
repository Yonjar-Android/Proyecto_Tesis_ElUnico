import { useEffect, useState } from "react";
import styles from "./ReporteCompras.module.css";
import IconoBarras from "../IconoBarras";
import { IconoCuboOutline, IconoCarrito } from "../IconosReporte";
import { obtenerReporteComprasPorPeriodo, /*exportarReporteCompras*/ } from "../../../services/reporte.service";
import type { Proveedor } from "../../../models/Proveedor";
import type { CompraReporte, RespuestaReporteCompras } from "../../../models/CompraReporte";
import { formatearMoneda } from "../../FuncionAuxiliar";
import ModalDetalleCompra, { type DetalleCompraDTO } from "./ModalDetalleCompras";
import { FileText, HelpCircle } from "lucide-react";
import { obtenerDetalleCompra } from "../../../services/compra.service";
import ModalSeleccionarProveedor from "../../Compras/ModalSeleccionarProveedor";
import { 
    descargarReporteComprasExcel, 
    descargarArchivoExcel 
} from "../../../services/reporteExcel.service.js";
import { Joyride, type Step } from "react-joyride";

export const formatearFecha = (fecha: string): string => {
  const date = new Date(fecha);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const obtenerFechaHoy = (): string => {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, "0");
  const day = String(hoy.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function ReporteCompras() {
  const [compras, setCompras] = useState<CompraReporte[]>([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
  const [modalProveedorAbierto, setModalProveedorAbierto] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(5);
  const [lastPage, setLastPage] = useState(1);
  const [errorFechas, setErrorFechas] = useState("");

  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [detalleCompra, setDetalleCompra] = useState<DetalleCompraDTO | null>(null);

  const [registrosTotales, setRegistrosTotales] = useState(0);
  const [totalCompras, setTotalCompras] = useState(0);

  const [exportando, setExportando] = useState(false);

   const [tourActivo, setTourActivo] = useState(false);
 const pasosTour: Step[] = [
  {
    target: '[data-tour="exportar-reporte"]',
    content: "Desde aquí puedes exportar el reporte de compras a Excel.",
  },
  {
    target: '[data-tour="filtrar-reporte"]',
    content: "Aquí puedes buscar compras por su fecha o proveedor.",
  },
  {
    target: '[data-tour="tabla-reporte"]',
    content: "Aquí puedes ver la lista de compras registradas.",
  },
  {
    target: '[data-tour="paginacion-reporte"]',
    content: "Con estos botones puedes navegar entre las páginas de compras para buscar alguna que no aparezca en la lista actual.",
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

  const verDetalleCompra = async (idCompra: number) => {
  try {
    const detalle = await obtenerDetalleCompra(idCompra);
    setDetalleCompra(detalle);
    setModalDetalleAbierto(true);
  } catch (error) {
    console.error(error);
  }
};

const buscar = async () => {
  try {
    const response: RespuestaReporteCompras = await obtenerReporteComprasPorPeriodo(
      "",
      fechaInicio,
      fechaFin,
      proveedorSeleccionado?.id ?? 0,
      currentPage,
      perPage
    );

    setCompras(response.data);
    setLastPage(response.last_page);
    setRegistrosTotales(response.TotalRegistros);
    setTotalCompras(response.TotalCompras);
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
            
              // Obtener el blob del reporte Excel
              const blob = await descargarReporteComprasExcel("", fechaInicio, fechaFin, proveedorSeleccionado?.id ?? 0);
              
              // Generar nombre del archivo con fecha actual
              const fecha = new Date().toISOString().split('T')[0];
              const nombreArchivo = `reporte_compras_${fecha}.xlsx`;
              
              // Descargar el archivo
              descargarArchivoExcel(blob, nombreArchivo);
              
              console.log('Reporte exportado exitosamente');
          } catch (error) {
              console.error('Error al exportar:', error);
              alert('Error al exportar el reporte');
          } finally {
              setExportando(false);
          }
      };

  return (
    <div className={styles["reporte-page"]}>
      <div className={styles["reporte-contenido"]}>
        <div className={styles["reporte-header"]}>
          <div>
            <h1>Reporte de Compras</h1>
            <p className={styles["reporte-subtitulo"]}>Monitoreo de flujos y operaciones de la empresa.</p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
        <button className="categoria-add-btn" onClick={() => setTourActivo(true)}>
            <HelpCircle size={18} />
          </button>

          <button className={styles["reporte-btn-exportar"]} onClick={exportar}
            data-tour="exportar-reporte">
            <IconoBarras />
            Exportar Excel
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
              <span className={styles["reporte-stat-label"]}>Total compras</span>
              <span className={`${styles["reporte-stat-icono"]} ${styles["reporte-stat-icono--azul"]}`}>
                <IconoCarrito />
              </span>
            </div>
            <span className={styles["reporte-stat-valor"]}>C$ {formatearMoneda(totalCompras)}</span>
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
  <label>▽ Proveedor</label>
  <div className={styles["reporte-selector-cliente"]}>
    <button
      type="button"
      className={styles["factura-selector-btn"]}
      onClick={() => setModalProveedorAbierto(true)}
    >
      {proveedorSeleccionado
        ? proveedorSeleccionado.Nombre_Empresa
        : "Todos los proveedores"}
    </button>

    {proveedorSeleccionado && (
      <button
        type="button"
        className={styles["reporte-btn-limpiar-cliente"]}
        onClick={() => setProveedorSeleccionado(null)}
        aria-label="Quitar filtro de proveedor"
        title="Quitar filtro"
      >
        ✕
      </button>
    )}
  </div>
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

        <div className={styles["reporte-card-tabla"]} data-tour="tabla-reporte">
          <table className={styles["reporte-tabla"]}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th className={styles["reporte-td-centro"]}>Proveedor</th>
                <th className={styles["reporte-td-centro"]}>N° Factura</th>
                <th className={styles["reporte-th-derecha"]}>Total</th>
                <th className={styles["reporte-th-derecha"]}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((compra) => (
                <tr key={compra.id}>
                  <td>{formatearFecha(compra.Fecha)}</td>
                  <td className={`${styles["reporte-td-centro"]} ${styles["reporte-td-nombre"]}`}>
                    {compra.Nombre_Empresa}
                  </td>
                  <td className={styles["reporte-td-factura"]}>{compra.NFactura}</td>
                  <td className={styles["reporte-td-derecha"]}>C$ {formatearMoneda(compra.Total)}</td>
                  <td className={styles["reporte-td-derecha"]}>
  <button className={styles["reporte-btn-imprimir"]} onClick={() => verDetalleCompra(compra.id)} title="Ver detalles">
    <FileText size={24} />
  </button>
</td>
                </tr>
              ))}
            </tbody>
          </table>

          {compras.length === 0 && (
            <div className={styles["reporte-footer"]}>
              <span className={styles["reporte-count"]}>No hay compras registradas en este rango.</span>
            </div>
          )}

          <div className={styles["reporte-footer"]} data-tour="paginacion-reporte">
            <span className={styles["reporte-pagina-info"]}>
              Página <strong>{currentPage}</strong> de <strong>{lastPage}</strong>
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
                disabled={currentPage === lastPage || lastPage == 0}
              >
                ›
              </button>
              <button
                className={styles["reporte-page-btn"]}
                onClick={() => setCurrentPage(lastPage)}
                disabled={currentPage === lastPage || lastPage == 0}
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
      <ModalDetalleCompra
  abierto={modalDetalleAbierto}
  datos={detalleCompra}
  onClose={() => setModalDetalleAbierto(false)}
/>

<ModalSeleccionarProveedor
  abierto={modalProveedorAbierto}
  onClose={() => setModalProveedorAbierto(false)}
  onSeleccionar={(proveedor) => {
    setProveedorSeleccionado(proveedor);
    setModalProveedorAbierto(false);
  }}
/>
    </div>
  );
}

export default ReporteCompras;