import "./InventarioLayout.css";
import "./Inventario.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PaginatedResponse } from "../../models/PaginatedResponse";
import { buscarProductos } from "../../services/producto.service";
import type { ProductoListado } from "../../models/ProductoListado";
import { SquarePen, HelpCircle } from "lucide-react";
import { formatearMoneda } from "../FuncionAuxiliar";
import { Joyride, type Step } from "react-joyride";

function Inventario() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<ProductoListado[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Tour de ayuda

const [tourActivo, setTourActivo] = useState(false);

const pasosTour: Step[] = [
  {
    target: '[data-tour="agregar-producto"]',
    content: "Desde aquí navegas a otra pantalla para registrar un nuevo producto.",
  },
  {
    target: '[data-tour="buscar-producto"]',
    content: "Aquí puedes filtrar productos por nombre, código o por categoría.",
  },
  {
    target: '[data-tour="tabla-productos"]',
    content: "En esta tabla se muestran todos los productos registrados.",
  },
  {
    target: '[data-tour="paginación-producto"]',
    content: "Con estos botones puedes navegar entre las páginas de productos para buscar alguno que no aparezca en la lista actual.",
  },
];

  const buscar = async () => {
    try {
       const response: PaginatedResponse<ProductoListado> = await buscarProductos(
         searchTerm,
         currentPage,
         perPage
       );

       setProductos(response.data);
       setTotal(response.total);
       setLastPage(response.last_page);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      buscar();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, currentPage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      buscar();
    }
  };

  return (
    <div className="inventario-page">
      <div className="inventario-header-banda">
        <h1>Inventario</h1>
        <button className="inventario-help-btn" onClick={() => setTourActivo(true)}>
        <HelpCircle size={18} />
        </button>
      </div>

      <div className="inventario-status-row">
        <span className="inventario-status-badge">
          STATUS: ONLINE <span className="inventario-status-dot" />
        </span>
      </div>

      <div className="inventario-contenido">
        <div className="inventario-card-grande">
          <div className="inventario-listado-top">
            <div className="inventario-search-wrapper" data-tour="buscar-producto">
              <span className="inventario-search-icon">🔍</span>
              <input
                className="inventario-search-input"
                type="text"
                placeholder="Buscar por código, nombre o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <button className="inventario-agregar-btn" onClick={() => navigate("/inventario/crear")}
              data-tour="agregar-producto">
              + Agregar producto
            </button>
          </div>

          <table className="inventario-tabla" data-tour="tabla-productos">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th className="inventario-th-acciones">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td className="inventario-td-nombre">{producto.Nombre}</td>
                  <td className="inventario-td-codigo">{producto.id}</td>
                  <td>
                    <span className="inventario-pill-categoria">{producto.Nombre_categoria}</span>
                  </td>
                  <td>C${formatearMoneda(producto.Precio_venta)}</td>
                  <td>
                    {producto.Stock <= producto.Stock_min ? (
                      <span className="inventario-pill-critico">
                        {producto.Stock} (CRÍTICO)
                      </span>
                    ) : (
                      producto.Stock
                    )}
                  </td>
                  <td className="inventario-td-acciones">
                    <button
                      className="inventario-btn-icono"
                      onClick={() => navigate(`/inventario/editar/${producto.id}`)}
                      aria-label="Editar producto"
                      title="Editar"
                    >
                      <SquarePen size={24} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="inventario-footer" data-tour="paginación-producto">
            <span className="inventario-count">
              Mostrando {productos.length} de {total} productos
            </span>
            <div className="inventario-pagination">
              <button
                className="inventario-page-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>

              {Array.from(
  {
    length: Math.min(lastPage, 3),
  },
  (_, i) => {
    if (lastPage <= 3) return i + 1;

    if (currentPage === 1) return i + 1;

    if (currentPage === lastPage) return lastPage - 2 + i;

    return currentPage - 1 + i;
  }
).map((page) => (
  <button
    key={page}
    className={
      "inventario-page-btn" +
      (page === currentPage ? " inventario-page-btn--active" : "")
    }
    onClick={() => setCurrentPage(page)}
  >
    {page}
  </button>
))}

              <button
                className="inventario-page-btn"
                onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                disabled={currentPage === lastPage || lastPage === 0}
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

export default Inventario;