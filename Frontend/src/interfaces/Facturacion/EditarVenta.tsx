import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import "./Facturacion.css";
import styles from "./EditarVenta.module.css";
import ModalSeleccionarProducto from "./ModalSeleccionarProducto";
import ModalSeleccionarServicio from "./ModalSeleccionarServicio";
import ModalCobrarDiferencia from "./ModalCobrarDiferencia";
import ModalConfirmacion from "./ModalConfirmacion";
import Notificacion, { type TipoNotificacion } from "../../components/Notification/Notification";
import { formatearMoneda } from "../FuncionAuxiliar";
import { obtenerVentaParaEditar, actualizarVenta } from "../../services/venta.service";

type TipoDescuento = "porcentaje" | "fijo";
type MetodoAjuste = "Efectivo" | "Transferencia";

interface ItemEdicion {
  tipo: "producto" | "servicio";
  id: number;
  nombre: string;
  marca?: string | null;
  cantidad: number;
  precio: number;
  descuento: number;
  tipoDescuento: TipoDescuento;
  stockMaximo?: number | null;
  esNuevo?: boolean; // solo los ítems nuevos permiten editar el descuento
}

interface ConfirmacionPendiente {
  titulo: string;
  mensaje: ReactNode;
  advertencia?: string;
  textoConfirmar: string;
  peligro?: boolean;
}

const soloEnteros = (v: string) => v.replace(/[^0-9]/g, "");

const descuentoLinea = (i: ItemEdicion) =>
  (i.tipoDescuento === "porcentaje" ? i.precio * (i.descuento / 100) : i.descuento) * i.cantidad;

const subtotalNeto = (i: ItemEdicion) => i.cantidad * i.precio - descuentoLinea(i);

function EditarVenta() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cargando, setCargando] = useState(true);
  const [cliente, setCliente] = useState("");
  const [tipoPago, setTipoPago] = useState("");
  const [editable, setEditable] = useState(true);
  const [puedeAnular, setPuedeAnular] = useState(false);
  const [motivoBloqueo, setMotivoBloqueo] = useState<string | null>(null);
  const [estado, setEstado] = useState<"Pagada" | "Anulada">("Pagada");
  const [items, setItems] = useState<ItemEdicion[]>([]);
  const [totalOriginal, setTotalOriginal] = useState(0);

  const [tipoSeleccion, setTipoSeleccion] = useState<"producto" | "servicio">("producto");
  const [modalProductoAbierto, setModalProductoAbierto] = useState(false);
  const [modalServicioAbierto, setModalServicioAbierto] = useState(false);
  const [modalCobroAbierto, setModalCobroAbierto] = useState(false);
  const [confirmacion, setConfirmacion] = useState<ConfirmacionPendiente | null>(null);

  const [metodoAjuste, setMetodoAjuste] = useState<MetodoAjuste>("Efectivo");
  const [refAjuste, setRefAjuste] = useState("");

  const [error, setError] = useState("");
  const [notif, setNotif] = useState<{ mensaje: string; tipo: TipoNotificacion } | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const v = await obtenerVentaParaEditar(Number(id));
        setCliente(v.clienteNombre);
        setTipoPago(v.tipoPago);
        setEditable(v.editable);
        setPuedeAnular(Boolean(v.puedeAnular));
        setMotivoBloqueo(v.motivoBloqueo);
        setItems(v.items);
        setTotalOriginal(Number(v.total));
        setMetodoAjuste(String(v.tipoPago).toUpperCase() === "TRANSFERENCIA" ? "Transferencia" : "Efectivo");
      } catch (err: any) {
        setNotif({ mensaje: err?.response?.data?.mensaje ?? "No se pudo cargar la factura.", tipo: "error" });
      } finally {
        setCargando(false);
      }
    })();
  }, [id]);

  const anulando = estado === "Anulada";
  const subtotal = items.reduce((s, i) => s + i.cantidad * i.precio, 0);
  const descuento = items.reduce((s, i) => s + descuentoLinea(i), 0);
  const total = subtotal - descuento;

  const diferencia = Math.round((total - totalOriginal) * 100) / 100;
  // > 0 se cobra, < 0 se devuelve. Al anular, se devuelve el total completo.
  const montoAjuste = anulando ? -totalOriginal : diferencia;

  // ───────── Edición de ítems ─────────
  const cambiarCantidad = (index: number, valor: string) => {
    const nueva = Math.max(1, Math.floor(Number(valor)) || 1);
    const item = items[index];
    if (item.stockMaximo != null && nueva > item.stockMaximo) {
      setError(`"${item.nombre}": máximo disponible para esta factura es ${item.stockMaximo}.`);
      return;
    }
    setError("");
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, cantidad: nueva } : it)));
  };

  const cambiarDescuento = (index: number, valor: string) => {
    const n = Number(soloEnteros(valor)) || 0;
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, descuento: n } : it)));
  };

  const cambiarTipoDescuento = (index: number, tipo: TipoDescuento) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, tipoDescuento: tipo, descuento: 0 } : it))
    );
  };

  const eliminarItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const agregarItem = (nuevo: ItemEdicion) => {
    if (items.some((i) => i.tipo === nuevo.tipo && i.id === nuevo.id)) {
      setError("Ese producto o servicio ya está en la factura. Modifica su cantidad.");
      return;
    }
    setError("");
    setItems((prev) => [...prev, nuevo]);
  };

  // ───────── Guardado ─────────
  const validarItems = (): boolean => {
    if (!anulando && items.length === 0) {
      setError("La factura debe tener al menos un producto o servicio.");
      return false;
    }
    if (!anulando) {
      for (const i of items.filter((x) => x.esNuevo)) {
        if (i.tipoDescuento === "porcentaje" && i.descuento > 50) {
          setError(`"${i.nombre}": el porcentaje de descuento no puede ser mayor a 50%.`);
          return false;
        }
        const unit = i.tipoDescuento === "porcentaje" ? i.precio * (i.descuento / 100) : i.descuento;
        if (unit > i.precio) {
          setError(`"${i.nombre}": el descuento no puede ser mayor al precio unitario.`);
          return false;
        }
      }
    }
    return true;
  };

  // Envía al backend. Lanza el error para que quien llame decida cómo mostrarlo.
  const enviarGuardado = async (dineroRecibido = 0) => {
    await actualizarVenta(
      Number(id),
      estado,
      anulando
        ? []
        : items.map((i) => ({
            ...(i.tipo === "producto" ? { Id_producto: i.id } : { Id_servicio: i.id }),
            Cantidad: i.cantidad,
            // el backend solo usa el descuento de los ítems nuevos
            ...(i.esNuevo ? { Descuento: i.descuento, Tipo_Descuento: i.tipoDescuento } : {}),
          })),
      { metodo: metodoAjuste, recibidoCordobas: dineroRecibido, referencia: refAjuste.trim() }
    );

    setError("");
    setNotif({
      mensaje: anulando ? "Factura anulada correctamente" : "Factura actualizada correctamente",
      tipo: "exito",
    });
    setTimeout(() => navigate("/facturacion"), 2000);
  };

  // Guarda sin pasar por el modal de cobro (devoluciones, transferencias, sin cambio de total)
  const ejecutarGuardado = async () => {
    try {
      setGuardando(true);
      await enviarGuardado();
    } catch (err: any) {
      setNotif({ mensaje: "Ocurrió un error al guardar la factura", tipo: "error" });
      setError(err?.response?.data?.mensaje ?? "Error desconocido.");
      setGuardando(false);
    }
  };

  const guardar = async () => {
    if (!id || !validarItems()) return;

    if (montoAjuste !== 0 && metodoAjuste === "Transferencia" && !refAjuste.trim()) {
      setError("Ingresa la referencia de la transferencia del ajuste.");
      return;
    }

    setError("");

    // Cobro en efectivo: modal de cobro sobre la diferencia
    if (montoAjuste > 0 && metodoAjuste === "Efectivo") {
      setModalCobroAbierto(true);
      return;
    }

    const monto = formatearMoneda(Math.abs(montoAjuste));
    const metodo = metodoAjuste.toLowerCase();

    if (anulando) {
      setConfirmacion({
        titulo: "Anular factura",
        mensaje: (
          <>
            Se devolverán <strong>C${monto}</strong> al cliente por {metodo}.
          </>
        ),
        advertencia: "Se devolverá el stock de los productos y esta acción no se puede revertir.",
        textoConfirmar: "Anular factura",
        peligro: true,
      });
      return;
    }

    if (montoAjuste < 0) {
      setConfirmacion({
        titulo: "Devolver dinero al cliente",
        mensaje: (
          <>
            El total bajó. Devuelve <strong>C${monto}</strong> al cliente por {metodo}.
          </>
        ),
        textoConfirmar: "Guardar cambios",
      });
      return;
    }

    if (montoAjuste > 0) {
      // Transferencia (el efectivo ya se manejó arriba)
      setConfirmacion({
        titulo: "Confirmar transferencia",
        mensaje: (
          <>
            Confirma que recibiste <strong>C${monto}</strong> por transferencia
            {refAjuste.trim() ? ` (ref. ${refAjuste.trim()})` : ""}.
          </>
        ),
        textoConfirmar: "Guardar cambios",
      });
      return;
    }

    await ejecutarGuardado();
  };

  const confirmarAccion = async () => {
    setConfirmacion(null);
    await ejecutarGuardado();
  };

  if (cargando) {
    return (
      <div className="factura-page">
        <div className="factura-contenido">
          <div className="factura-vacio">Cargando factura...</div>
        </div>
      </div>
    );
  }

  const bloqueado = !editable || anulando;

  return (
    <div className="factura-page">
      {notif && <Notificacion mensaje={notif.mensaje} tipo={notif.tipo} onCerrar={() => setNotif(null)} />}

      <div className="factura-contenido">
        <div className="factura-header">
          <div className="header-help">
            <button
              type="button"
              className="categoria-add-btn"
              onClick={() => navigate("/facturacion")}
              title="Volver a Ventas"
            >
              <ArrowLeft size={18} />
            </button>
            <h1>Editar Factura #{id}</h1>
            <span />
          </div>
        </div>

        {!editable && <div className="factura-alerta-caja">⚠ {motivoBloqueo}</div>}

        <div className="factura-fila-doble">
          <div className="factura-card">
            <div className="factura-campo">
              <label>Cliente</label>
              <input type="text" value={cliente} readOnly />
            </div>
            <div className={`factura-campo ${styles.campoSeparado}`}>
              <label>Tipo de pago</label>
              <input type="text" value={tipoPago} readOnly />
            </div>
          </div>

          <div className="factura-card">
            <div className="factura-campo">
              <label>Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as "Pagada" | "Anulada")}
                disabled={!editable}
              >
                <option value="Pagada">Pagada</option>
                <option value="Anulada" disabled={!puedeAnular}>
                  {puedeAnular ? "Anulada" : "Anulada (solo facturas de hoy)"}
                </option>
              </select>
            </div>
            {anulando && (
              <p className="error-text">
                Al guardar, la factura quedará anulada y el stock de sus productos se devolverá. No se puede
                revertir.
              </p>
            )}
          </div>
        </div>

        {/* Cobro o devolución de la diferencia */}
        {editable && montoAjuste !== 0 && (
          <div className="factura-card">
            <p className="factura-credito-titulo">
              {montoAjuste > 0
                ? `Cobrar diferencia: C$${formatearMoneda(montoAjuste)}`
                : `Devolver al cliente: C$${formatearMoneda(Math.abs(montoAjuste))}`}
            </p>
            <div className="factura-credito-grid">
              <div className="factura-campo">
                <label>Método</label>
                <select
                  value={metodoAjuste}
                  onChange={(e) => setMetodoAjuste(e.target.value as MetodoAjuste)}
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
              </div>

              {metodoAjuste === "Transferencia" && (
                <div className="factura-campo">
                  <label>
                    Referencia <span style={{ color: "#e5484d" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={refAjuste}
                    onChange={(e) => setRefAjuste(e.target.value)}
                    placeholder="Ej. 000123456"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Agregar / reemplazar productos */}
        <div className="factura-card">
          <div className="factura-tipo-toggle">
            {(["producto", "servicio"] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={"factura-tipo-btn" + (tipoSeleccion === t ? " factura-tipo-btn--activo" : "")}
                onClick={() => setTipoSeleccion(t)}
              >
                {t === "producto" ? "Producto" : "Servicio"}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="factura-btn-agregar"
            disabled={bloqueado}
            onClick={() =>
              tipoSeleccion === "producto" ? setModalProductoAbierto(true) : setModalServicioAbierto(true)
            }
          >
            Agregar {tipoSeleccion}
          </button>
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
                <tr key={`${item.tipo}-${item.id}`}>
                  <td>
                    {item.nombre}
                    <span className="factura-nombre-marca">
                      {item.tipo === "servicio" ? "Servicio" : item.marca ?? ""}
                    </span>
                  </td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      max={item.stockMaximo ?? undefined}
                      value={item.cantidad}
                      disabled={bloqueado}
                      onChange={(e) => cambiarCantidad(index, e.target.value)}
                      className={styles.inputCantidad}
                    />
                  </td>
                  <td>C${formatearMoneda(item.precio)}</td>
                  <td>
                    {item.esNuevo && !bloqueado ? (
                      <div className={`factura-precio-input factura-descuento-grupo ${styles.descuentoGrupo}`}>
                        <select
                          className="factura-descuento-tipo"
                          value={item.tipoDescuento}
                          onChange={(e) => cambiarTipoDescuento(index, e.target.value as TipoDescuento)}
                        >
                          <option value="fijo">C$</option>
                          <option value="porcentaje">%</option>
                        </select>
                        <input
                          type="number"
                          min="0"
                          max={item.tipoDescuento === "porcentaje" ? 50 : undefined}
                          value={item.descuento}
                          onChange={(e) => cambiarDescuento(index, e.target.value)}
                        />
                      </div>
                    ) : item.descuento > 0 ? (
                      item.tipoDescuento === "porcentaje" ? (
                        `${item.descuento}% (- C$${formatearMoneda(descuentoLinea(item))})`
                      ) : (
                        `- C$${formatearMoneda(descuentoLinea(item))}`
                      )
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="factura-td-subtotal">C${formatearMoneda(subtotalNeto(item))}</td>
                  <td className="factura-td-accion">
                    <button
                      className="factura-btn-eliminar"
                      onClick={() => eliminarItem(index)}
                      disabled={bloqueado}
                      title="Quitar de la factura"
                    >
                      <Trash2 size={22} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <div className="factura-vacio">La factura no tiene productos.</div>}
        </div>

        {error && <span className="error-text">{error}</span>}

        <div className="factura-footer">
          <button className="factura-btn-cancelar" onClick={() => navigate("/facturacion")} disabled={guardando}>
            Cancelar
          </button>

          <div className="factura-total-venta">
            <div className="factura-total-desglose">
              <div className="factura-total-linea">
                <span>Subtotal</span>
                <span>C${formatearMoneda(subtotal)}</span>
              </div>
              <div className="factura-total-linea factura-total-linea--descuento">
                <span>Descuento</span>
                <span>- C${formatearMoneda(descuento)}</span>
              </div>
              <div className="factura-total-linea factura-total-linea--total">
                <span>Total</span>
                <span>C${formatearMoneda(total)}</span>
              </div>
            </div>

            <button className="factura-btn-vender" onClick={guardar} disabled={!editable || guardando}>
              {guardando ? "Guardando..." : anulando ? "Anular Factura" : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </div>

      <ModalSeleccionarProducto
        abierto={modalProductoAbierto}
        onClose={() => setModalProductoAbierto(false)}
        validarStock
        onSeleccionar={(producto, cant) => {
          agregarItem({
            tipo: "producto",
            id: producto.id,
            nombre: producto.Nombre,
            marca: producto.Nombre_marca,
            cantidad: cant,
            precio: Number(producto.Precio_venta),
            descuento: 0,
            tipoDescuento: "fijo",
            stockMaximo: producto.Stock,
            esNuevo: true,
          });
          setModalProductoAbierto(false);
        }}
      />

      <ModalSeleccionarServicio
        abierto={modalServicioAbierto}
        onClose={() => setModalServicioAbierto(false)}
        onSeleccionar={(servicio) => {
          agregarItem({
            tipo: "servicio",
            id: servicio.id,
            nombre: servicio.Nombre_servicio,
            cantidad: 1,
            precio: Number(servicio.Precio),
            descuento: 0,
            tipoDescuento: "fijo",
            esNuevo: true,
          });
          setModalServicioAbierto(false);
        }}
      />

      {/* Cobro en efectivo de la diferencia */}
      <ModalCobrarDiferencia
        abierto={modalCobroAbierto}
        totalAnterior={totalOriginal}
        totalNuevo={total}
        onClose={() => setModalCobroAbierto(false)}
        onConfirmar={async (detalle, setErrorModal) => {
          try {
            setGuardando(true);
            await enviarGuardado(detalle.dineroRecibido);
            setModalCobroAbierto(false);
            return true;
          } catch (err: any) {
            setErrorModal(err?.response?.data?.mensaje ?? "Error al guardar la factura.");
            setGuardando(false);
            return false;
          }
        }}
      />

      {/* Confirmaciones (anular, devolver dinero, transferencia) */}
      <ModalConfirmacion
        abierto={confirmacion !== null}
        titulo={confirmacion?.titulo ?? ""}
        mensaje={confirmacion?.mensaje}
        advertencia={confirmacion?.advertencia}
        textoConfirmar={confirmacion?.textoConfirmar}
        peligro={confirmacion?.peligro}
        onCancelar={() => setConfirmacion(null)}
        onConfirmar={confirmarAccion}
      />
    </div>
  );
}

export default EditarVenta;