import { useEffect, useState } from "react";
import "../Reportes.css";
import IconoBarras from "../IconoBarras";
import type { Cliente } from "../../../models/Cliente";
import { obtenerReporteCuentasCobrar, /*exportarCuentasPorCobrar*/ } from "../../../services/reporte.service";
import type { PaginatedResponse } from "../../../models/PaginatedResponse";
import { formatearMoneda, formatearTelefono } from "../../FuncionAuxiliar";

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
    try {
      //await exportarCuentasPorCobrar(searchTerm);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="reporte-page">
      <div className="reporte-contenido">
        <div className="reporte-header">
          <div>
            <h1>Reporte de Cuentas por Cobrar</h1>
            <p className="reporte-subtitulo">
              Monitoreo de clientes con saldo pendiente y saldos en morosidad.
            </p>
          </div>

          <button className="reporte-btn-exportar" onClick={exportar}>
            <IconoBarras />
            Exportar Excel
          </button>
        </div>

        <div className="reporte-stats-row">
          <div className="reporte-stat-card">
            <span className="reporte-stat-label">Clientes con deuda</span>
            <span className="reporte-stat-valor">{clientesConDeuda}</span>
          </div>

          <div className="reporte-stat-card reporte-stat-card--oscura">
            <span className="reporte-stat-label">Total saldo pendiente</span>
            <span className="reporte-stat-valor">
              C$ {formatearMoneda(totalSaldoPendiente)}
            </span>
          </div>
        </div>

        <div className="reporte-filtro-row">
          <div className="reporte-campo">
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

          <button className="reporte-btn-filtrar" onClick={buscar}>
            Filtrar Datos
          </button>
        </div>

        <div className="reporte-card-tabla">
          <table className="reporte-tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Contacto</th>
                <th className="reporte-th-derecha">Crédito Pendiente</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.NCliente}</td>
                  <td className="reporte-td-nombre">{cliente.Nombre}</td>
                  <td>{cliente.Apellido}</td>
                  <td>{formatearTelefono(cliente.Telefono) || "Sin contacto"}</td>
                  <td className="reporte-td-derecha">
                    C$ {formatearMoneda(cliente.Saldo_Deuda)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="reporte-footer">
            <span className="reporte-count">
              Mostrando {clientes.length} de {total} clientes con deuda
            </span>
            <div className="reporte-pagination">
              <button
                className="reporte-page-btn"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                «
              </button>
              <button
                className="reporte-page-btn"
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              <button className="reporte-page-btn reporte-page-btn--active">
                {currentPage}
              </button>
              <button
                className="reporte-page-btn"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === lastPage || lastPage == 0}
              >
                ›
              </button>
              <button
                className="reporte-page-btn"
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