import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Compras.css";
import type { Proveedor } from "../../models/Proveedor";
import { crearCompra } from "../../services/compra.service";
import ModalSeleccionarProveedor from "./ModalSeleccionarProveedor";
import ItemsCompraForm, { type ItemCompra } from "./ItemsCompraForm";
import { History, HelpCircle } from "lucide-react";
import { formatearMoneda } from "../FuncionAuxiliar";
import Notificacion, { type TipoNotificacion } from "../../components/Notification/Notification";
import { Joyride, type Step } from "react-joyride";

function formatearFechaInput(fecha: Date) {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  return `${anio}-${mes}-${dia}`;
}

function Compras() {
  const navigate = useNavigate();

  const [fecha, setFecha] = useState(formatearFechaInput(new Date()));
  const [NFactura, setNFactura] = useState("");
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);

  const [items, setItems] = useState<ItemCompra[]>([]);
  const [modalProveedorAbierto, setModalProveedorAbierto] = useState(false);

  const [error, setError] = useState("");
  const [notif, setNotif] = useState<{ mensaje: string; tipo: TipoNotificacion } | null>(null);

  const [tourActivo, setTourActivo] = useState(false);

  const pasosTour: Step[] = [
    {
      target: '[data-tour="historial-proveedor"]',
      content: "Con este botón puedes navegar a la pantalla del historial de compras.",
    },
    {
      target: '[data-tour="compras-proveedor"]',
      content: "Aquí se abre una ventana para seleccionar el proveedor al que desea realizar la compra.",
    },
    {
      target: '[data-tour="compras-producto"]',
      content: "Aquí se abre una ventana para seleccionar el producto que desea agregar a la venta.",
    },
    {
      target: '[data-tour="compras-agregar"]',
      content: "Acá se agrega el producto seleccionado a la factura.",
    },
    {
      target: '[data-tour="compras-tabla"]',
      content: "En esta tabla puede visualizar la información de la compra que desea registrar.",
    },
    {
      target: '[data-tour="botones-compras"]',
      content: "Con estos botones puedes eliminar o editar el producto de la factura.",
    },
    {
      target: '[data-tour="compras-cancelar"]',
      content: "Desde aquí cancela la compra en curso.",
    },
    {
      target: '[data-tour="compras-registrar"]',
      content: "Aquí puedes registrar la compra una vez ingresado todos los datos.",
    },
  ];

  const total = items.reduce((suma, item) => suma + item.cantidad * item.precio_compra, 0);

  const cancelar = () => {
    setItems([]);
    setError("");
  };

  const confirmarCompra = async () => {
    if (items.length === 0) {
      setError("Agrega al menos un producto para realizar la compra.");
      return;
    }

    if (!proveedorSeleccionado) {
      setError("Selecciona un proveedor.");
      return;
    }

    try {
      const totalActual = items.reduce((suma, item) => suma + item.cantidad * item.precio_compra, 0);

      await crearCompra(
        Number(proveedorSeleccionado?.id),
        NFactura,
        totalActual,
        items.map((item) => ({
          Id_producto: item.producto.id,
          Cantidad: item.cantidad,
          Precio: item.precio_compra,
          Subtotal: item.cantidad * item.precio_compra,
          Precio_venta: item.precio_venta,
        }))
      );

      setItems([]);
      setError("");
      setProveedorSeleccionado(null);
      setNFactura("");

      setNotif({ mensaje: "Compra realizada correctamente", tipo: "exito" });
    } catch (error: any) {
      setNotif({ mensaje: "Ocurrió un error al realizar la compra", tipo: "error" });
      setError(error.response.data.mensaje);
    }
  };

  return (
    <div className="factura-page">
      {notif && (
        <Notificacion mensaje={notif.mensaje} tipo={notif.tipo} onCerrar={() => setNotif(null)} />
      )}
      <div className="factura-contenido">
        <div className="factura-header">
          <div className="header-help">
            <h1>Gestión de Compras</h1>
            <button
              type="button"
              className="categoria-add-btn"
              onClick={() => navigate("/compras/historial")}
              title="Ver historial de compras"
              data-tour="historial-proveedor"
            >
              <History size={18} />
              Historial
            </button>
            <button className="categoria-add-btn" onClick={() => setTourActivo(true)}>
              <HelpCircle size={18} />
            </button>
          </div>
        </div>

        <div className="factura-card">
          <div className="compra-fila-formulario">
            <div className="compra-campo compra-campo-producto" data-tour="compras-proveedor">
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
          <button className="factura-btn-cancelar" onClick={cancelar} data-tour="compras-cancelar">
            Cancelar
          </button>

          <div className="factura-total-venta">
            <div className="factura-total-texto">
              <span className="factura-total-label">Total</span>
              <span className="factura-total-monto">C${formatearMoneda(total)}</span>
            </div>

            <button
              className="factura-btn-vender"
              onClick={confirmarCompra}
              disabled={items.length === 0}
              data-tour="compras-registrar"
            >
              Realizar Compra
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

      <Joyride
        steps={pasosTour}
        run={tourActivo}
        continuous
        locale={{
          back: "Atrás",
          close: "Cerrar",
          last: "Finalizar",
          next: "Siguiente",
          skip: "Omitir",
        }}
        onEvent={(data) => {
          if (data.type === "tour:end") {
            setTourActivo(false);
          }
        }}
      />
    </div>
  );
}

export default Compras;