import { useEffect, useState } from "react";
import styles from "./ReporteVentas.module.css";
import IconoBarras from "../IconoBarras";
import { IconoCuboOutline, IconoTendencia } from "../IconosReporte";
import { obtenerReporteVentasPorPeriodo, /*exportarReporteVentas*/ } from "../../../services/reporte.service";
import type { VentaReporte } from "../../../models/VentaReportes";
import type { Cliente } from "../../../models/Cliente";
import type { PaginatedResponse } from "../../../models/PaginatedResponse";
import { formatearMoneda } from "../../FuncionAuxiliar";
import ModalConfirmarImpresion from "../../Facturacion/ModalConfirmarImpresion"; // ajusta ruta
import type { DatosRecibo } from "../../../models/Recibo";
import { Printer } from "lucide-react";
import { obtenerReciboVenta } from "../../../services/venta.service";
import ModalSeleccionarCliente from "../../Facturacion/ModalSeleccionarCliente";
import { 
    descargarReporteVentasExcel, 
    descargarArchivoExcel 
} from "../../../services/reporteExcel.service.js";

export interface RespuestaReporteVentas extends PaginatedResponse<VentaReporte> {
  TotalRegistros: number;
  VentasContado: number;
  TotalVentas: number;
}

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

function ReporteVentas() {
  const [ventas, setVentas] = useState<VentaReporte[]>([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [modalClienteAbierto, setModalClienteAbierto] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [errorFechas, setErrorFechas] = useState("");
  const [tipoPago, setTipoPago] = useState("");
  const [estado, setEstado] = useState("");

  const [registrosTotales, setRegistrosTotales] = useState(0);
  const [ventasContado, setVentasContado] = useState(0);
  const [totalVentas, setTotalVentas] = useState(0);

  const [modalReciboAbierto, setModalReciboAbierto] = useState(false);
  const [datosRecibo, setDatosRecibo] = useState<DatosRecibo | null>(null);
    
  const [exportando, setExportando] = useState(false);

const imprimirTicket = async (idVenta: number) => {
  try {
    const recibo = await obtenerReciboVenta(idVenta);
    setDatosRecibo(recibo);
    setModalReciboAbierto(true);
  } catch (error) {
    console.error(error);
  }
};

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
  try {

    const search = clienteSeleccionado
      ? `${clienteSeleccionado.Nombre} ${clienteSeleccionado.Apellido}`
      : "";

    const response: RespuestaReporteVentas = await obtenerReporteVentasPorPeriodo(
      search,
      fechaInicio,
      fechaFin,
      tipoPago,
      estado,
      currentPage,
      perPage
    );

    setVentas(response.data);
    setLastPage(response.last_page);
    setRegistrosTotales(response.TotalRegistros);
    setVentasContado(response.VentasContado);
    setTotalVentas(response.TotalVentas);
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
          const search = clienteSeleccionado
          ? `${clienteSeleccionado.Nombre} ${clienteSeleccionado.Apellido}`
          : "";
          
            // Obtener el blob del reporte Excel
            const blob = await descargarReporteVentasExcel(search, fechaInicio, fechaFin, tipoPago, estado);
            
            // Generar nombre del archivo con fecha actual
            const fecha = new Date().toISOString().split('T')[0];
            const nombreArchivo = `reporte_ventas_${fecha}.xlsx`;
            
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
            <h1>Reporte de Ventas</h1>
            <p className={styles["reporte-subtitulo"]}>Monitoreo de flujos y operaciones de la empresa.</p>
          </div>

                    <button 
                className={styles["reporte-btn-exportar"]}
                onClick={exportar}
                disabled={exportando}
            >
                <IconoBarras />
                {exportando ? 'Exportando...' : 'Exportar Excel'}
            </button>
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

          <div className={styles["reporte-stat-card"]}>
            <div className={styles["reporte-stat-header"]}>
              <span className={styles["reporte-stat-label"]}>Ventas al contado</span>
              <span className={`${styles["reporte-stat-icono"]} ${styles["reporte-stat-icono--verde"]}`}>
                <IconoTendencia />
              </span>
            </div>
            <span className={styles["reporte-stat-valor"]}>C$ {formatearMoneda(ventasContado)}</span>
          </div>

          <div className={`${styles["reporte-stat-card"]} ${styles["reporte-stat-card--oscura"]}`}>
            <div className={styles["reporte-stat-header"]}>
              <span className={styles["reporte-stat-label"]}>Total ventas</span>
              <span className={styles["reporte-stat-icono"]}>
                <IconoTendencia />
              </span>
            </div>
            <span className={styles["reporte-stat-valor"]}>C$ {formatearMoneda(totalVentas)}</span>
          </div>
        </div>

<div className={styles["reporte-filtro-row"]}>
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
      <label>▽ Cliente</label>
      <div className={styles["reporte-selector-cliente"]}>
        <button
          type="button"
          className={styles["factura-selector-btn"]}
          onClick={() => setModalClienteAbierto(true)}
        >
          {clienteSeleccionado
            ? `${clienteSeleccionado.Nombre} ${clienteSeleccionado.Apellido}`
            : "Todos los clientes"}
        </button>

        {clienteSeleccionado && (
          <button
            type="button"
            className={styles["reporte-btn-limpiar-cliente"]}
            onClick={() => setClienteSeleccionado(null)}
            aria-label="Quitar filtro de cliente"
            title="Quitar filtro"
          >
            ✕
          </button>
        )}

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
  </div>

  <div className={styles["reporte-filtro-fila-2"]}>
    <div className={styles["reporte-campo"]}>
      <label>💳 Tipo de pago</label>
      <select
        value={tipoPago}
        onChange={(e) => setTipoPago(e.target.value)}
      >
        <option value="">Todos</option>
        <option value="CONTADO">Contado</option>
        <option value="TRANSFERENCIA">Transferencia</option>
        <option value="CREDITO">Crédito</option>
      </select>
    </div>

    <div className={styles["reporte-campo"]}>
      <label>📌 Estado</label>
      <select
        value={estado}
        onChange={(e) => setEstado(e.target.value)}
      >
        <option value="">Todos</option>
        <option value="Pagada">Pagada</option>
        <option value="Devuelta">Devuelta</option>
        <option value="Pendiente">Pendiente</option>
      </select>
    </div>
  </div>
</div>
        <div className={styles["reporte-card-tabla"]}>
          <table className={styles["reporte-tabla"]}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Tipo de pago</th>
                <th className={styles["reporte-th-derecha"]}>Monto</th>
                <th className={styles["reporte-th-derecha"]}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <tr key={venta.id}>
                  <td>{formatearFecha(venta.Fecha)}</td>
                  <td className={styles["reporte-td-nombre"]}>{venta.Cliente}</td>
                  <td>
                    <span
                      className={
                        venta.Estado === "Pagada"
                          ? styles["reporte-badge-pagada"]
                          : venta.Estado === "Pendiente"
                          ? styles["reporte-badge-pendiente"]
                          : styles["reporte-badge-devuelta"]
                      }
                    >
                      {venta.Estado}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                          venta.Tipo_Pago === "Contado"
                          ? styles["reporte-badge-contado"]
                          : venta.Tipo_Pago === "Credito"
                          ? styles["reporte-badge-credito"]
                          : styles["reporte-badge-transferencia"]
                      }
                    >
                      {venta.Tipo_Pago}
                    </span>
                  </td>
                  <td className={styles["reporte-td-derecha"]}>C$ {formatearMoneda(venta.Total)}</td>
                  <td className={styles["reporte-td-derecha"]}>
  <button
    className={styles["reporte-btn-imprimir"]}
    onClick={() => imprimirTicket(venta.id)}
    aria-label="Imprimir recibo"
    title="Imprimir recibo"
  >
    <Printer size={24} />
  </button>
</td>
                </tr>
              ))}
            </tbody>
          </table>

          {ventas.length === 0 && (
            <div className={styles["reporte-footer"]}>
              <span className={styles["reporte-count"]}>No hay ventas registradas en este rango.</span>
            </div>
          )}

          <div className={styles["reporte-footer"]}>
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
      <ModalConfirmarImpresion
  abierto={modalReciboAbierto}
  datos={datosRecibo}
  onClose={() => setModalReciboAbierto(false)}
/>


  <ModalSeleccionarCliente
  abierto={modalClienteAbierto}
  onClose={() => setModalClienteAbierto(false)}
  onSeleccionar={(cliente) => {
    setClienteSeleccionado(cliente);
    setModalClienteAbierto(false);
  }}
/>
    </div>
  );

}

export default ReporteVentas;