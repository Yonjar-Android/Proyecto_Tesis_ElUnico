import { useState } from "react";
import "./Compras.css";
import type { Proveedor } from "../../models/Proveedor";
import type { ProductoListado } from "../../models/ProductoListado";
import { crearCompra } from "../../services/compra.service";
import ModalSeleccionarProducto from "../Facturacion/ModalSeleccionarProducto";
import ModalSeleccionarProveedor from "./ModalSeleccionarProveedor";
import { SquarePen, Trash2 } from "lucide-react";

interface ItemCompra {
  producto: ProductoListado,
  cantidad: number;
  precio_compra: number;
  precio_venta: number;
}

function formatearFechaInput(fecha: Date) {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();

  return `${anio}-${mes}-${dia}`;
}

function Compras() {
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoListado | null>(null);
  const [cantidad, setCantidad] = useState("1");
  const [precio, setPrecio] = useState("0.00");
  const [precioVenta, setPrecioVenta] = useState("0.00");
  const [fecha, setFecha] = useState(formatearFechaInput(new Date()));
  const [NFactura, setNFactura] = useState("");
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);

  const [items, setItems] = useState<ItemCompra[]>([]);
  const [indiceEditando, setIndiceEditando] = useState<number | null>(null);
  const [modalProductoAbierto, setModalProductoAbierto] = useState(false);
  const [modalProveedorAbierto, setModalProveedorAbierto] = useState(false);

  const [error, setError] = useState("");

  const limpiarCamposProducto = () => {
    setProductoSeleccionado(null);
    setCantidad("1");
    setPrecio("0.00");
    setPrecioVenta("0.00");
  };

  const cancelarEdicion = () => {
    setIndiceEditando(null);
    limpiarCamposProducto();
    setError("");
  };

  // Precarga el formulario con los datos de la fila y activa el modo edición.
  const editarItem = (index: number) => {
    const item = items[index];
    setProductoSeleccionado(item.producto);
    setCantidad(String(item.cantidad));
    setPrecio(item.precio_compra.toFixed(2));
    setIndiceEditando(index);
    setError("");
  };

  const guardarProducto = () => {

    if (!productoSeleccionado) {
      setError("Selecciona un producto.");
      return;
    }

    if (isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
      setError("Ingresa una cantidad válida.");
      return;
    }

    if (isNaN(Number(precio)) || Number(precio) <= 0) {
      setError("Ingresa un precio de compra válido.");
      return;
    }

    if (isNaN(Number(precioVenta)) || Number(precioVenta) <= 0) {
      setError("Ingresa un precio de venta válido.");
      return;
    }

    if(Number(precioVenta) < Number(precio)){
      setError("El precio de venta no puede ser menor que el precio de compra.");
      return;
    }

    // Al chequear duplicados, ignora la propia fila que se está editando.
    const yaExiste = items.some(
      (item, i) => item.producto.id === productoSeleccionado.id && i !== indiceEditando
    );

    if (yaExiste) {
      setError("Este producto ya fue agregado a la factura.");
      return;
    }

    const itemGuardado: ItemCompra = {
      producto: productoSeleccionado,
      cantidad: Number(cantidad),
      precio_compra: Number(precio),
      precio_venta: Number(precioVenta)
    }

    if (indiceEditando !== null) {
      setItems((prev) =>
        prev.map((item, i) => (i === indiceEditando ? itemGuardado : item))
      );
    } else {
      setItems((prev) => [...prev, itemGuardado]);
    }

    setError("");
    setIndiceEditando(null);
    limpiarCamposProducto();
  };

  const eliminarItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const total = items.reduce((suma, item) => suma + item.cantidad * item.precio_compra, 0);

  const cancelar = () => {
    setItems([]);
    limpiarCamposProducto();
    setError("");
  };
 
  const confirmarCompra = async () => {
    
    if (items.length === 0) {
      setError("Agrega al menos un producto para realizar la compra.");
      return;
    }

    if(!proveedorSeleccionado) {
      setError("Selecciona un proveedor.");
      return;
    }

    

    try {

      const total = items.reduce((suma, item) => suma + item.cantidad * item.precio_compra, 0);

      await crearCompra(
        Number(proveedorSeleccionado?.id),
        NFactura,
        total,
        items.map((item) => ({
          Id_producto: item.producto.id,
          Cantidad: item.cantidad,
          Precio: item.precio_compra,
          Subtotal: item.cantidad * item.precio_compra,
        })),
      );
 
      setItems([]);
      setError("");
      setProductoSeleccionado(null);
      setProveedorSeleccionado(null);
      setNFactura("");
      return true;
    } catch (error: any) {
      setError(error.response.data.mensaje);
      return false;
    }
  };

  return (
    <div className="factura-page">
        <div className="factura-contenido">
      <div className="factura-header">
        <h1>Gestión de Compras</h1>
      </div>

      <div className="factura-card">
        <div className="compra-fila-formulario">
          <div className="compra-campo compra-campo-producto">
            <label>
              Producto <span style={{ color: "#e5484d" }}>*</span>
            </label>
            <button
              type="button"
              className="compra-selector-btn"
              onClick={() => setModalProductoAbierto(true)}
            >
              <span
                className={
                  productoSeleccionado ? "" : "compra-selector-placeholder"
                }
              >
                {productoSeleccionado
                  ? productoSeleccionado.Nombre
                  : "Seleccione un producto"}
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
          <button className="factura-btn-agregar" onClick={guardarProducto}>
              {indiceEditando !== null ? "Actualizar" : "Agregar"}
            </button>

            {indiceEditando !== null && (
              <button
                type="button"
                className="factura-btn-cancelar-edicion"
                onClick={cancelarEdicion}
              >
                Cancelar edición
              </button>
            )}
        </div>

        <div className="compra-fila-formulario">
          <div className="compra-campo compra-campo-producto">
            <label>
              Proveedor <span style={{ color: "#e5484d" }}>*</span>
            </label>
            <button
              type="button"
              className="compra-selector-btn"
              onClick={() => setModalProveedorAbierto(true)}
            >
              <span
                className={
                  proveedorSeleccionado ? "" : "compra-selector-placeholder"
                }
              >
                {proveedorSeleccionado
                  ? proveedorSeleccionado.Nombre_Empresa
                  : "Seleccione un proveedor"}
              </span>
            </button>
          </div>

          <div className="compra-campo compra-campo-fecha">
            <label>
              Fecha <span style={{ color: "#e5484d" }}>*</span>
            </label>
            <input
              type="date"
              value={fecha}
               max={formatearFechaInput(new Date())}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div className="compra-campo compra-campo-factura">
            <label>
              N° Factura
            </label>
            <input
              type="text"
              placeholder="Ej: FAC-102"
              value={NFactura}
              onChange={(e) => setNFactura(e.target.value)}
            />
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
        </div>
      </div>


      <div className="factura-card factura-card-tabla">
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
              <tr key={index}
              className={indiceEditando === index ? "factura-tr-editando" : ""}
              >
                <td>
                  {item.producto.Nombre}
                  {item.producto.Nombre_marca && (
                    <span className="factura-nombre-marca">{item.producto.Nombre_marca}</span>
                  )}
                </td>
                <td>{item.cantidad}</td>
                <td>C${item.precio_compra}</td>
                <td className="factura-td-subtotal">
                  C${(item.cantidad * item.precio_compra)}
                </td>
                <td className="factura-td-accion">
                  <button
                      className="factura-btn-editar"
                      onClick={() => editarItem(index)}
                      aria-label="Editar producto"
                    >
                      <SquarePen size={24} />
                    </button>

                    <button
                      className="factura-btn-eliminar"
                      onClick={() => eliminarItem(index)}
                      aria-label="Eliminar producto"
                    >
                      <Trash2 size={24} />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <div className="factura-vacio">Aún no has agregado productos a la venta.</div>
        )}
      </div>

      {error && <span className="error-text">{error}</span>}

      <div className="factura-footer">
        <button className="factura-btn-cancelar" onClick={cancelar}>
          Cancelar
        </button>

        <div className="factura-total-venta">
          <div className="factura-total-texto">
            <span className="factura-total-label">Total</span>
            <span className="factura-total-monto">C${total}</span>
          </div>

          <button className="factura-btn-vender" onClick={confirmarCompra}>
            Realizar Compra
          </button>
        </div>
      </div>
      </div>

      <ModalSeleccionarProducto
        abierto={modalProductoAbierto}
        onClose={() => setModalProductoAbierto(false)}
        onSeleccionar={(producto: any) => {
          setProductoSeleccionado(producto);
          setPrecioVenta(producto.Precio_venta);
          setModalProductoAbierto(false);
        }}
      />

      <ModalSeleccionarProveedor
        abierto={modalProveedorAbierto}
        onClose={() => setModalProveedorAbierto(false)}
        onSeleccionar={(proveedor) => {
          setProveedorSeleccionado(proveedor);
          setModalProveedorAbierto(false);
        }}
      />
    </div>
  );
}

export default Compras;