import { useState } from "react";
import type { ProductoListado } from "../../models/ProductoListado";
import ModalSeleccionarProducto from "../Facturacion/ModalSeleccionarProducto";
import { SquarePen, Trash2 } from "lucide-react";
import { formatearMoneda } from "../FuncionAuxiliar";

export interface ItemCompra {
  producto: ProductoListado;
  cantidad: number;
  precio_compra: number;
  precio_venta: number;
  // Presente solo cuando el item viene de una compra ya existente (modo edición).
  idDetalle?: number;
}

interface ItemsCompraFormProps {
  items: ItemCompra[];
  setItems: React.Dispatch<React.SetStateAction<ItemCompra[]>>;
  onError: (mensaje: string) => void;
}

/**
 * Encapsula la fila de "agregar/editar producto" + la tabla de items + el total.
 * No conoce nada de proveedor/fecha/factura: eso lo maneja la página que lo use
 * (Compras.tsx para crear, EditarCompra.tsx para editar).
 */
function ItemsCompraForm({ items, setItems, onError }: ItemsCompraFormProps) {
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoListado | null>(null);
  const [cantidad, setCantidad] = useState("1");
  const [precio, setPrecio] = useState("0.00");
  const [precioVenta, setPrecioVenta] = useState("0.00");
  const [indiceEditando, setIndiceEditando] = useState<number | null>(null);
  const [modalProductoAbierto, setModalProductoAbierto] = useState(false);

  const limpiarCamposProducto = () => {
    setProductoSeleccionado(null);
    setCantidad("1");
    setPrecio("0.00");
    setPrecioVenta("0.00");
  };

  const cancelarEdicion = () => {
    setIndiceEditando(null);
    limpiarCamposProducto();
    onError("");
  };

  const editarItem = (index: number) => {
    const item = items[index];
    setProductoSeleccionado(item.producto);
    setCantidad(String(item.cantidad));
    setPrecio(item.precio_compra.toFixed(2));
    setPrecioVenta(item.precio_venta.toFixed(2));
    setIndiceEditando(index);
    onError("");
  };

  const guardarProducto = () => {
    if (!productoSeleccionado) {
      onError("Selecciona un producto.");
      return;
    }

    if (isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
      onError("Ingresa una cantidad válida.");
      return;
    }

    if (isNaN(Number(precio)) || Number(precio) <= 0) {
      onError("Ingresa un precio de compra válido.");
      return;
    }

    if (isNaN(Number(precioVenta)) || Number(precioVenta) <= 0) {
      onError("Ingresa un precio de venta válido.");
      return;
    }

    if (Number(precioVenta) < Number(precio)) {
      onError("El precio de venta no puede ser menor que el precio de compra.");
      return;
    }

    const yaExiste = items.some(
      (item, i) => item.producto.id === productoSeleccionado.id && i !== indiceEditando
    );

    if (yaExiste) {
      onError("Este producto ya fue agregado a la factura.");
      return;
    }

    const itemPrevio = indiceEditando !== null ? items[indiceEditando] : undefined;

    const itemGuardado: ItemCompra = {
      producto: productoSeleccionado,
      cantidad: Number(cantidad),
      precio_compra: Number(precio),
      precio_venta: Number(precioVenta),
      idDetalle: itemPrevio?.idDetalle,
    };

    if (indiceEditando !== null) {
      setItems((prev) => prev.map((item, i) => (i === indiceEditando ? itemGuardado : item)));
    } else {
      setItems((prev) => [...prev, itemGuardado]);
    }

    onError("");
    setIndiceEditando(null);
    limpiarCamposProducto();
  };

  const eliminarItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="compra-fila-formulario">
        <div className="compra-campo compra-campo-producto" data-tour="compras-producto">
          <label>
            Producto <span style={{ color: "#e5484d" }}>*</span>
          </label>
          <button
            type="button"
            className="compra-selector-btn"
            onClick={() => setModalProductoAbierto(true)}
          >
            <span className={productoSeleccionado ? "" : "compra-selector-placeholder"}>
              {productoSeleccionado ? productoSeleccionado.Nombre : "Seleccione un producto"}
            </span>
          </button>
        </div>

        <div className="compra-campo compra-campo-cantidad">
          <label>
            Cantidad <span style={{ color: "#e5484d" }}>*</span>
          </label>
          <input
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
        </div>

        <div className="compra-campo compra-campo-precio">
          <label>
            Precio de Compra <span style={{ color: "#e5484d" }}>*</span>
          </label>
          <div className="compra-precio-input">
            <span>C$</span>
            <input
              type="number"
              step="1"
              min="0"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
          </div>
        </div>

        <div className="compra-campo compra-campo-precio-venta">
          <label>
            Precio de Venta <span style={{ color: "#e5484d" }}>*</span>
          </label>
          <div className="compra-precio-input">
            <span>C$</span>
            <input
              type="number"
              step="1"
              min="0"
              value={precioVenta}
              onChange={(e) => setPrecioVenta(e.target.value)}
            />
          </div>
        </div>

        <button className="factura-btn-agregar" onClick={guardarProducto} data-tour="compras-agregar">
          {indiceEditando !== null ? "Actualizar" : "Agregar"}
        </button>

        {indiceEditando !== null && (
          <button type="button" className="factura-btn-cancelar-edicion" onClick={cancelarEdicion}>
            Cancelar edición
          </button>
        )}
      </div>

      <div className="factura-card factura-card-tabla" data-tour="compras-tabla">
        <table className="factura-tabla">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Subtotal</th>
              <th className="factura-th-accion">Acción</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className={indiceEditando === index ? "factura-tr-editando" : ""}>
                <td>
                  {item.producto.Nombre}
                  {item.producto.Nombre_marca && (
                    <span className="factura-nombre-marca">{item.producto.Nombre_marca}</span>
                  )}
                </td>
                <td>{item.cantidad}</td>
                <td>C${formatearMoneda(item.precio_compra)}</td>
                <td className="factura-td-subtotal">
                  C${formatearMoneda(item.cantidad * item.precio_compra)}
                </td>
                <td className="factura-td-accion" data-tour="botones-compras">
                  <button
                    className="factura-btn-editar"
                    onClick={() => editarItem(index)}
                    aria-label="Editar producto"
                    title="Editar"
                  >
                    <SquarePen size={24} />
                  </button>

                  <button
                    className="factura-btn-eliminar"
                    onClick={() => eliminarItem(index)}
                    aria-label="Eliminar producto"
                    title="Eliminar"
                  >
                    <Trash2 size={24} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <div className="factura-vacio">Aún no has agregado productos.</div>
        )}
      </div>

      <ModalSeleccionarProducto
        abierto={modalProductoAbierto}
        onClose={() => setModalProductoAbierto(false)}
        onSeleccionar={(producto: any, cant) => {
          setProductoSeleccionado(producto);
          setPrecioVenta(producto.Precio_venta);
          setCantidad(cant.toString());
          setModalProductoAbierto(false);
        }}
      />
    </>
  );
}

export default ItemsCompraForm;