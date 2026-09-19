import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Compras.css";
import type { Proveedor } from "../../models/Proveedor";
import { obtenerDetalleCompra, actualizarCompra } from "../../services/compra.service";
import type { DetalleCompraDTO } from "../../models/CompraReporte";
import ModalSeleccionarProveedor from "./ModalSeleccionarProveedor";
import ItemsCompraForm, { type ItemCompra } from "./ItemsCompraForm";
import { ArrowLeft } from "lucide-react";
import { formatearMoneda } from "../FuncionAuxiliar";
import Notificacion, { type TipoNotificacion } from "../../components/Notification/Notification";

function EditarCompra() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cargando, setCargando] = useState(true);
  const [NFactura, setNFactura] = useState("");
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
  const [items, setItems] = useState<ItemCompra[]>([]);
  const [modalProveedorAbierto, setModalProveedorAbierto] = useState(false);

  const [error, setError] = useState("");
  const [notif, setNotif] = useState<{ mensaje: string; tipo: TipoNotificacion } | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!id) return;

    const cargar = async () => {
      setCargando(true);
      try {
        const detalle: DetalleCompraDTO = await obtenerDetalleCompra(Number(id));

        setNFactura(detalle.nFactura);
        setProveedorSeleccionado({
          id: detalle.idProveedor,
          Nombre_Empresa: detalle.proveedorNombre,
        } as Proveedor);

        // OJO: cada artículo necesita el objeto `producto` completo para que
        // ItemsCompraForm y la tabla lo puedan mostrar igual que en Compras.tsx.
        // Si tu endpoint no devuelve nombre de marca u otros campos de
        // ProductoListado, ajusta este mapeo o el backend para incluirlos.
        setItems(
          detalle.articulos.map((a) => ({
            producto: {
              id: a.idProducto,
              Nombre: a.nombre,
              Precio_venta: a.precioVentaActual,
            } as any,
            cantidad: a.cantidad,
            precio_compra: a.precio,
            precio_venta: a.precioVentaActual,
            idDetalle: a.idDetalle,
          }))
        );
      } catch (err: any) {
        setNotif({
          mensaje: err?.response?.data?.mensaje ?? "No se pudo cargar la compra.",
          tipo: "error",
        });
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [id]);

  const total = items.reduce((suma, item) => suma + item.cantidad * item.precio_compra, 0);

  const guardarCambios = async () => {
    if (!id) return;

    if (items.length === 0) {
      setError("La compra debe tener al menos un producto.");
      return;
    }

    if (!proveedorSeleccionado) {
      setError("Selecciona un proveedor.");
      return;
    }

    try {
      setGuardando(true);

      await actualizarCompra(
        Number(id),
        Number(proveedorSeleccionado.id),
        NFactura,
        total,
        items.map((item) => ({
          Id_producto: item.producto.id,
          Cantidad: item.cantidad,
          Precio: item.precio_compra,
          Subtotal: item.cantidad * item.precio_compra,
          Precio_venta: item.precio_venta,
        }))
      );

      setError("");
      setNotif({ mensaje: "Compra actualizada correctamente", tipo: "exito" });

      // Deja la notificación visible un momento antes de volver al historial.
      setTimeout(() => {
        navigate("/compras/historial");
      }, 2500);
    } catch (err: any) {
      setNotif({ mensaje: "Ocurrió un error al actualizar la compra", tipo: "error" });
      setError(err?.response?.data?.mensaje ?? "Error desconocido.");
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="factura-page">
        <div className="factura-contenido">
          <div className="factura-vacio">Cargando compra...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="factura-page">
      {notif && (
        <Notificacion mensaje={notif.mensaje} tipo={notif.tipo} onCerrar={() => setNotif(null)} />
      )}
      <div className="factura-contenido">
        <div className="factura-header">
          <div className="header-help">
            <button
              type="button"
              className="categoria-add-btn"
              onClick={() => navigate("/compras/historial")}
              title="Volver al historial"
            >
              <ArrowLeft size={18} />
            </button>
            <h1>Editar Compra</h1>
          </div>
        </div>

        <div className="factura-card">
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
                <span className={proveedorSeleccionado ? "" : "compra-selector-placeholder"}>
                  {proveedorSeleccionado ? proveedorSeleccionado.Nombre_Empresa : "Seleccione un proveedor"}
                </span>
              </button>
            </div>

            <div className="compra-campo compra-campo-factura">
              <label>
                N° Factura <span style={{ color: "#e5484d" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: FAC-102"
                value={NFactura}
                onChange={(e) => setNFactura(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="factura-card">
          <ItemsCompraForm items={items} setItems={setItems} onError={setError} />
        </div>

        {error && <span className="error-text">{error}</span>}

        <div className="factura-footer">
          <button
            className="factura-btn-cancelar"
            onClick={() => navigate("/compras/historial")}
            disabled={guardando}
          >
            Cancelar
          </button>

          <div className="factura-total-venta">
            <div className="factura-total-texto">
              <span className="factura-total-label">Total</span>
              <span className="factura-total-monto">C${formatearMoneda(total)}</span>
            </div>

            <button
              className="factura-btn-vender"
              onClick={guardarCambios}
              disabled={items.length === 0 || guardando}
            >
              {guardando ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </div>

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

export default EditarCompra;