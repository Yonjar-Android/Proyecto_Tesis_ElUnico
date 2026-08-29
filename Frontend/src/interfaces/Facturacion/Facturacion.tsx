import { useState, useEffect } from "react";
import "./Facturacion.css";
import ModalSeleccionarProducto from "./ModalSeleccionarProducto";
import ModalSeleccionarServicio from "./ModalSeleccionarServicio";
import ModalSeleccionarCliente from "./ModalSeleccionarCliente";
import ModalConfirmarVenta, {
  type DetalleConfirmacionVenta,
} from "./ModalConfirmarVenta";
import type { Cliente } from "../../models/Cliente";
import type { ProductoListado } from "../../models/ProductoListado";
import type { Servicio } from "../../models/Servicio";
import { crearVenta, obtenerReciboVenta } from "../../services/venta.service";
import { SquarePen, Trash2 } from "lucide-react";
import { obtenerSesionActiva } from "../../services/caja.service";
import { formatearMoneda } from "../FuncionAuxiliar"
import Notificacion, { type TipoNotificacion } from "../../components/Notification/Notification";
import ModalConfirmarImpresion from "./ModalConfirmarImpresion";
import { type DatosRecibo } from "../../models/Recibo";

type ItemVenta =
  | {
      tipo: "producto";
      producto: ProductoListado;
      cantidad: number;
      descuento: number;
      precio: number;
    }
  | {
      tipo: "servicio";
      servicio: Servicio;
      cantidad: number;
      descuento: number;
      precio: number;
    };

function formatearFecha(fecha: Date) {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  return `${dia}-${mes}-${anio}`;
}

function subtotalBruto(item: ItemVenta) {
  return item.cantidad * item.precio;
}

function subtotalNeto(item: ItemVenta) {
  return subtotalBruto(item) - item.descuento;
}

function Facturacion() {
  const [tipoSeleccion, setTipoSeleccion] = useState<"producto" | "servicio">(
    "producto"
  );

  const [productoSeleccionado, setProductoSeleccionado] =
    useState<ProductoListado | null>(null);
  const [servicioSeleccionado, setServicioSeleccionado] =
    useState<Servicio | null>(null);

  const [cantidad, setCantidad] = useState("1");
  const [descuento, setDescuento] = useState("0.00");
  const [precio, setPrecio] = useState("0.00");
  const [tipoPago, setTipoPago] = useState("Contado");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente>({
    id: 10,
    Nombre: "Cliente",
    Apellido: "General",
    Telefono: "",
    Direccion: "",
    Saldo_Deuda: 0,
    NCliente: 0,
  });

  const [notif, setNotif] = useState<{ mensaje: string; tipo: TipoNotificacion } | null>(null);

  const [modalReciboAbierto, setModalReciboAbierto] = useState(false);
  const [datosRecibo, setDatosRecibo] = useState<DatosRecibo | null>(null);

  const [items, setItems] = useState<ItemVenta[]>([]);
  const [indiceEditando, setIndiceEditando] = useState<number | null>(null);

  const [modalProductoAbierto, setModalProductoAbierto] = useState(false);
  const [modalServicioAbierto, setModalServicioAbierto] = useState(false);
  const [modalClienteAbierto, setModalClienteAbierto] = useState(false);
  const [modalConfirmarAbierto, setModalConfirmarAbierto] = useState(false);

  const [error, setError] = useState("");
  const [cajaAbierta, setCajaAbierta] = useState<boolean | null>(null);

  useEffect(() => {
    const verificarCaja = async () => {
      try {
        const data = await obtenerSesionActiva();
        setCajaAbierta(Boolean(data.sesionActiva ?? data.sesion));
      } catch {
        setCajaAbierta(false);
      }
    };
    verificarCaja();
  }, []);

  const limpiarCamposItem = () => {
    setProductoSeleccionado(null);
    setServicioSeleccionado(null);
    setCantidad("1");
    setDescuento("0.00");
    setPrecio("0.00");
  };

  const cancelarEdicion = () => {
    setIndiceEditando(null);
    limpiarCamposItem();
    setError("");
  };

  const editarItem = (index: number) => {
    const item = items[index];

    if (item.tipo === "producto") {
      setTipoSeleccion("producto");
      setProductoSeleccionado(item.producto);
      setServicioSeleccionado(null);
    } else {
      setTipoSeleccion("servicio");
      setServicioSeleccionado(item.servicio);
      setProductoSeleccionado(null);
    }

    setCantidad(String(item.cantidad));
    setDescuento(formatearMoneda(item.descuento));
    setPrecio(formatearMoneda(item.precio));
    setIndiceEditando(index);
    setError("");
  };

  const eliminarItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));

    if (indiceEditando === index) {
      cancelarEdicion();
    }
  };

  const guardarItem = () => {
    const itemBase = tipoSeleccion === "producto" ? productoSeleccionado : servicioSeleccionado;

    if (!itemBase) {
      setError(
        tipoSeleccion === "producto"
          ? "Selecciona un producto."
          : "Selecciona un servicio."
      );
      return;
    }

    if (isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
      setError("Ingresa una cantidad válida.");
      return;
    }

    // El stock solo aplica a productos; los servicios no tienen existencias.
    if (
      tipoSeleccion === "producto" &&
      productoSeleccionado &&
      Number(cantidad) > productoSeleccionado.Stock
    ) {
      setError("La cantidad ingresada es mayor que el stock disponible.");
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
      setError("El descuento no puede ser mayor al subtotal.");
      return;
    }

    const yaExiste = items.some((item, i) => {
      if (i === indiceEditando) return false;
      if (item.tipo !== tipoSeleccion) return false;
      const idActual = tipoSeleccion === "producto" ? productoSeleccionado?.id : servicioSeleccionado?.id;
      const idItem = item.tipo === "producto" ? item.producto.id : item.servicio.id;
      return idItem === idActual;
    });

    if (yaExiste) {
      setError(
        tipoSeleccion === "producto"
          ? "Este producto ya fue agregado a la factura."
          : "Este servicio ya fue agregado a la factura."
      );
      return;
    }

    const itemGuardado: ItemVenta =
      tipoSeleccion === "producto"
        ? {
            tipo: "producto",
            producto: productoSeleccionado as ProductoListado,
            cantidad: Number(cantidad),
            descuento: Number(descuento),
            precio: Number(precio),
          }
        : {
            tipo: "servicio",
            servicio: servicioSeleccionado as Servicio,
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
    limpiarCamposItem();
  };

  const subtotalGeneral = items.reduce((suma, item) => suma + subtotalBruto(item), 0);
  const descuentoGeneral = items.reduce((suma, item) => suma + item.descuento, 0);
  const totalGeneral = subtotalGeneral - descuentoGeneral;

  const cancelar = () => {
    setItems([]);
    cancelarEdicion();
  };

  const realizarVenta = () => {
    if (!cajaAbierta) {
      setError("No se puede realizar la venta: la caja está cerrada. Abra una sesión de caja primero.");
      return;
    }

    if (items.length === 0) {
      setError("Agrega al menos un producto o servicio para realizar la venta.");
      return;
    }

    setError("");
    setModalConfirmarAbierto(true);
  };

  const confirmarVenta = async (
    _detalle: DetalleConfirmacionVenta,
    setErrorModal: (mensaje: string) => void
  ): Promise<boolean> => {
    try {
      const { idVenta } = await crearVenta(
        Number(clienteSeleccionado?.id),
        tipoPago,
        totalGeneral,
        items.map((item) =>
          item.tipo === "producto"
            ? {
                Id_producto: item.producto.id,
                Cantidad: item.cantidad,
                Precio_Venta: item.precio,
                Descuento: item.descuento,
                Subtotal: subtotalNeto(item),
              }
            : {
                Id_servicio: item.servicio.id,
                Cantidad: item.cantidad,
                Precio_Venta: item.precio,
                Descuento: item.descuento,
                Subtotal: subtotalNeto(item),
              }
        )
      );

      console.log(idVenta);

      const recibo = await obtenerReciboVenta(idVenta);

      setNotif({ mensaje: "Venta registrada correctamente", tipo: "exito" });

      setDatosRecibo(recibo);
      setModalReciboAbierto(true);
      console.log("Hellouda");
      setItems([]);
      setModalConfirmarAbierto(false);
      return true;
    } catch (error: any) {
      setNotif({ mensaje: "No se pudo registrar la venta", tipo: "error" });

      setErrorModal(error?.response?.data?.mensaje ?? "Error al confirmar la venta.");
      return false;
    }
  };

  const cambiarTipoSeleccion = (tipo: "producto" | "servicio") => {
    if (tipo === tipoSeleccion) return;
    setTipoSeleccion(tipo);
    setProductoSeleccionado(null);
    setServicioSeleccionado(null);
    setPrecio("0.00");
  };

  return (
    <div className="factura-page">

          {notif && (
  <Notificacion
    mensaje={notif.mensaje}
    tipo={notif.tipo}
    onCerrar={() => setNotif(null)}
  />
)}
      <div className="factura-contenido">
        <div className="factura-header">
          {cajaAbierta === false && (
            <div className="factura-alerta-caja">
              ⚠ La caja está cerrada. Debe abrir una sesión de caja antes de facturar.
            </div>
          )}
          <h1>Ventas</h1>
          <p className="factura-subtitulo">
            Registre los productos y complete el pago de la transacción.
          </p>
          <p className="factura-fecha">Fecha: {formatearFecha(new Date())}</p>
        </div>

        <div className="factura-card">
          <div className="factura-tipo-toggle">
            <button
              type="button"
              className={
                "factura-tipo-btn" +
                (tipoSeleccion === "producto" ? " factura-tipo-btn--activo" : "")
              }
              onClick={() => cambiarTipoSeleccion("producto")}
            >
              Producto
            </button>
            <button
              type="button"
              className={
                "factura-tipo-btn" +
                (tipoSeleccion === "servicio" ? " factura-tipo-btn--activo" : "")
              }
              onClick={() => cambiarTipoSeleccion("servicio")}
            >
              Servicio
            </button>
          </div>

          <div className="factura-fila-producto">
            <div className="factura-campo factura-campo-producto">
              <div className="factura-campo-label-fila">
                <label>
                  {tipoSeleccion === "producto" ? "Producto" : "Servicio"}{" "}
                  <span style={{ color: "#e5484d" }}>*</span>
                </label>

                {tipoSeleccion === "producto" && productoSeleccionado && (
                  <span className="factura-stock-disponible">
                    Stock: {productoSeleccionado.Stock}
                  </span>
                )}
              </div>

              <button
                type="button"
                className="factura-selector-btn"
                onClick={() =>
                  tipoSeleccion === "producto"
                    ? setModalProductoAbierto(true)
                    : setModalServicioAbierto(true)
                }
              >
                <span
                  className={
                    productoSeleccionado || servicioSeleccionado
                      ? ""
                      : "factura-selector-placeholder"
                  }
                >
                  {tipoSeleccion === "producto"
                    ? productoSeleccionado?.Nombre ?? "Seleccione un producto"
                    : servicioSeleccionado?.Nombre_servicio ?? "Seleccione un servicio"}
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

            <button className="factura-btn-agregar" onClick={guardarItem}>
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
                <option
  value="Credito"
  disabled={clienteSeleccionado.id === 10}
>
  Crédito
</option>
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
                <th>Producto / Servicio</th>
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
                    {item.tipo === "producto" ? item.producto.Nombre : item.servicio.Nombre_servicio}
                    {item.tipo === "producto" && item.producto.Nombre_marca && (
                      <span className="factura-nombre-marca">
                        {item.producto.Nombre_marca}
                      </span>
                    )}
                    {item.tipo === "servicio" && (
                      <span className="factura-nombre-marca">Servicio</span>
                    )}
                  </td>
                  <td>{item.cantidad}</td>
                  <td>C${formatearMoneda(item.precio)}</td>
                  <td>
                    {item.descuento > 0 ? `- C$${formatearMoneda(item.descuento)}` : "—"}
                  </td>
                  <td className="factura-td-subtotal">C${formatearMoneda(subtotalNeto(item))}</td>
                  <td className="factura-td-accion">
                    <button
                      className="factura-btn-editar"
                      onClick={() => editarItem(index)}
                      aria-label="Editar"
                    >
                      <SquarePen size={24} />
                    </button>

                    <button
                      className="factura-btn-eliminar"
                      onClick={() => eliminarItem(index)}
                      aria-label="Eliminar"
                    >
                      <Trash2 size={24} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {items.length === 0 && (
            <div className="factura-vacio">Aún no has agregado productos ni servicios a la venta.</div>
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
                <span>C${formatearMoneda(subtotalGeneral)}</span>
              </div>
              <div className="factura-total-linea factura-total-linea--descuento">
                <span>Descuento</span>
                <span>- C${formatearMoneda(descuentoGeneral)}</span>
              </div>
              <div className="factura-total-linea factura-total-linea--total">
                <span>Total</span>
                <span>C${formatearMoneda(totalGeneral)}</span>
              </div>
            </div>

            <button
              className="factura-btn-vender"
              onClick={realizarVenta}
              disabled={!cajaAbierta}
              title={!cajaAbierta ? "La caja está cerrada" : undefined}
            >
              Realizar Venta
            </button>
          </div>
        </div>
      </div>

      <ModalSeleccionarProducto
        abierto={modalProductoAbierto}
        onClose={() => setModalProductoAbierto(false)}
        validarStock
        onSeleccionar={(producto, cant) => {
          setProductoSeleccionado(producto);
          setServicioSeleccionado(null);
          setPrecio(producto.Precio_venta.toString());
          setCantidad(cant.toString());
          setModalProductoAbierto(false);
        }
        }
      />

      <ModalSeleccionarServicio
        abierto={modalServicioAbierto}
        onClose={() => setModalServicioAbierto(false)}
        onSeleccionar={(servicio) => {
          setServicioSeleccionado(servicio);
          setProductoSeleccionado(null);
          setPrecio(servicio.Precio.toString());
          setModalServicioAbierto(false);
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
        tipoPago={tipoPago}
        onClose={() => setModalConfirmarAbierto(false)}
        onConfirmar={confirmarVenta}
      />

      <ModalConfirmarImpresion
        abierto={modalReciboAbierto}
        datos={datosRecibo}
        onClose={() => setModalReciboAbierto(false)}
      />
    </div>
  );
}

export default Facturacion;