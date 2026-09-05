import { useEffect, useState } from "react";
import styles from "./SalidasInventario.module.css";
import { Trash2, HelpCircle } from "lucide-react";
import ModalSeleccionarProducto from "../Facturacion/ModalSeleccionarProducto";
import type { ProductoListado } from "../../models/ProductoListado";
import Notificacion, { type TipoNotificacion } from "../../components/Notification/Notification";
import {
  crearSalida,
//  obtenerHistorialSalidas,
} from "../../services/salidas_Invenario.service";
import { Joyride, type Step } from "react-joyride";

// Tipo de salida. Ajusta la lista según tu negocio.
const TIPOS_SALIDA = [
  "Producto dañado",
  "Pérdida",
  "Uso interno",
  "Ajuste de inventario",
  "Otro",
];

interface PayloadSalida {
    Tipo_Salida: string;
    Observacion: string;
    detalles: {
        Id_producto: number;
        Cantidad: number;
    }[];
}

interface ItemSalida {
    producto: ProductoListado;
    cantidad: number;
}

type EstadoSalida = "Completada" | "Anulada";

interface SalidaHistorial {
  id: number;
  fecha: string;
  tipoSalida: string;
  usuario: string;
  cantidadProductos: number;
  estado: EstadoSalida;
}

function claseEstado(estado: EstadoSalida) {
  if (estado === "Completada") return styles.estadoCompletada;
  if (estado === "Anulada") return styles.estadoAnulada;
  return styles.estadoPendiente;
}

function SalidasInventario() {
  const [tipoSalida, setTipoSalida] = useState("");
  const [observacion, setObservacion] = useState("");

  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoListado | null>(null);
  const [cantidad, setCantidad] = useState("1");
  const [modalProductoAbierto, setModalProductoAbierto] = useState(false);

  const [items, setItems] = useState<ItemSalida[]>([]);
  const [error, setError] = useState("");

  const [historial, setHistorial] = useState<SalidaHistorial[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);

  const [notif, setNotif] = useState<{ mensaje: string; tipo: TipoNotificacion } | null>(null);

  const [tourActivo, setTourActivo] = useState(false);
 const pasosTour: Step[] = [
  {
    target: '[data-tour="seleccionar-producto-salidas"]',
    content: "Desde aquí abres una ventana para seleccionar un producto.",
  },
  {
    target: '[data-tour="agregar-producto-salidas"]',
    content: "Aquí puedes agregar un producto a la salida a registrar.",
  },
  {
    target: '[data-tour="tabla-salidas"]',
    content: "Aquí puedes ver la lista de productos a los cuales quieres registrar una salida.",
  },
  {
    target: '[data-tour="cancelar-salida"]',
    content: "Acá puedes cancelar la salida en curso.",
  },
  {
    target: '[data-tour="registrar-salida"]',
    content: "Acá puedes registrar la salida una vez hayas agregado los productos.",
  },
];

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        //const data = await obtenerHistorialSalidas();
        //setHistorial(data);
      } catch {
        setHistorial([]);
      } finally {
        setCargandoHistorial(false);
      }
    };
    cargarHistorial();
  }, []);

  const limpiarCamposProducto = () => {
    setProductoSeleccionado(null);
    setCantidad("1");
  };

  const agregarProducto = () => {
    if (!productoSeleccionado) {
      setError("Selecciona un producto.");
      return;
    }

    if (isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
      setError("Ingresa una cantidad válida.");
      return;
    }

    if(Number(cantidad) > productoSeleccionado.Stock){
      setError("La cantidad ingresada es mayor al stock existente");
      return;
    }

    const yaExiste = items.some((item) => item.producto.id === productoSeleccionado.id);
    if (yaExiste) {
      setError("Este producto ya fue agregado a la salida.");
      return;
    }

    setItems((prev) => [...prev, { producto: productoSeleccionado, cantidad: Number(cantidad) }]);
    setError("");
    limpiarCamposProducto();
  };

  const eliminarItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const cancelar = () => {
    setTipoSalida("");
    setObservacion("");
    setItems([]);
    limpiarCamposProducto();
    setError("");
  };

  const registrarSalida = async () => {
    if (!tipoSalida) {
      setError("Selecciona un tipo de salida.");
      return;
    }

    if (items.length === 0) {
      setError("Agrega al menos un producto para registrar la salida.");
      return;
    }

    setError("");

    try {
      const payload: PayloadSalida = {
            Tipo_Salida: tipoSalida,
            Observacion: observacion,
            detalles: items.map((item) => ({
                Id_producto: item.producto.id,
                Cantidad: item.cantidad,
            })),
        };


      await crearSalida(payload);

      setNotif({ mensaje: "Salida realizada correctamente", tipo: "exito" });

      // Refresca el historial para reflejar la salida recién registrada.
      //const data = await obtenerHistorialSalidas();
      //setHistorial(data);

      cancelar();
    } catch (err: any) {
      setNotif({ mensaje: "Ocurrió un error", tipo: "error" });
      setError(err?.response?.data?.mensaje ?? "Error al registrar la salida.");
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
          <div className={styles.header_help}>
          <h1>Salidas de Inventario</h1>
          <button className="categoria-add-btn" onClick={() => setTourActivo(true)}>
            <HelpCircle size={18} />
          </button>
          </div>
          <p className={styles.subtitulo}>
            Registra salidas de productos por daño, pérdida, uso interno u otros ajustes.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.filaRegistro}>
            <div className={styles.campo}>
              <label>
                Tipo de salida <span className={styles.requerido}>*</span>
              </label>
              <select value={tipoSalida} onChange={(e) => setTipoSalida(e.target.value)}>
                <option value="">Selecciona un tipo</option>
                {TIPOS_SALIDA.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.campo} data-tour="seleccionar-producto-salidas">
              <label>
                Producto <span className={styles.requerido}>*</span>
              </label>
              <button
                type="button"
                className={styles.selectorBtn}
                onClick={() => setModalProductoAbierto(true)}
              >
                <span className={productoSeleccionado ? "" : styles.selectorPlaceholder}>
                  {productoSeleccionado ? productoSeleccionado.Nombre : "Seleccione un producto"}
                </span>
              </button>
            </div>

            <div className={styles.campo}>
              <label>
                Cantidad <span className={styles.requerido}>*</span>
              </label>
              <input
                type="number"
                min="1"
                max={productoSeleccionado?.Stock}
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
            </div>

            <button type="button" className={styles.btnAgregar} onClick={agregarProducto} 
            data-tour="agregar-producto-salidas"
            >
              Agregar
            </button>
          </div>

          <div className={`${styles.campo} ${styles.filaObservacion}`}>
            <label>Observación</label>
            <textarea
              placeholder="Detalles adicionales (opcional)"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardTabla}`}  data-tour="tabla-salidas">
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th className={styles.thAccion}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.producto.id}>
                  <td>
                    {item.producto.Nombre}
                    {item.producto.Nombre_marca && (
                      <span className={styles.nombreMarca}>{item.producto.Nombre_marca}</span>
                    )}
                  </td>
                  <td>{item.cantidad}</td>
                  <td className={styles.tdAccion}>
                    <button
                      className={styles.btnEliminar}
                      onClick={() => eliminarItem(index)}
                      aria-label="Eliminar producto"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {items.length === 0 && (
            <div className={styles.vacio}>Aún no has agregado productos a la salida.</div>
          )}
        </div>

        {error && <span className={styles.errorText}>{error}</span>}

        <div className={styles.footer}>
          <button className={styles.btnCancelar} onClick={cancelar} data-tour="cancelar-salida">
            Cancelar
          </button>

          <button
            className={styles.btnRegistrar}
            onClick={registrarSalida}
            disabled={items.length === 0}
            data-tour="registrar-salida"
          >
            Registrar salida
          </button>
        </div>

       {/* <div className={styles.seccionHistorial}>
          <h2>Historial de salidas</h2>

          <div className={`${styles.card} ${styles.cardTabla}`}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Usuario</th>
                  <th>Cantidad de productos</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((salida) => (
                  <tr key={salida.id}>
                    <td>{salida.fecha}</td>
                    <td>{salida.tipoSalida}</td>
                    <td>{salida.usuario}</td>
                    <td>{salida.cantidadProductos}</td>
                    <td>
                      <span className={`${styles.estadoBadge} ${claseEstado(salida.estado)}`}>
                        {salida.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!cargandoHistorial && historial.length === 0 && (
              <div className={styles.vacio}>Todavía no hay salidas registradas.</div>
            )}
          </div>
        </div>*/}
      </div> 

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

      <ModalSeleccionarProducto
        abierto={modalProductoAbierto}
        onClose={() => setModalProductoAbierto(false)}
        onSeleccionar={(producto) => {
          setProductoSeleccionado(producto);
          setModalProductoAbierto(false);
        }}
      />
    </div>
  );
}

export default SalidasInventario;