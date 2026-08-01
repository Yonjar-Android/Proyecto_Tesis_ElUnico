import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./InventarioLayout.css";
import "./FormularioProducto.css";
import type { ProductoListado } from "../../models/ProductoListado";
import {
  buscarProductoPorId,
  actualizarProducto,
} from "../../services/producto.service";
import ModalSeleccionarCategoria from "./ModalesSeleccion/ModalSeleccionarCategoria";
import ModalSeleccionarMarca from "./ModalesSeleccion/ModalSeleccionarMarca";
import type { Marca } from "../../models/Marca";
import type { Categoria } from "../../models/Categoria";

function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const onVolver = () => navigate("/inventario");

  const [producto, setProducto] = useState<ProductoListado | null>(null);
  const [nombreProducto, setNombreProducto] = useState("");
  const [codigo, setCodigo] = useState("");
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [marca, setMarca] = useState<Marca | null>(null);
  const [precio, setPrecio] = useState("0.00");
  const [stockActual, setStockActual] = useState("0");
  const [stockMinimo, setStockMinimo] = useState("0");

  const [ventasMes, setVentasMes] = useState(0);
  const [margen, setMargen] = useState(0);
  const [margenDeltaTexto, setMargenDeltaTexto] = useState("");

  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState(false);
  const [modalMarcaAbierto, setModalMarcaAbierto] = useState(false);

  const [error, setError] = useState("");

  // Busca el producto cada vez que cambia el id en la URL.
  /*useEffect(() => {
    if (!id) return;

    obtenerProducto(Number(id))
      .then((data: Producto) => setProducto(data))
      .catch((error) => console.error(error));

    obtenerEstadisticasProducto(Number(id))
      .then((data) => {
        setVentasMes(data.ventasMes);
        setMargen(data.margen);
        setMargenDeltaTexto(data.margenDeltaTexto);
      })
      .catch((error) => console.error(error));
  }, [id]);*/

  useEffect(() => {
    if (!id) return;

    buscarProductoPorId(Number(id))
      .then((data: ProductoListado) => setProducto(data))
      .catch((error) => console.error(error));
  }, [id]);

  // Precarga el formulario una vez que el producto llega.
  useEffect(() => {
    if (producto) {
      setNombreProducto(producto.Nombre ?? "");
      setCategoria({
        id: producto.Id_categoria,
        Nombre_categoria: producto.Nombre_categoria
        });
      setMarca({
        id: producto.Id_marca,
        Nombre_marca: producto.Nombre_marca
        });

      setPrecio(String(producto.Precio_venta ?? 0));
      setStockActual(String(producto.Stock ?? 0));
      setStockMinimo(String(producto.Stock_min ?? 0));
      setError("");
    }
  }, [producto]);

  if (!producto) return <div className="inventario-page" />;

  const actualizar = async () => {
    if (!nombreProducto.trim()) {
      setError("El nombre del producto no puede estar vacío.");
      return;
    }

    /*if (!codigo.trim()) {
      setError("El código / referencia no puede estar vacío.");
      return;
    }*/

    if (!categoria?.id) {
      setError("La categoría no puede estar vacía.");
      return;
    }

    if (!marca?.id) {
      setError("La marca no puede estar vacía.");
      return;
    }

    if (isNaN(Number(precio)) || Number(precio) <= 0) {
      setError("Ingresa un precio de venta válido.");
      return;
    }

    try {
      await actualizarProducto(
        producto.id,
        nombreProducto,
        Number(categoria?.id),
        Number(marca?.id),
        Number(precio),
        Number(stockActual) || 0,
        Number(stockMinimo) || 0,
        null
      );

      navigate("/inventario");
    } catch (error: any) {
      setError(error.response.data.mensaje);
    }
  };

  const progresoVentas = Math.min(100, ventasMes);

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
          <div className="inventario-breadcrumb">
            INVENTARIO · <strong>EDITAR PRODUCTO</strong>
          </div>

          <div className="inventario-titulo-row">
            <div>
              <h2>Editar producto</h2>
            </div>

            <button className="inventario-volver" onClick={onVolver}>
              ← Volver al listado
            </button>
          </div>

          <div className="inventario-grid">
            <div className="producto-form-card">
              <div className="producto-form-header">
                <h3>Especificaciones técnicas</h3>
                <p>Información fundamental del componente para el catálogo central.</p>
              </div>

              <div className="producto-campo">
                <label>Nombre del producto</label>
                <input
                  type="text"
                  value={nombreProducto}
                  onChange={(e) => setNombreProducto(e.target.value)}
                />
              </div>

              <div className="producto-campo">
                <label>
                  Código / Referencia <span style={{ color: "#e5484d" }}>*</span>
                </label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
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
                      {marca?.Nombre_marca || "Selecciona una marca"}
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
                    min={0}
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                  />
                </div>
              </div>

              <div className="producto-divisor">Control de existencias</div>

              <div className="producto-campo-fila">
                <div className="producto-campo">
                  <label>Stock actual</label>
                  <div className="producto-stepper">
                    <button
                      type="button"
                      onClick={() =>
                        setStockActual(String(Math.max(0, Number(stockActual) - 1)))
                      }
                    >
                      −
                    </button>
                    <span>{stockActual}</span>
                    <button
                      type="button"
                      onClick={() => setStockActual(String(Number(stockActual) + 1))}
                    >
                      +
                    </button>
                  </div>
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
                <button className="producto-btn-guardar" onClick={actualizar}>
                  Actualizar
                </button>
                <button className="producto-btn-cancelar" onClick={onVolver}>
                  Cancelar
                </button>
              </div>
            </div>

            <div className="producto-sidebar">
              <div className="producto-stats-row">
                <div className="producto-stat-card">
                  <span className="producto-stat-label">Ventas mes</span>
                  <span className="producto-stat-valor">{ventasMes}</span>
                  <div className="producto-stat-barra">
                    <div
                      className="producto-stat-barra-relleno"
                      style={{ width: `${progresoVentas}%` }}
                    />
                  </div>
                </div>

                <div className="producto-stat-card">
                  <span className="producto-stat-label">Margen</span>
                  <span className="producto-stat-valor producto-stat-valor--verde">
                    {margen}%
                  </span>
                  <span className="producto-stat-delta">{margenDeltaTexto}</span>
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

export default EditarProducto;