import { useState } from "react";
import styles from "./Devoluciones.module.css";
import { crearDevolucion} from "../../services/devoluciones.service";
import type {CrearDevolucionData} from "../../services/devoluciones.service"
import { buscarFacturaParaDevolucion} from "../../services/venta.service";
import Notificacion, { type TipoNotificacion } from "../../components/Notification/Notification";
import { formatearMoneda } from "../FuncionAuxiliar";

// Motivo de la devolución. Se muestra como <select>; ajusta la lista según tu negocio.
const MOTIVOS_DEVOLUCION = [
  "Producto defectuoso",
  "Error en la venta",
  "Producto incorrecto",
  "Otro",
];


interface ItemFactura {
    idDetalleVenta: number;
    idProducto: number;
    nombreProducto: string;
    nombreMarca?: string;
    cantidadComprada: number;
    cantidadDevuelta: number;
    cantidadADevolver: number;
    precioVenta: number,
    descuento: number,
    tipoDescuento: string,
}

interface FacturaEncontrada {
    numeroFactura: string;
    cliente: string;
    fecha: string;
    items: ItemFactura[];
}

function disponible(item: ItemFactura) {
  return item.cantidadComprada - item.cantidadDevuelta;
}

export const formatearFecha = (fecha: string): string => {
    const date = new Date(fecha);

    return new Intl.DateTimeFormat("es-NI", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(date);
};

function Devoluciones() {
  const [numeroFactura, setNumeroFactura] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [factura, setFactura] = useState<FacturaEncontrada | null>(null);
  const [items, setItems] = useState<ItemFactura[]>([]);

  const [motivo, setMotivo] = useState("");
  const [observacion, setObservacion] = useState("");

  const [error, setError] = useState("");

  const [notif, setNotif] = useState<{ mensaje: string; tipo: TipoNotificacion } | null>(null);

  const buscarFactura = async () => {
    if (!numeroFactura.trim()) {
      setError("Ingresa un número de factura.");
      return;
    }

    setError("");
    setBuscando(true);
    setFactura(null);
    setItems([]);

    try {
    const data = await buscarFacturaParaDevolucion(
        Number(numeroFactura.trim())
    );
    setFactura(data);
    setItems(data.items.map((item: ItemFactura) => ({ ...item, cantidadADevolver: 0 })));

    if (data.items.length === 0) {
        setError(
            "Esta factura no tiene productos disponibles para devolución o ya fue devuelta por completo."
        );
    }

} catch (err: any) {

  console.log(err?.response?.data?.mensaje ??
        "No se encontró ninguna factura con ese número.")

    setError(
        err?.response?.data?.mensaje ??
        "No se encontró ninguna factura con ese número."
    );

} finally {

    setBuscando(false);
}
  };

  const actualizarCantidadADevolver = (index: number, valor: string) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const max = disponible(item);
        let cantidad = Number(valor);

        if (isNaN(cantidad) || cantidad < 0) cantidad = 0;
        if (cantidad > max) cantidad = max;

        return { ...item, cantidadADevolver: cantidad };
      })
    );
  };

  function montoADevolver(item: ItemFactura) {
  return item.precioVenta * item.cantidadADevolver;
}

  const totalADevolver = items.reduce((suma, item) => suma + item.cantidadADevolver, 0);
  const montoTotalADevolver = items.reduce((suma, item) => suma + montoADevolver(item), 0);

  const limpiar = () => {
    setNumeroFactura("");
    setFactura(null);
    setItems([]);
    setMotivo("");
    setObservacion("");
    setError("");
  };

  const registrarDevolucion = async () => {

    if (!factura) {
        setError("Busca una factura antes de registrar la devolución.");
        return;
    }

    if (totalADevolver === 0) {
        setError("Indica al menos una cantidad a devolver.");
        return;
    }

    if (!motivo) {
        setError("Selecciona un motivo de devolución.");
        return;
    }

    setError("");

    try {

        const payload: CrearDevolucionData = {
            Id_venta: Number(factura.numeroFactura),
            Id_usuario: Number(localStorage.getItem("id_usuario")),
            Motivo: motivo,
            Observacion: observacion || null,

            detalles: items
                .filter((item) => item.cantidadADevolver > 0)
                .map((item) => ({
                    Id_detalle_venta: item.idDetalleVenta,
                    Cantidad: item.cantidadADevolver
                }))
        };

        await crearDevolucion(payload);

        setNotif({ mensaje: "Devolución realizada correctamente", tipo: "exito" });

        limpiar();

    } catch (err: any) {

        setError(
            err?.response?.data?.mensaje ??
            "Error al registrar la devolución."
        );

        setNotif({ mensaje: "Ocurrió un error", tipo: "error" });

    }
};

  return (
    <div className={styles.page}>
                {notif && (
        <Notificacion
          mensaje={notif.mensaje}
          tipo={notif.tipo}
          onCerrar={() => setNotif(null)}
        />
      )}
      <div className={styles.contenido}>
        <div className={styles.header}>
          <h1>Devoluciones</h1>
          <p className={styles.subtitulo}>
            Busca una factura y registra la devolución de los productos correspondientes.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.filaBuscar}>
            <div className={`${styles.campo} ${styles.campoBuscar}`}>
              <label>
                Buscar factura <span className={styles.requerido}>*</span>
              </label>
              <input
                type="text"
                placeholder="Número de factura"
                value={numeroFactura}
                onChange={(e) => setNumeroFactura(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscarFactura()}
              />
            </div>

            <button
              type="button"
              className={styles.btnBuscar}
              onClick={buscarFactura}
              disabled={buscando}
            >
              {buscando ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </div>

        {factura && (
          <div className={styles.filaTriple}>
            <div className={styles.card}>
              <div className={styles.campo}>
                <label>Número de factura</label>
                <div className={styles.valor}>{factura.numeroFactura}</div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.campo}>
                <label>Cliente</label>
                <div className={styles.valor}>{factura.cliente}</div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.campo}>
                <label>Fecha</label>
                <div className={styles.valor}>{formatearFecha(factura.fecha)}</div>
              </div>
            </div>
          </div>
        )}

        <div className={`${styles.card} ${styles.cardTabla}`}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cant. comprada</th>
                <th>Cant. ya devuelta</th>
                <th>Cant. a devolver</th>
                <th>Monto a devolver</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const max = disponible(item);
                return (
                  <tr key={item.idProducto}>
                    <td>
                      {item.nombreProducto}
                      {item.nombreMarca && (
                        <span className={styles.nombreMarca}>{item.nombreMarca}</span>
                      )}
                    </td>
                    <td>{formatearMoneda(item.precioVenta)}</td>
                    <td>{item.cantidadComprada}</td>
                    <td>{item.cantidadDevuelta}</td>
                    <td className={styles.tdCantidad}>
                      <input
                        type="number"
                        min="0"
                        max={max}
                        step="1"
                        value={item.cantidadADevolver}
                        disabled={max === 0}
                        onChange={(e) => actualizarCantidadADevolver(index, e.target.value)}
                      />
                      <span className={styles.disponible}>
                        {max === 0 ? "Sin disponible" : `Máx. ${max}`}
                      </span>
                    </td>
                    <td className={styles.tdSubtotal}>{formatearMoneda(montoADevolver(item))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!factura && (
            <div className={styles.vacio}>Busca una factura para ver sus productos.</div>
          )}

          {factura && items.length === 0 && (
            <div className={styles.vacio}>
              Esta factura no tiene productos disponibles para devolver.
            </div>
          )}
        </div>

        <div className={styles.filaDoble}>
          <div className={styles.card}>
            <div className={styles.campo}>
              <label>
                Motivo <span className={styles.requerido}>*</span>
              </label>
              <select value={motivo} onChange={(e) => setMotivo(e.target.value)}>
                <option value="">Selecciona un motivo</option>
                {MOTIVOS_DEVOLUCION.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.campo}>
              <label>Observación</label>
              <textarea
                placeholder="Detalles adicionales (opcional)"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </div>

        {error && <span className={styles.errorText}>{error}</span>}

        <div className={styles.footer}>
          <button className={styles.btnCancelar} onClick={limpiar}>
            Cancelar
          </button>

          <div className={styles.totalDevolucion}>

            <div className={styles.totalLinea}>
  <span>Total a devolver</span>
  <span>C${formatearMoneda(montoTotalADevolver)}</span>
</div>

            <div className={styles.totalLinea}>
              <span>Unidades a devolver</span>
              <span>{totalADevolver}</span>
            </div>

            <button
              className={styles.btnRegistrar}
              onClick={registrarDevolucion}
              disabled={!factura || totalADevolver === 0}
            >
              Registrar devolución
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Devoluciones;