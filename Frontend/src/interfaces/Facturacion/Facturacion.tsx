import { useState } from "react";
import "./Facturacion.css";
import ModalSeleccionarProducto from "./ModalSeleccionarProducto";
import ModalSeleccionarCliente from "./ModalSeleccionarCliente";
import ModalConfirmarVenta from "./ModalConfirmarVenta";
import type { Cliente } from "../../models/Cliente";
import type { ProductoListado } from "../../models/ProductoListado";
import { crearVenta } from "../../services/venta.service";
import { SquarePen, Trash2 } from "lucide-react";

interface ItemVenta {
  producto: ProductoListado;
  cantidad: number;
  descuento: number;
  precio: number;
}

function formatearFecha(fecha: Date) {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  return `${dia}-${mes}-${anio}`;
}

// Subtotal de una línea ANTES de descuento (cantidad * precio).
function subtotalBruto(item: ItemVenta) {
  return item.cantidad * item.precio;
}

// Subtotal de una línea DESPUÉS de descuento (lo que realmente se cobra).
function subtotalNeto(item: ItemVenta) {
  return subtotalBruto(item) - item.descuento;
}

function Facturacion() {
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoListado | null>(null);
  const [cantidad, setCantidad] = useState("1");
  const [descuento, setDescuento] = useState("0.00");
  const [precio, setPrecio] = useState("0.00");
  const [tipoPago, setTipoPago] = useState("Contado");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente>({
    id: 7,
    Nombre: "Cliente",
    Apellido: "General",
    Telefono: "",
    Direccion: "",
    Saldo_Deuda: 0,
    NCliente: 0,
  });

  const [items, setItems] = useState<ItemVenta[]>([]);

  // null = modo "agregar". Cualquier otro valor = índice de la fila que se está editando.
  const [indiceEditando, setIndiceEditando] = useState<number | null>(null);

  const [modalProductoAbierto, setModalProductoAbierto] = useState(false);
  const [modalClienteAbierto, setModalClienteAbierto] = useState(false);
  const [modalConfirmarAbierto, setModalConfirmarAbierto] = useState(false);

  const [error, setError] = useState("");

  const limpiarCamposProducto = () => {
    setProductoSeleccionado(null);
    setCantidad("1");
    setDescuento("0.00");
    setPrecio("0.00");
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
    setDescuento(item.descuento.toFixed(2));
    setPrecio(item.precio.toFixed(2));
    setIndiceEditando(index);
    setError("");
  };

  const eliminarItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));

    // Si borras justo la fila que estabas editando, sales del modo edición.
    if (indiceEditando === index) {
      cancelarEdicion();
    }
  };

  // Agrega una fila nueva, o actualiza la fila indiceEditando si estás en modo edición.
  const guardarProducto = () => {
    if (!productoSeleccionado) {
      setError("Selecciona un producto o servicio.");
      return;
    }

    if (isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
      setError("Ingresa una cantidad válida.");
      return;
    }

    if (isNaN(Number(precio)) || Number(precio) <= 0) {
      setError("Ingresa un precio válido.");
      return;
    }

    if (isNaN(Number(descuento)) || Number(descuento) < 0) {
      setError("Ingresa un descuento válido.");
      return;
    }

    const subtotalLinea = Number(cantidad) * Number(precio);

    if (Number(descuento) > subtotalLinea) {
      setError("El descuento no puede ser mayor al subtotal de la línea.");
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

    const itemGuardado: ItemVenta = {
      producto: productoSeleccionado,
      cantidad: Number(cantidad),
      descuento: Number(descuento),
      precio: Number(precio),
    };

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

  // Totales generales de la venta: subtotal bruto, descuento acumulado, y total neto.
  const subtotalGeneral = items.reduce((suma, item) => suma + subtotalBruto(item), 0);
  const descuentoGeneral = items.reduce((suma, item) => suma + item.descuento, 0);
  const totalGeneral = subtotalGeneral - descuentoGeneral;

  const cancelar = () => {
    setItems([]);
    cancelarEdicion();
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
    _montoRecibido: number,
    setErrorModal: (mensaje: string) => void
  ) => {
    try {
      await crearVenta(
        Number(clienteSeleccionado?.id),
        1,
        tipoPago,
        totalGeneral,
        items.map((item) => ({
          Id_producto: item.producto.id,
          Cantidad: item.cantidad,
          Precio_Venta: item.precio,
          Descuento: item.descuento,
          Subtotal: subtotalNeto(item),
        }))
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
          <h1>Ventas</h1>
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
                <span className={productoSeleccionado ? "" : "factura-selector-placeholder"}>
                  {productoSeleccionado ? productoSeleccionado.Nombre : "Seleccione un producto"}
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

            <div className="factura-campo factura-campo-descuento">
              <label>Descuento</label>
              <div className="factura-precio-input">
                <span>C$</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={descuento}
                  onChange={(e) => setDescuento(e.target.value)}
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
              <button
                type="button"
                className="factura-selector-btn"
                onClick={() => setModalClienteAbierto(true)}
              >
                {clienteSeleccionado
                  ? `${clienteSeleccionado.Nombre} ${clienteSeleccionado.Apellido}`
                  : "Cliente General"}
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
                <th>Descuento</th>
                <th>Subtotal</th>
                <th className="factura-th-accion">Acción</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={index}
                  className={indiceEditando === index ? "factura-tr-editando" : ""}
                >
                  <td>
                    {item.producto.Nombre}
                    {item.producto.Nombre_marca && (
                      <span className="factura-nombre-marca">
                        {item.producto.Nombre_marca}
                      </span>
                    )}
                  </td>
                  <td>{item.cantidad}</td>
                  <td>C${item.precio.toFixed(2)}</td>
                  <td>
                    {item.descuento > 0 ? `- C$${item.descuento.toFixed(2)}` : "—"}
                  </td>
                  <td className="factura-td-subtotal">C${subtotalNeto(item).toFixed(2)}</td>
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
            <div className="factura-total-desglose">
              <div className="factura-total-linea">
                <span>Subtotal</span>
                <span>C${subtotalGeneral.toFixed(2)}</span>
              </div>
              <div className="factura-total-linea factura-total-linea--descuento">
                <span>Descuento</span>
                <span>- C${descuentoGeneral.toFixed(2)}</span>
              </div>
              <div className="factura-total-linea factura-total-linea--total">
                <span>Total</span>
                <span>C${totalGeneral.toFixed(2)}</span>
              </div>
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
        totalVenta={totalGeneral}
        onClose={() => setModalConfirmarAbierto(false)}
        onConfirmar={confirmarVenta}
      />
    </div>
  );
}

export default Facturacion;