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
  onSeleccionar: (producto: ProductoListado, cantidad: number) => void;
  validarStock?: boolean;
}

const UMBRAL_STOCK_BAJO = 10;

function ModalSeleccionarProducto({ abierto, onClose, onSeleccionar, validarStock = false }: Props) {
  const [productos, setProductos] = useState<ProductoListado[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(6);
  const [lastPage, setLastPage] = useState(1);

  // Cantidad seleccionada por producto (clave = id del producto)
  const [cantidades, setCantidades] = useState<Record<number, number>>({});

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
      setCantidades({});
    }
  }, [abierto]);

  if (!abierto) return null;

      const obtenerCantidad = (producto: ProductoListado) => {
    // Si no se ha tocado el input, por defecto es 1 (o el stock si es 0, solo cuando se valida stock)
    const porDefecto = validarStock ? (producto.Stock > 0 ? 1 : 0) : 1;
    return cantidades[producto.id] ?? porDefecto;
  };

  const manejarCambioCantidad = (producto: ProductoListado, valor: string) => {
    let cantidad = parseInt(valor, 10);

    if (isNaN(cantidad)) {
      cantidad = 0;
    }

    if (cantidad < 0) {
      cantidad = 0;
    }

     if (validarStock && cantidad > producto.Stock) {
      cantidad = producto.Stock;
    }

    setCantidades((prev) => ({
      ...prev,
      [producto.id]: cantidad,
    }));
  };

      const manejarSeleccionar = (producto: ProductoListado) => {
    const cantidad = obtenerCantidad(producto);

    if (cantidad <= 0) {
      return;
    }

    if (validarStock && cantidad > producto.Stock) {
      return;
    }

    onSeleccionar(producto, cantidad);
  };

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
                <th className="seleccion-th-marca th-producto">Marca</th>
                <th className="seleccion-th-stock">Stock</th>
                <th>Precio</th>
                <th className="seleccion-th-cantidad">Cantidad</th>
                <th className="seleccion-th-accion">Acción</th>
              </tr>
            </thead>
            <tbody>
                {productos.map((producto) => {
                const cantidad = obtenerCantidad(producto);
                const sinStock = validarStock && producto.Stock === 0;
                const cantidadInvalida =
                  cantidad <= 0 || (validarStock && cantidad > producto.Stock);

                return (
                  <tr key={producto.id}>
                    <td className="seleccion-nombre-columna">
                      {producto.Nombre}
                    </td>

                    <td className="seleccion-nombre-columna">
                      {producto.Nombre_marca}
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
                    <td className="seleccion-td-cantidad">
                        <input
                        className="seleccion-cantidad-input"
                        type="number"
                        min={0}
                        max={validarStock ? producto.Stock : undefined}
                        value={cantidad}
                        disabled={sinStock}
                        onChange={(e) =>
                          manejarCambioCantidad(producto, e.target.value)
                        }
                      />
                    </td>
                    <td className="seleccion-td-accion">
                        <button
                        className="seleccion-btn"
                        onClick={() => manejarSeleccionar(producto)}
                        disabled={cantidadInvalida || sinStock}
                      >
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                );
              })}
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