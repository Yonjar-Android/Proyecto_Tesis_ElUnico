import { useEffect, useState } from "react";
import styles from "./ReporteStockBajo.module.css";
import IconoBarras from "../IconoBarras";
import type { ProductoListado } from "../../../models/ProductoListado.js";
import { obtenerReporteStockBajo} from "../../../services/reporte.service.js";
import { formatearMoneda } from "../../FuncionAuxiliar";
import { 
    descargarReporteStockBajoExcel, 
    descargarArchivoExcel 
} from "../../../services/reporteExcel.service.js";
import { Joyride, type Step } from "react-joyride";
import { HelpCircle } from 'lucide-react';

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

  const [tourActivo, setTourActivo] = useState(false);
 const pasosTour: Step[] = [
  {
    target: '[data-tour="exportar-reporte"]',
    content: "Desde aquí puedes exportar el reporte de stock bajo a Excel.",
  },
  {
    target: '[data-tour="filtrar-reporte"]',
    content: "Aquí puedes buscar productos con stock bajo por su nombre, código o categoría.",
  },
  {
    target: '[data-tour="tabla-reporte"]',
    content: "Aquí puedes ver la lista de productos con stock bajo.",
  },
  {
    target: '[data-tour="paginacion-reporte"]',
    content: "Con estos botones puedes navegar entre las páginas de productos con stock bajo para buscar alguno que no aparezca en la lista actual.",
  },
];

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
      return <span className={styles["reporte-pill-critico"]}>0 (CRÍTICO)</span>;
    }

    if (producto.Stock === producto.Stock_min) {
      return (
        <span className={styles["reporte-pill-limite"]}>{producto.Stock} (AL LÍMITE)</span>
      );
    }

    if (producto.Stock < producto.Stock_min) {
      return <span className={styles["reporte-pill-bajo"]}>{producto.Stock} (BAJO)</span>;
    }

    if (producto.Stock <= producto.Stock_min * 1.3) {
    return (
      <span className={styles["reporte-pill-moderado"]}>{producto.Stock} (MODERADO)</span>
    );
  }

  return producto.Stock;
  }

  return (
    <div className={styles["reporte-page"]}>
      <div className={styles["reporte-contenido"]}>
        <div className={styles["reporte-header"]}>
          <div>
            <h1>Reporte de Stock Próximo a Agotarse</h1>
            <p className={styles["reporte-subtitulo"]}>
              Monitoreo de inventario con existencias en o por debajo del stock mínimo.
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
            <span className={styles["reporte-stat-label"]}>Productos en riesgo / críticos</span>
            <span className={`${styles["reporte-stat-valor"]} ${styles["reporte-stat-valor--rojo"]}`}>
              {productosEnRiesgo}
            </span>
          </div>

          <div className={`${styles["reporte-stat-card"]} ${styles["reporte-stat-card--oscura"]}`}>
            <span className={styles["reporte-stat-label"]}>Total productos evaluados</span>
            <span className={styles["reporte-stat-valor"]}>{totalProductosEvaluados}</span>
          </div>
        </div>

        <div className={styles["reporte-buscador-simple"]} data-tour="filtrar-reporte">
          <span className={styles["reporte-buscador-icono"]}>🔍</span>
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

        <div className={styles["reporte-card-tabla"]} data-tour="tabla-reporte">
          <table className={styles["reporte-tabla"]}>
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
                  <td className={styles["reporte-td-nombre"]}>{producto.Nombre}</td>
                  <td>{producto.id}</td>
                  <td>
                    <span className={styles["reporte-pill-categoria"]}>{producto.Nombre_categoria}</span>
                  </td>
                  <td>C${formatearMoneda(producto.Precio_venta)}</td>
                  <td>{producto.Stock_min}</td>
                  <td>{renderStock(producto)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles["reporte-footer"]} data-tour="paginacion-reporte">
            <span className={styles["reporte-count"]}>
              Mostrando {productos.length} de {total} productos
            </span>
            <div className={styles["reporte-pagination"]}>
              <button
                className={styles["reporte-page-btn"]}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>

              {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={
                    `${styles["reporte-page-btn"]}` +
                    (page === currentPage ? ` ${styles["reporte-page-btn--active"]}` : "")
                  }
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className={styles["reporte-page-btn"]}
                onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                disabled={currentPage === lastPage || lastPage == 0}
              >
                Siguiente
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

export default ReporteStockBajo;