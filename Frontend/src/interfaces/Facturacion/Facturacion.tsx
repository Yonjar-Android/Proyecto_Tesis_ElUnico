import { useState } from "react";
import "./Facturacion.css";
import ModalSeleccionarProducto from "./ModalSeleccionarProducto";
import ModalSeleccionarCliente from "./ModalSeleccionarCliente";
import ModalConfirmarVenta from "./ModalConfirmarVenta";
import type { Cliente } from "../../models/Cliente";
import type { ProductoListado } from "../../models/ProductoListado";
import { crearVenta } from "../../services/venta.service";

interface ItemVenta {
  productoId: number;
  nombre: string;
  marca?: string;
  cantidad: number;
  precio: number;
}

function formatearFecha(fecha: Date) {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  return `${dia}-${mes}-${anio}`;
}

function Facturacion() {
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoListado | null>(null);
  const [cantidad, setCantidad] = useState("1");
  const [precio, setPrecio] = useState("0.00");
  const [tipoPago, setTipoPago] = useState("Contado");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente>(
    {
  id: 0,
  Nombre: "Cliente",
  Apellido: "General",
  Telefono: "",
  Direccion: "",
  Credito: 0,
  NCliente: 0
}
  );

  const [items, setItems] = useState<ItemVenta[]>([]);
  const [modalProductoAbierto, setModalProductoAbierto] = useState(false);
  const [modalClienteAbierto, setModalClienteAbierto] = useState(false);
  const [modalConfirmarAbierto, setModalConfirmarAbierto] = useState(false);

  const [error, setError] = useState("");

  const limpiarCamposProducto = () => {
    setProductoSeleccionado(null);
    setCantidad("1");
    setPrecio("0.00");
  };

  const agregar = () => {
    if (!productoSeleccionado) {
      setError("Selecciona un producto o servicio.");
      return;
    }

    if (isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
      setError("Ingresa una cantidad válida.");
      return;
    }

    if (isNaN(Number(precio)) || Number(precio) < 0) {
      setError("Ingresa un precio válido.");
      return;
    }

    const existe = items.some(
    (item) => item.productoId === productoSeleccionado.id
  );

  if (existe) {
    setError("Este producto ya fue agregado a la factura.");
    return;
  }

    setItems((prev) => [
      ...prev,
      {
        productoId: productoSeleccionado.id,
        nombre: productoSeleccionado.Nombre,
        marca: productoSeleccionado.Nombre_marca,
        cantidad: Number(cantidad),
        precio: Number(precio),
      },
    ]);

    setError("");
    limpiarCamposProducto();
  };

  const eliminarItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const total = items.reduce((suma, item) => suma + item.cantidad * item.precio, 0);

  const cancelar = () => {
    setItems([]);
    limpiarCamposProducto();
    setError("");
  };

  const realizarVenta = () => {
    if (items.length === 0) {
      setError("Agrega al menos un producto para realizar la venta.");
      return;
    }
 
    setError("");
    setModalConfirmarAbierto(true);
  };
 
  const confirmarVenta = async (
    montoRecibido: number,
    setErrorModal: (mensaje: string) => void
  ) => {
    try {

      const total = items.reduce((suma, item) => suma + item.cantidad * item.precio, 0);

      await crearVenta(
        Number(clienteSeleccionado?.id),
        1,
        tipoPago,
        total,
        items.map((item) => ({
          Id_producto: item.productoId,
          Cantidad: item.cantidad,
          Precio_Venta: item.precio,
          Subtotal: item.cantidad * item.precio,
        })),
      );
 
      setItems([]);
      setModalConfirmarAbierto(false);
      return true;
    } catch (error: any) {
      setErrorModal(error.response.data.mensaje);
      return false;
    }
  };

  return (
    <div className="factura-page">
        <div className="factura-contenido">
      <div className="factura-header">
        <h1>Facturación</h1>
        <p className="factura-subtitulo">
          Registre los productos y complete el pago de la transacción.
        </p>
        <p className="factura-fecha">Fecha: {formatearFecha(new Date())}</p>
      </div>

      <div className="factura-card">
        <div className="factura-fila-producto">
          <div className="factura-campo factura-campo-producto">
            <label>
              Producto o Servicio <span style={{ color: "#e5484d" }}>*</span>
            </label>
            <button
              type="button"
              className="factura-selector-btn"
              onClick={() => setModalProductoAbierto(true)}
            >
              <span
                className={
                  productoSeleccionado ? "Seleccione un producto" : "factura-selector-placeholder"
                }
              >
                {productoSeleccionado
                  ? productoSeleccionado.Nombre
                  : "Seleccione un producto"}
              </span>
            </button>
          </div>

          <div className="factura-campo factura-campo-cantidad">
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

          <div className="factura-campo factura-campo-precio">
            <label>
              Precio <span style={{ color: "#e5484d" }}>*</span>
            </label>
            <div className="factura-precio-input">
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

          <button className="factura-btn-agregar" onClick={agregar}>
            Agregar
          </button>
        </div>
      </div>

      <div className="factura-fila-doble">
        <div className="factura-card">
          <div className="factura-campo">
            <label>
              Tipo de Pago <span style={{ color: "#e5484d" }}>*</span>
            </label>
            <select value={tipoPago} onChange={(e) => setTipoPago(e.target.value)}>
              <option value="Contado">Contado</option>
              <option value="Credito">Crédito</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </div>
        </div>

        <div className="factura-card">
          <div className="factura-campo">
            <label>
              Seleccionar Cliente <span style={{ color: "#e5484d" }}>*</span>
            </label>
            <button type="button" className="factura-selector-btn"
            onClick={() => setModalClienteAbierto(true)}>
              {`${clienteSeleccionado?.Nombre} ${clienteSeleccionado?.Apellido}` ? `${clienteSeleccionado?.Nombre} ${clienteSeleccionado?.Apellido}` : "Cliente General"}
            </button>
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
              <tr key={index}>
                <td>
                  {item.nombre}
                  {item.marca && (
                    <span className="factura-nombre-marca">{item.marca}</span>
                  )}
                </td>
                <td>{item.cantidad}</td>
                <td>C${item.precio.toFixed(2)}</td>
                <td className="factura-td-subtotal">
                  C${(item.cantidad * item.precio).toFixed(2)}
                </td>
                <td className="factura-td-accion">
                  <button
                    className="factura-btn-eliminar"
                    onClick={() => eliminarItem(index)}
                    aria-label="Eliminar producto"
                  >
                    🗑
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
            <span className="factura-total-monto">C${total.toFixed(2)}</span>
          </div>

          <button className="factura-btn-vender" onClick={realizarVenta}>
            Realizar Venta
          </button>
        </div>
      </div>
      </div>

      <ModalSeleccionarProducto
        abierto={modalProductoAbierto}
        onClose={() => setModalProductoAbierto(false)}
        onSeleccionar={(producto) => {
          setProductoSeleccionado(producto);
          setPrecio(producto.Precio_venta.toString());
          setModalProductoAbierto(false);
        }}
      />

      <ModalSeleccionarCliente
        abierto={modalClienteAbierto}
        onClose={() => setModalClienteAbierto(false)}
        onSeleccionar={(cliente) => {
          setClienteSeleccionado(cliente);
          setModalClienteAbierto(false);
        }}
      />
 
      <ModalConfirmarVenta
        abierto={modalConfirmarAbierto}
        totalVenta={total}
        onClose={() => setModalConfirmarAbierto(false)}
        onConfirmar={confirmarVenta}
      />
    </div>
  );
}

export default Facturacion;