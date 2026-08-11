import { useEffect, useState } from "react";
import "../Reportes.css";
import IconoBarras from "../IconoBarras";
import { IconoCuboOutline, IconoTendencia } from "../IconosReporte";
import { obtenerReporteVentasPorPeriodo, /*exportarReporteVentas*/ } from "../../../services/reporte.service";
import type { VentaReporte } from "../../../models/VentaReportes";
import type { Cliente } from "../../../models/Cliente";
import type { PaginatedResponse } from "../../../models/PaginatedResponse";

export interface RespuestaReporteVentas extends PaginatedResponse<VentaReporte> {
  TotalRegistros: number;
  VentasContado: number;
  TotalVentas: number;
}

function formatearMoneda(valor: number) {
  return valor.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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

function ReporteVentas() {
  const [ventas, setVentas] = useState<VentaReporte[]>([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [clientes] = useState<Cliente[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);

  const [registrosTotales, setRegistrosTotales] = useState(0);
  const [ventasContado, setVentasContado] = useState(0);
  const [totalVentas, setTotalVentas] = useState(0);

  // Carga el combo de clientes una sola vez.
  /*useEffect(() => {
    buscarClientes("", 1, 100)
      .then((res: PaginatedResponse<ClienteOpcion>) => setClientes(res.data))
      .catch((error) => console.error(error));
  }, []);*/

  const buscar = async () => {
    try {
      const response: RespuestaReporteVentas = await obtenerReporteVentasPorPeriodo(
        "",
        fechaInicio,
        fechaFin,
        clienteId,
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
    try {
      //await exportarReporteVentas(fechaInicio, fechaFin, clienteId);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="reporte-page">
      <div className="reporte-contenido">
        <div className="reporte-header">
          <div>
            <h1>Reporte de Ventas</h1>
            <p className="reporte-subtitulo">Monitoreo de flujos y operaciones de la empresa.</p>
          </div>

          <button className="reporte-btn-exportar" onClick={exportar}>
            <IconoBarras />
            Exportar Excel
          </button>
        </div>

        <div className="reporte-stats-row">
          <div className="reporte-stat-card">
            <div className="reporte-stat-header">
              <span className="reporte-stat-label">Registros totales</span>
              <span className="reporte-stat-icono">
                <IconoCuboOutline />
              </span>
            </div>
            <span className="reporte-stat-valor">{registrosTotales}</span>
          </div>

          <div className="reporte-stat-card">
            <div className="reporte-stat-header">
              <span className="reporte-stat-label">Ventas al contado</span>
              <span className="reporte-stat-icono reporte-stat-icono--verde">
                <IconoTendencia />
              </span>
            </div>
            <span className="reporte-stat-valor">C$ {formatearMoneda(ventasContado)}</span>
          </div>

          <div className="reporte-stat-card reporte-stat-card--oscura">
            <div className="reporte-stat-header">
              <span className="reporte-stat-label">Total ventas</span>
              <span className="reporte-stat-icono">
                <IconoTendencia />
              </span>
            </div>
            <span className="reporte-stat-valor">C$ {formatearMoneda(totalVentas)}</span>
          </div>
        </div>

        <div className="reporte-filtro-row">
          <div className="reporte-campo">
            <label>📅 Fecha inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>

          <div className="reporte-campo">
            <label>📅 Fecha fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>

          <div className="reporte-campo">
            <label>▽ Cliente</label>
            <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              <option value="">Todas las opciones</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.Nombre} {cliente.Apellido}
                </option>
              ))}
            </select>
          </div>

          <button
            className="reporte-btn-filtrar"
            onClick={() => {
              setCurrentPage(1);
              buscar();
            }}
          >
            🔍 Filtrar Datos
          </button>
        </div>

        <div className="reporte-card-tabla">
          <table className="reporte-tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th className="reporte-th-derecha">Monto</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <tr key={venta.id}>
                  <td>{formatearFecha(venta.Fecha)}</td>
                  <td className="reporte-td-nombre">{venta.Cliente}</td>
                  <td>
                    <span
                      className={
                        venta.Tipo_Pago === "Contado"
                          ? "reporte-badge-contado"
                          : "reporte-badge-credito"
                      }
                    >
                      {venta.Tipo_Pago === "Contado" ? "Contado" : "Crédito"}
                    </span>
                  </td>
                  <td className="reporte-td-derecha">C$ {formatearMoneda(venta.Total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {ventas.length === 0 && (
            <div className="reporte-footer">
              <span className="reporte-count">No hay ventas registradas en este rango.</span>
            </div>
          )}

          <div className="reporte-footer">
            <span className="reporte-pagina-info">
              Página <strong>{currentPage}</strong> de <strong>{lastPage}</strong>
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

export default ReporteVentas;