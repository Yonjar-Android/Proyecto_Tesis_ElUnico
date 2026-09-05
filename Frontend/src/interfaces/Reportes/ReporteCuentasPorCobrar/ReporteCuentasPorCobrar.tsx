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

        <div className={styles["reporte-filtro-row"]}>
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

        <div className={styles["reporte-card-tabla"]}>
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

          <div className={styles["reporte-footer"]}>
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
    </div>
  );
}

export default ReporteCuentasPorCobrar;