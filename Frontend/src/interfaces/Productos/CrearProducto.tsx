import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InventarioLayout.css";
import "./FormularioProducto.css";
import {
  crearProducto,
  obtenerTotalProductosCategorias
} from "../../services/producto.service";
import ModalSeleccionarCategoria from "./ModalesSeleccion/ModalSeleccionarCategoria";
import ModalSeleccionarMarca from "./ModalesSeleccion/ModalSeleccionarMarca";
import type { Marca } from "../../models/Marca";
import type { Categoria } from "../../models/Categoria";

function CrearProducto() {
  const navigate = useNavigate();
  const onVolver = () => navigate("/inventario");
  const [nombreProducto, setNombreProducto] = useState("");
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [marca, setMarca] = useState<Marca | null>(null);
  const [precio, setPrecio] = useState("0.00");
  const [stockInicial, setStockInicial] = useState("0");
  const [stockMinimo, setStockMinimo] = useState("5");
  const [fechaVencimiento, setFechaVencimiento] = useState("");

  const [totalProductos, setTotalProductos] = useState(0);
  const [totalCategorias, setTotalCategorias] = useState(0);

    const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState(false);
  const [modalMarcaAbierto, setModalMarcaAbierto] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    obtenerTotalProductosCategorias()
      .then((data) => {
        setTotalProductos(data.totalProductos);
        setTotalCategorias(data.totalCategorias);

      if (data.marcaSinMarca) {
          setMarca(data.marcaSinMarca[0]);
      }
      
      })
      .catch((error) => console.error(error));
  }, []);

  // Fecha mínima seleccionable: mañana (la fecha debe ser posterior a hoy)
const getFechaMinima = () => {
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  return manana.toISOString().split("T")[0]; // YYYY-MM-DD
};

  const guardar = async () => {
    if (!nombreProducto.trim()) {
      setError("El nombre del producto no puede estar vacío.");
      return;
    }

    if (!categoria?.id) {
      setError("La categoría no puede estar vacía.");
      return;
    }

    if (isNaN(Number(precio)) || Number(precio) <= 0) {
      setError("Ingresa un precio de venta válido.");
      return;
    }

    if (fechaVencimiento) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaSeleccionada = new Date(fechaVencimiento + "T00:00:00");

  if (fechaSeleccionada <= hoy) {
    setError("La fecha de vencimiento debe ser posterior a la fecha actual.");
    return;
  }
}

    try {
      await crearProducto(
        nombreProducto,
        Number(marca?.id),
        Number(categoria?.id),
        Number(precio),
        Number(stockInicial) || 0,
        Number(stockMinimo) || 0,
        fechaVencimiento ? fechaVencimiento : null
      );

      navigate("/inventario");
    } catch (error: any) {
      setError(error.response.data.mensaje);
    }
  };

  return (
    <div className="inventario-page">
      <div className="inventario-header-banda">
        <h1>Inventario</h1>
      </div>

      <div className="inventario-status-row">
        <span className="inventario-status-badge">
          STATUS: ONLINE <span className="inventario-status-dot" />
        </span>
      </div>

      <div className="inventario-contenido">
        <div className="inventario-card-grande">
          <div className="inventario-titulo-row">
            <div>
              <h2>Nuevo producto</h2>
              <p className="inventario-subtitulo">Registro de entrada para el inventario.</p>
            </div>

            <button className="inventario-volver" onClick={onVolver}>
              ← Volver al listado
            </button>
          </div>

          <div className="inventario-grid">
            <div className="producto-form-card">
              <div className="producto-campo">
                <label>
                  Nombre del producto <span style={{ color: "#e5484d" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Kit de Frenos Performance R-Series"
                  value={nombreProducto}
                  onChange={(e) => setNombreProducto(e.target.value)}
                />
              </div>

              <div className="producto-campo-fila">
                <div className="producto-campo">
                  <label>
                    Categoría <span style={{ color: "#e5484d" }}>*</span>
                  </label>
                  <button
                    type="button"
                    className="producto-selector-btn"
                    onClick={() => setModalCategoriaAbierto(true)}
                  >
                    <span className={categoria ? "" : "producto-selector-placeholder"}>
                      {categoria?.Nombre_categoria || "Selecciona una categoría"}
                    </span>
                    <span className="producto-selector-chevron">⌄</span>
                  </button>
                </div>
 
                <div className="producto-campo">
                  <label>Marca</label>
                  <button
                    type="button"
                    className="producto-selector-btn"
                    onClick={() => setModalMarcaAbierto(true)}
                  >
                    <span className={marca ? "" : "producto-selector-placeholder"}>
                      { marca?.Nombre_marca || "Selecciona una marca"}
                    </span>
                    <span className="producto-selector-chevron">⌄</span>
                  </button>
                </div>
              </div>

              <div className="producto-campo">
                <label>
                  Precio de venta (NIO) <span style={{ color: "#e5484d" }}>*</span>
                </label>
                <div className="producto-precio-input">
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

              <div className="producto-campo">
    <label>Fecha de vencimiento</label>
  <input
    type="date"
    min={getFechaMinima()}
    value={fechaVencimiento}
    onChange={(e) => setFechaVencimiento(e.target.value)}
  />
    </div>

              <div className="producto-divisor">Control de existencias</div>

              <div className="producto-campo-fila">
                <div className="producto-campo">
                  <label>
                    Stock inicial <span style={{ color: "#e5484d" }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={stockInicial}
                    min={0}
                    onChange={(e) => setStockInicial(e.target.value)}
                  />
                </div>

                <div className="producto-campo">
                  <label>Stock mínimo (alerta)</label>
                  <input
                    type="number"
                    min={0}
                    value={stockMinimo}
                    onChange={(e) => setStockMinimo(e.target.value)}
                  />
                </div>
              </div>

              {error && <span className="error-text">{error}</span>}

              <div className="producto-botones">
                <button className="producto-btn-guardar" onClick={guardar} >
                  💾 Guardar producto
                </button>
                <button className="producto-btn-cancelar" onClick={onVolver}>
                  Cancelar
                </button>
              </div>
            </div>

            <div className="producto-sidebar">
              <div className="producto-guia-card">
                <h4>Guía de registro</h4>
                <ul className="producto-guia-lista">
                  <li>
                    <span className="producto-guia-numero">01.</span>
                    Use nombres técnicos precisos para facilitar la búsqueda en ventas.
                  </li>
                  <li>
                    <span className="producto-guia-numero">02.</span>
                    El nivel crítico activará notificaciones automáticas cuando las
                    existencias bajen.
                  </li>
                  <li>
                    <span className="producto-guia-numero">03.</span>
                    Verifique que el código coincida con el etiquetado del fabricante.
                  </li>
                </ul>
              </div>

              <div className="producto-ayuda-card">
                <div className="producto-ayuda-titulo">ⓘ Ayuda de inventario</div>
                <p>
                  Una vez guardado, el producto será visible inmediatamente en el
                  módulo de ventas y arqueo de caja. Asegúrese de que el precio de
                  venta incluya los impuestos correspondientes.
                </p>
              </div>

              <div className="producto-stats-row">
                <div className="producto-stat-card">
                  <span className="producto-stat-label">Total productos</span>
                  <span className="producto-stat-valor">
                    {totalProductos.toLocaleString("en-US")}
                  </span>
                </div>
                <div className="producto-stat-card">
                  <span className="producto-stat-label">Categorías</span>
                  <span className="producto-stat-valor">{totalCategorias}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModalSeleccionarCategoria
        abierto={modalCategoriaAbierto}
        onClose={() => setModalCategoriaAbierto(false)}
        onSeleccionar={(cat) => {
          setCategoria(cat);
          setModalCategoriaAbierto(false);
        }}
      />
 
      <ModalSeleccionarMarca
        abierto={modalMarcaAbierto}
        onClose={() => setModalMarcaAbierto(false)}
        onSeleccionar={(m) => {
          setMarca(m);
          setModalMarcaAbierto(false);
        }}
      />
    </div>
  );
}

export default CrearProducto;