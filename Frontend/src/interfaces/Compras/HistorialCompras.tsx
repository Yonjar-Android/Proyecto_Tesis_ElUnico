import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SquarePen, ArrowLeft, HelpCircle } from "lucide-react";
import { Joyride, type Step } from "react-joyride";
import { formatearMoneda } from "../FuncionAuxiliar";
import { listarCompras } from "../../services/compra.service";
import styles from "./HistorialCompras.module.css";

interface CompraResumen {
  idCompra: number;
  fecha: string;
  nFactura: string;
  total: number;
  proveedorNombre: string;
}

interface Paginacion {
  page: number;
  limit: number;
  total: number;
  totalPaginas: number;
}

function HistorialCompras() {
  const navigate = useNavigate();

  const [compras, setCompras] = useState<CompraResumen[]>([]);
  const [paginacion, setPaginacion] = useState<Paginacion | null>(null);
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const [tourActivo, setTourActivo] = useState(false);
  const pasosTour: Step[] = [
    {
      target: '[data-tour="volver-compras"]',
      content: "Regresa a la pantalla principal de registro de compras a proveedores.",
    },
    {
      target: '[data-tour="tabla-historial-compras"]',
      content: "Listado de compras registradas con fecha, número de factura física, proveedor y monto total.",
    },
    {
      target: '[data-tour="editar-compra-btn"]',
      content: "Permite abrir la compra para corregir cantidades, costos o agregar nuevos productos.",
    },
    {
      target: '[data-tour="paginacion-compras"]',
      content: "Botones para navegar entre las páginas del historial de compras.",
    },
  ];

  useEffect(() => {
    cargarCompras(pagina);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina]);

  const cargarCompras = async (paginaActual: number) => {
    setCargando(true);
    setError("");
    try {
      // TODO: ajusta esta llamada a la firma real que le des a
      // listarCompras en tu compra.service.ts del frontend.
      const respuesta = await listarCompras(paginaActual, 10);
      setCompras(respuesta.datos);
      setPaginacion(respuesta.paginacion);
    } catch (err: any) {
      setError(err?.response?.data?.mensaje ?? "No se pudo cargar el historial de compras.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="factura-page">
      <div className="factura-contenido">
        <div className="factura-header">
          <div className="header-help">
            <button
              type="button"
              className="categoria-add-btn"
              data-tour="volver-compras"
              onClick={() => navigate("/compras")}
              title="Volver a Compras"
            >
              <ArrowLeft size={18} />
            </button>
            <h1>Historial de Compras</h1>
            <button
              type="button"
              className="categoria-add-btn"
              onClick={() => setTourActivo(true)}
              title="Guía de ayuda"
            >
              <HelpCircle size={18} />
            </button>
          </div>
        </div>

        <div className="factura-card factura-card-tabla">
          <table className="factura-tabla" data-tour="tabla-historial-compras">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>N° Factura</th>
                <th>Proveedor</th>
                <th>Total</th>
                <th className="factura-th-accion">Acción</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((compra) => (
                <tr key={compra.idCompra}>
                  <td>{compra.fecha}</td>
                  <td>{compra.nFactura}</td>
                  <td>{compra.proveedorNombre}</td>
                  <td className="factura-td-subtotal">C${formatearMoneda(compra.total)}</td>
                  <td className="factura-td-accion">
                    <button
                      className="factura-btn-editar"
                      data-tour="editar-compra-btn"
                      onClick={() => navigate(`/compras/${compra.idCompra}/editar`)}
                      aria-label="Editar compra"
                      title="Editar"
                    >
                      <SquarePen size={22} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {paginacion && paginacion.total > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={5}>
                    <div className={styles.footer}>
                      <span className={styles.count}>
                        Mostrando {compras.length} de {paginacion.total} compras
                      </span>
                      <div className={styles.pagination} data-tour="paginacion-compras">
                        <button
                          className={styles.pageBtn}
                          onClick={() => setPagina(1)}
                          disabled={pagina === 1}
                        >
                          «
                        </button>
                        <button
                          className={styles.pageBtn}
                          onClick={() => setPagina((p) => p - 1)}
                          disabled={pagina === 1}
                        >
                          ‹
                        </button>
                        <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>{pagina}</button>
                        <button
                          className={styles.pageBtn}
                          onClick={() => setPagina((p) => p + 1)}
                          disabled={pagina === paginacion.totalPaginas || paginacion.totalPaginas === 0}
                        >
                          ›
                        </button>
                        <button
                          className={styles.pageBtn}
                          onClick={() => setPagina(paginacion.totalPaginas)}
                          disabled={pagina === paginacion.totalPaginas || paginacion.totalPaginas === 0}
                        >
                          »
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>

          {!cargando && compras.length === 0 && (
            <div className="factura-vacio">Aún no hay compras registradas.</div>
          )}
          {cargando && <div className="factura-vacio">Cargando...</div>}
        </div>

        {error && <span className="error-text">{error}</span>}
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
    </div>
  );
}

export default HistorialCompras;