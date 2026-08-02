import { useEffect, useState } from "react";
import "../Reportes.css";
import IconoBarras from "../IconoBarras";
import { IconoCuboOutline, IconoCarrito } from "../IconosReporte";
import { obtenerReporteComprasPorPeriodo, /*exportarReporteCompras*/ } from "../../../services/reporte.service";
import { buscarProveedores } from "../../../services/proveedor.service";
import type { Proveedor } from "../../../models/Proveedor";
import type { PaginatedResponse } from "../../../models/PaginatedResponse";
import type { CompraReporte, RespuestaReporteCompras } from "../../../models/CompraReporte";

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

function ReporteCompras() {
  const [compras, setCompras] = useState<CompraReporte[]>([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(5);
  const [lastPage, setLastPage] = useState(1);

  const [registrosTotales, setRegistrosTotales] = useState(0);
  const [totalCompras, setTotalCompras] = useState(0);

  // Carga el combo de proveedores una sola vez.
  useEffect(() => {
    buscarProveedores("", 1, 100)
      .then((res: PaginatedResponse<Proveedor>) => setProveedores(res.data))
      .catch((error) => console.error(error));
  }, []);

  const buscar = async () => {
    try {
      const response: RespuestaReporteCompras = await obtenerReporteComprasPorPeriodo(
        "",
        fechaInicio,
        fechaFin,
        Number(proveedorId),
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
    try {
      //await exportarReporteCompras(fechaInicio, fechaFin, proveedorId);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="reporte-page">
      <div className="reporte-contenido">
        <div className="reporte-header">
          <div>
            <h1>Reporte de Compras</h1>
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

          <div className="reporte-stat-card reporte-stat-card--oscura">
            <div className="reporte-stat-header">
              <span className="reporte-stat-label">Total compras</span>
              <span className="reporte-stat-icono reporte-stat-icono--azul">
                <IconoCarrito />
              </span>
            </div>
            <span className="reporte-stat-valor">C$ {formatearMoneda(totalCompras)}</span>
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
            <label>▽ Proveedor</label>
            <select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)}>
              <option value="">Todas las opciones</option>
              {proveedores.map((proveedor) => (
                <option key={proveedor.id} value={proveedor.id}>
                  {proveedor.Nombre_Empresa}
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
                <th className="reporte-td-centro">Proveedor</th>
                <th className="reporte-td-centro">N° Factura</th>
                <th className="reporte-th-derecha">Total</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((compra) => (
                <tr key={compra.id}>
                  <td>{formatearFecha(compra.Fecha)}</td>
                  <td className="reporte-td-centro reporte-td-nombre">
                    {compra.Nombre_Empresa}
                  </td>
                  <td className="reporte-td-factura">{compra.NFactura}</td>
                  <td className="reporte-td-derecha">C$ {formatearMoneda(compra.Total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {compras.length === 0 && (
            <div className="reporte-footer">
              <span className="reporte-count">No hay compras registradas en este rango.</span>
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

export default ReporteCompras;