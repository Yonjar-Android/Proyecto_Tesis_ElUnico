import { useEffect, useState } from "react";
import "../Reportes.css";
import IconoBarras from "../IconoBarras";
import type { ProductoListado } from "../../../models/ProductoListado.js";
import { obtenerReporteStockBajo} from "../../../services/reporte.service.js";
import { formatearMoneda } from "../../FuncionAuxiliar";
import { 
    descargarReporteStockBajoExcel, 
    descargarArchivoExcel 
} from "../../../services/reporteExcel.service.js";

export interface ReporteProductoStock {
    id: number;
    Nombre: string;
    Id_marca: number;
    Nombre_marca: string;
    Id_categoria: number;
    Nombre_categoria: string;
    Precio_venta: number;
    Stock: number;
    Stock_min: number;
    Fecha_vencimiento: Date | null;
}

export interface ReporteProductosStockResponse {
    data: ProductoListado[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    TotalProductosEvaluados: number;
    TotalProductosEnRiesgo: number;
}

function ReporteStockBajo() {
  const [productos, setProductos] = useState<ProductoListado[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  const [productosEnRiesgo, setProductosEnRiesgo] = useState(0);
  const [totalProductosEvaluados, setTotalProductosEvaluados] = useState(0);

  // Estado para manejar la carga durante la exportación
    const [exportando, setExportando] = useState(false);

  const buscar = async () => {
    try {
      const response: ReporteProductosStockResponse = await obtenerReporteStockBajo(
        searchTerm,
        currentPage,
        perPage
      );

      setProductos(response.data);
      setTotal(response.total);
      setLastPage(response.last_page);
      setProductosEnRiesgo(response.TotalProductosEnRiesgo);
      setTotalProductosEvaluados(response.TotalProductosEvaluados);
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
            const blob = await descargarReporteStockBajoExcel(searchTerm);
            
            // Generar nombre del archivo con fecha actual
            const fecha = new Date().toISOString().split('T')[0];
            const nombreArchivo = `reporte_stock_bajo_${fecha}.xlsx`;
            
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

  function renderStock(producto: ProductoListado) {
    if (producto.Stock === 0) {
      return <span className="reporte-pill-critico">0 (CRÍTICO)</span>;
    }

    if (producto.Stock === producto.Stock_min) {
      return (
        <span className="reporte-pill-limite">{producto.Stock} (AL LÍMITE)</span>
      );
    }

    if (producto.Stock < producto.Stock_min) {
      return <span className="reporte-pill-bajo">{producto.Stock} (BAJO)</span>;
    }

    if (producto.Stock <= producto.Stock_min * 1.3) {
    return (
      <span className="reporte-pill-moderado">{producto.Stock} (MODERADO)</span>
    );
  }

  return producto.Stock;
  }

  return (
    <div className="reporte-page">
      <div className="reporte-contenido">
        <div className="reporte-header">
          <div>
            <h1>Reporte de Stock Próximo a Agotarse</h1>
            <p className="reporte-subtitulo">
              Monitoreo de inventario con existencias en o por debajo del stock mínimo.
            </p>
          </div>

          <button 
                className="reporte-btn-exportar" 
                onClick={exportar}
                disabled={exportando}
            >
                <IconoBarras />
                {exportando ? 'Exportando...' : 'Exportar Excel'}
            </button>
        </div>

        <div className="reporte-stats-row">
          <div className="reporte-stat-card">
            <span className="reporte-stat-label">Productos en riesgo / críticos</span>
            <span className="reporte-stat-valor reporte-stat-valor--rojo">
              {productosEnRiesgo}
            </span>
          </div>

          <div className="reporte-stat-card reporte-stat-card--oscura">
            <span className="reporte-stat-label">Total productos evaluados</span>
            <span className="reporte-stat-valor">{totalProductosEvaluados}</span>
          </div>
        </div>

        <div className="reporte-buscador-simple">
          <span className="reporte-buscador-icono">🔍</span>
          <input
            type="text"
            placeholder="Buscar por código, nombre o categoría..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="reporte-card-tabla">
          <table className="reporte-tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock Min.</th>
                <th>Stock Actual</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td className="reporte-td-nombre">{producto.Nombre}</td>
                  <td>{producto.id}</td>
                  <td>
                    <span className="reporte-pill-categoria">{producto.Nombre_categoria}</span>
                  </td>
                  <td>C${formatearMoneda(producto.Precio_venta)}</td>
                  <td>{producto.Stock_min}</td>
                  <td>{renderStock(producto)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="reporte-footer">
            <span className="reporte-count">
              Mostrando {productos.length} de {total} productos
            </span>
            <div className="reporte-pagination">
              <button
                className="reporte-page-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>

              {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={
                    "reporte-page-btn" +
                    (page === currentPage ? " reporte-page-btn--active" : "")
                  }
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="reporte-page-btn"
                onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                disabled={currentPage === lastPage || lastPage == 0}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReporteStockBajo;