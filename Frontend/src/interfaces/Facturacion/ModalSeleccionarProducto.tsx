import { useEffect, useState } from "react";
import "../Productos/ModalesSeleccion/ModalSeleccion.css";
import "./ModalSeleccionarProducto.css";
import IconoCubo from "../Productos/ModalesSeleccion/IconoCubo";
import { buscarProductos } from "../../services/producto.service";
import type { ProductoListado } from "../../models/ProductoListado";
import type { PaginatedResponse } from "../../models/PaginatedResponse";

interface Props {
  abierto: boolean;
  onClose: () => void;
  onSeleccionar: (producto: ProductoListado) => void;
}

const UMBRAL_STOCK_BAJO = 10;

function ModalSeleccionarProducto({ abierto, onClose, onSeleccionar }: Props) {
  const [productos, setProductos] = useState<ProductoListado[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(6);
  const [lastPage, setLastPage] = useState(1);

  const buscar = async () => {
    try {
      const response: PaginatedResponse<ProductoListado> = await buscarProductos(
        searchTerm,
        currentPage,
        perPage
      );

      setProductos(response.data);
      setLastPage(response.last_page);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!abierto) return;

    const timer = setTimeout(() => {
      buscar();
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, currentPage, abierto]);

  // Reinicia la búsqueda cada vez que se abre el modal.
  useEffect(() => {
    if (abierto) {
      setSearchTerm("");
      setCurrentPage(1);
    }
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div className="modal-overlay">
      <div className="modal seleccion-modal seleccion-modal--ancho">
        <div className="modal-header">
          <h2>
            <IconoCubo />
            Selección de Productos
          </h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="seleccion-body">
          <input
            className="seleccion-buscador"
            type="text"
            placeholder="Buscar por código, nombre o categoría..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />

          <table className="seleccion-tabla">
            <thead>
              <tr>
                <th className="seleccion-th-nombre th-producto">Nombre</th>
                <th className="seleccion-th-stock">Stock</th>
                <th>Precio</th>
                <th className="seleccion-th-accion">Acción</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td className="seleccion-nombre-columna">
                    {producto.Nombre}
                    {producto.Nombre_marca && (
                      <span className="seleccion-nombre-marca">{producto.Nombre_marca}</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={
                        "seleccion-stock-pill" +
                        (producto.Stock <= UMBRAL_STOCK_BAJO
                          ? " seleccion-stock-pill--bajo"
                          : "")
                      }
                    >
                      {producto.Stock}
                    </span>
                  </td>
                  <td>C${producto.Precio_venta}</td>
                  <td className="seleccion-td-accion">
                    <button
                      className="seleccion-btn"
                      onClick={() => onSeleccionar(producto)}
                    >
                      Seleccionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {productos.length === 0 && (
            <div className="seleccion-vacio">No se encontraron productos.</div>
          )}
        </div>

        <div className="seleccion-footer">
          <span className="seleccion-count">Mostrando {productos.length} productos</span>
          <div className="seleccion-pagination">
            <button
              className="seleccion-page-btn"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              «
            </button>
            <button
              className="seleccion-page-btn"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            <button className="seleccion-page-btn seleccion-page-btn--active">
              {currentPage}
            </button>
            <button
              className="seleccion-page-btn"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === lastPage || lastPage === 0}
            >
              ›
            </button>
            <button
              className="seleccion-page-btn"
              onClick={() => setCurrentPage(lastPage)}
              disabled={currentPage === lastPage || lastPage === 0}
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalSeleccionarProducto;