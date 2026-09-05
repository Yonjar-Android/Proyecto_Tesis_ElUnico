import { useEffect, useState } from "react";
import styles from "./ReporteCuentasPorCobrar.module.css";
import IconoBarras from "../IconoBarras";
import type { Cliente } from "../../../models/Cliente";
import { obtenerReporteCuentasCobrar, /*exportarCuentasPorCobrar*/ } from "../../../services/reporte.service";
import type { PaginatedResponse } from "../../../models/PaginatedResponse";
import { formatearMoneda, formatearTelefono } from "../../FuncionAuxiliar";
import { 
    descargarReporteCuentasCobrarExcel, 
    descargarArchivoExcel
} from "../../../services/reporteExcel.service.js";
import { Joyride, type Step } from "react-joyride";
import { HelpCircle } from 'lucide-react';

export interface RespuestaClientesConDeuda extends PaginatedResponse<Cliente> {
    TotalClientesConDeuda: number;
    TotalSaldoPendiente: number;
}

function ReporteCuentasPorCobrar() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  const [clientesConDeuda, setClientesConDeuda] = useState(0);
  const [totalSaldoPendiente, setTotalSaldoPendiente] = useState(0);

    // Estado para manejar la carga durante la exportación
    const [exportando, setExportando] = useState(false);

      const [tourActivo, setTourActivo] = useState(false);
 const pasosTour: Step[] = [
  {
    target: '[data-tour="exportar-reporte"]',
    content: "Desde aquí puedes exportar el reporte de cuentas por cobrar a Excel.",
  },
  {
    target: '[data-tour="filtrar-reporte"]',
    content: "Aquí puedes buscar clientes con deuda por su nombre o número de cliente.",
  },
  {
    target: '[data-tour="tabla-reporte"]',
    content: "Aquí puedes ver la lista de clientes con deuda.",
  },
  {
    target: '[data-tour="paginacion-reporte"]',
    content: "Con estos botones puedes navegar entre las páginas de clientes con deuda para buscar alguno que no aparezca en la lista actual.",
  },
];

  const buscar = async () => {
    try {
      const response: RespuestaClientesConDeuda = await obtenerReporteCuentasCobrar(
        searchTerm,
        currentPage,
        perPage
      );

      setClientes(response.data);
      setTotal(response.total);
      setLastPage(response.last_page);
      setClientesConDeuda(response.TotalClientesConDeuda);
      setTotalSaldoPendiente(response.TotalSaldoPendiente);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      buscar();
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, currentPage]);

  const exportar = async () => {
        setExportando(true);
        try {
            // Obtener el blob del reporte Excel
            const blob = await descargarReporteCuentasCobrarExcel(searchTerm);
            
            // Generar nombre del archivo con fecha actual
            const fecha = new Date().toISOString().split('T')[0];
            const nombreArchivo = `reporte_cuentas_cobrar_${fecha}.xlsx`;
            
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
            <h1>Reporte de Cuentas por Cobrar</h1>
            <p className={styles["reporte-subtitulo"]}>
              Monitoreo de clientes con saldo pendiente y saldos en morosidad.
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
                {exportando ? 'Exportando...' : 'Exportar Excel'}
            </button>
            </div>
        </div>

        <div className={styles["reporte-stats-row"]}>
          <div className={styles["reporte-stat-card"]}>
            <span className={styles["reporte-stat-label"]}>Clientes con deuda</span>
            <span className={styles["reporte-stat-valor"]}>{clientesConDeuda}</span>
          </div>

          <div className={`${styles["reporte-stat-card"]} ${styles["reporte-stat-card--oscura"]}`}>
            <span className={styles["reporte-stat-label"]}>Total saldo pendiente</span>
            <span className={styles["reporte-stat-valor"]}>
              C$ {formatearMoneda(totalSaldoPendiente)}
            </span>
          </div>
        </div>

        <div className={styles["reporte-filtro-row"]} data-tour="filtrar-reporte">
          <div className={styles["reporte-campo"]}>
            <label>Cliente / Buscar</label>
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o código..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className={styles["reporte-card-tabla"]} data-tour="tabla-reporte">
          <table className={styles["reporte-tabla"]}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Contacto</th>
                <th className={styles["reporte-th-derecha"]}>Crédito Pendiente</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.NCliente}</td>
                  <td className={styles["reporte-td-nombre"]}>{cliente.Nombre}</td>
                  <td>{cliente.Apellido}</td>
                  <td>{formatearTelefono(cliente.Telefono) || "Sin contacto"}</td>
                  <td className={styles["reporte-td-derecha"]}>
                    C$ {formatearMoneda(cliente.Saldo_Deuda)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles["reporte-footer"]} data-tour="paginacion-reporte">
            <span className={styles["reporte-count"]}>
              Mostrando {clientes.length} de {total} clientes con deuda
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
    </div>
  );
}

export default ReporteCuentasPorCobrar;