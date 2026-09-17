import { useEffect, useState } from "react";
import styles from "./ReporteInventario.module.css";
import IconoBarras from "../IconoBarras";
import { IconoCuboOutline } from "../IconosReporte";
import { formatearMoneda } from "../../FuncionAuxiliar";
import {
  obtenerReporteInventarioGeneral,
} from "../../../services/reporte.service";
import {   
    descargarReporteInventarioExcel,
    descargarArchivoExcel, }
     from "../../../services/reporteExcel.service";
import type {
  RespuestaReporteInventario,
  ProductoInventarioReporte,
} from "../../../models/RespuestaReporteInventario";
import ModalSeleccionarCategoria from "../../Productos/ModalesSeleccion/ModalSeleccionarCategoria";
import ModalSeleccionarMarca from "../../Productos/ModalesSeleccion/ModalSeleccionarMarca";
import type { Categoria } from "../../../models/Categoria";
import type { Marca } from "../../../models/Marca";
import { Joyride, type Step } from "react-joyride";
import { HelpCircle } from 'lucide-react';

function ReporteInventario() {
  const [productos, setProductos] = useState<ProductoInventarioReporte[]>([]);
  const [busquedaNombre, setBusquedaNombre] = useState("");

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState(false);

  const [marcaSeleccionada, setMarcaSeleccionada] = useState<Marca | null>(null);
  const [modalMarcaAbierto, setModalMarcaAbierto] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);

  const [registrosTotales, setRegistrosTotales] = useState(0);
  const [stockTotal, setStockTotal] = useState(0);
  const [stockCritico, setStockCritico] = useState(0);

  const [exportando, setExportando] = useState(false);

  const [tourActivo, setTourActivo] = useState(false);
  const pasosTour: Step[] = [
  {
    target: '[data-tour="exportar-reporte"]',
    content: "Desde aquí puedes exportar el reporte a Excel.",
  },
  {
    target: '[data-tour="filtrar-reporte"]',
    content: "Aquí puedes buscar productos por su nombre, marca y categoría.",
  },
  {
    target: '[data-tour="tabla-reporte"]',
    content: "Aquí puedes ver la lista de productos y su stock actual.",
  },
  {
    target: '[data-tour="paginacion-reporte"]',
    content: "Con estos botones puedes navegar entre las páginas de productos para buscar alguno que no aparezca en la lista actual.",
  },
];

  const buscar = async () => {
    try {
      const response: RespuestaReporteInventario = await obtenerReporteInventarioGeneral(
        busquedaNombre,
        categoriaSeleccionada?.id ?? null,
        marcaSeleccionada?.id ?? null,
        currentPage,
        perPage
      );

      setProductos(response.data);
      setLastPage(response.last_page);
      setRegistrosTotales(response.TotalRegistros);
      setStockTotal(response.TotalStock);
      setStockCritico(response.TotalStockCritico);
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
      const blob = await descargarReporteInventarioExcel(
        busquedaNombre,
        categoriaSeleccionada?.id ?? null,
        marcaSeleccionada?.id ?? null
      );

      const fecha = new Date().toISOString().split("T")[0];
      const nombreArchivo = `reporte_inventario_${fecha}.xlsx`;

      descargarArchivoExcel(blob, nombreArchivo);

      console.log("Reporte exportado exitosamente");
    } catch (error) {
      console.error("Error al exportar:", error);
      alert("Error al exportar el reporte");
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className={styles["reporte-page"]}>
      <div className={styles["reporte-contenido"]}>
        <div className={styles["reporte-header"]}>
          <div>
            <h1>Reporte de Inventario General</h1>
            <p className={styles["reporte-subtitulo"]}>
              Consulta el stock, precio, marca y categoría de tus productos.
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
            {exportando ? "Exportando..." : "Exportar Excel"}
          </button>
        </div>
        </div>

        <div className={styles["reporte-stats-row"]}>
          <div className={styles["reporte-stat-card"]}>
            <div className={styles["reporte-stat-header"]}>
              <span className={styles["reporte-stat-label"]}>Productos totales</span>
              <span className={styles["reporte-stat-icono"]}>
                <IconoCuboOutline />
              </span>
            </div>
            <span className={styles["reporte-stat-valor"]}>{registrosTotales}</span>
          </div>

          <div className={styles["reporte-stat-card"]}>
            <div className={styles["reporte-stat-header"]}>
              <span className={styles["reporte-stat-label"]}>Stock total</span>
              <span className={styles["reporte-stat-icono"]}>
                <IconoCuboOutline />
              </span>
            </div>
            <span className={styles["reporte-stat-valor"]}>{stockTotal}</span>
          </div>

          <div className={`${styles["reporte-stat-card"]} ${styles["reporte-stat-card--oscura"]}`}>
            <div className={styles["reporte-stat-header"]}>
              <span className={styles["reporte-stat-label"]}>Stock crítico</span>
              <span className={`${styles["reporte-stat-icono"]} ${styles["reporte-stat-icono--rojo"]}`}>
                <IconoCuboOutline />
              </span>
            </div>
            <span className={styles["reporte-stat-valor"]}>{stockCritico}</span>
          </div>
        </div>

        <div className={styles["reporte-filtro-row"]} data-tour="filtrar-reporte">
          <div className={styles["reporte-campo"]}>
            <label>🔎 Nombre</label>
            <input
              type="text"
              placeholder="Buscar por nombre de producto..."
              value={busquedaNombre}
              onChange={(e) => setBusquedaNombre(e.target.value)}
            />
          </div>

          <div className={styles["reporte-campo"]}>
            <label>▽ Marca</label>
            <div className={styles["reporte-selector-cliente"]}>
              <button
                type="button"
                className={styles["factura-selector-btn"]}
                onClick={() => setModalMarcaAbierto(true)}
              >
                {marcaSeleccionada ? marcaSeleccionada.Nombre_marca : "Todas las marcas"}
              </button>

              {marcaSeleccionada && (
                <button
                  type="button"
                  className={styles["reporte-btn-limpiar-cliente"]}
                  onClick={() => setMarcaSeleccionada(null)}
                  aria-label="Quitar filtro de marca"
                  title="Quitar filtro"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className={styles["reporte-campo"]}>
            <label>▽ Categoría</label>
            <div className={styles["reporte-selector-cliente"]}>
              <button
                type="button"
                className={styles["factura-selector-btn"]}
                onClick={() => setModalCategoriaAbierto(true)}
              >
                {categoriaSeleccionada ? categoriaSeleccionada.Nombre_categoria : "Todas las categorías"}
              </button>

              {categoriaSeleccionada && (
                <button
                  type="button"
                  className={styles["reporte-btn-limpiar-cliente"]}
                  onClick={() => setCategoriaSeleccionada(null)}
                  aria-label="Quitar filtro de categoría"
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

        <div className={styles["reporte-card-tabla"]}>
          <table className={styles["reporte-tabla"]} data-tour="tabla-reporte">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Marca</th>
                <th>Categoría</th>
                <th className={styles["reporte-th-derecha"]}>Precio</th>
                <th className={styles["reporte-th-derecha"]}>Stock</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td className={styles["reporte-td-nombre"]}>{p.Nombre}</td>
                  <td>{p.Nombre_marca}</td>
                  <td>
                    <span className={styles["reporte-pill-categoria"]}>{p.Nombre_categoria}</span>
                  </td>
                  <td className={styles["reporte-th-derecha"]}>C$ {formatearMoneda(p.Precio_venta)}</td>
                  <td className={styles["reporte-th-derecha"]}>
                    {p.Stock < p.Stock_min ? (
                      <span className={styles["reporte-pill-critico"]}>{p.Stock}</span>
                    ) : (
                      p.Stock
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {productos.length === 0 && (
            <div className={styles["reporte-footer"]}>
              <span className={styles["reporte-count"]}>No hay productos que coincidan con el filtro.</span>
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

      <ModalSeleccionarMarca
        abierto={modalMarcaAbierto}
        onClose={() => setModalMarcaAbierto(false)}
        onSeleccionar={(m) => {
          setMarcaSeleccionada(m);
          setModalMarcaAbierto(false);
        }}
      />

      <ModalSeleccionarCategoria
        abierto={modalCategoriaAbierto}
        onClose={() => setModalCategoriaAbierto(false)}
        onSeleccionar={(cat) => {
          setCategoriaSeleccionada(cat);
          setModalCategoriaAbierto(false);
        }}
      />
    </div>
  );
}

export default ReporteInventario;