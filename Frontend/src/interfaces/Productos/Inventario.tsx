import "./InventarioLayout.css";
import "./Inventario.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PaginatedResponse } from "../../models/PaginatedResponse";
import { buscarProductos } from "../../services/producto.service";
import type { ProductoListado } from "../../models/ProductoListado";

function Inventario() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<ProductoListado[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

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
      </div>

      <div className="inventario-status-row">
        <span className="inventario-status-badge">
          STATUS: ONLINE <span className="inventario-status-dot" />
        </span>
      </div>

      <div className="inventario-contenido">
        <div className="inventario-card-grande">
          <div className="inventario-listado-top">
            <div className="inventario-search-wrapper">
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

            <button className="inventario-agregar-btn" onClick={() => navigate("/inventario/crear")}>
              + Agregar producto
            </button>
          </div>

          <table className="inventario-tabla">
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
                  <td>C${producto.Precio_venta}</td>
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
                    >
                      ✏
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="inventario-footer">
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
    </div>
  );
}

export default Inventario;