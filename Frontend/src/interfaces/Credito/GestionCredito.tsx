import { useEffect, useRef, useState } from "react";
import styles from "./GestionCreditos.module.css";
import { CreditCard, MoreVertical, History, Clock, HelpCircle } from "lucide-react";
import type { FacturaCreditoPendiente } from "../../models/Credito";
import ModalHistorialAbonos from "./ModalHistorialAbonos";
import ModalSiguienteCuota from "./ModalSiguienteCuota";
import ModalAbonarCredito from "./ModalAbonarCredito";
import { buscarCreditosPendientes } from "../../services/credito.service";
import type { PaginatedResponse } from "../../models/PaginatedResponse";
import { formatearMoneda } from "../FuncionAuxiliar";
import Notificacion, { type TipoNotificacion } from "../../components/Notification/Notification";
import { Joyride, type Step } from "react-joyride";

function claseBadge(estado: FacturaCreditoPendiente["estado"]): string {
  return estado === "pendiente" ? styles.badgePendiente : styles.badgePagadaParcial;
}

function GestionCreditos() {
  const [facturas, setFacturas] = useState<FacturaCreditoPendiente[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(7);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [cargando, setCargando] = useState(true);

  const [facturaSeleccionada, setFacturaSeleccionada] =
    useState<FacturaCreditoPendiente | null>(null);

  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);
  const [modalSiguienteCuotaAbierto, setModalSiguienteCuotaAbierto] = useState(false);
  const [modalAbonarAbierto, setModalAbonarAbierto] = useState(false);

  const [menuAbiertoId, setMenuAbiertoId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [notif, setNotif] = useState<{ mensaje: string; tipo: TipoNotificacion } | null>(null);

  const [tourActivo, setTourActivo] = useState(false);
  const pasosTour: Step[] = [
  {
    target: '[data-tour="buscar-credito"]',
    content: "Acá puede buscar la factura que desea pagar por su número, cliente o número de cédula del cliente.",
  },
  {
    target: '[data-tour="tabla-credito"]',
    content: "Aquí puedes ver la lista de facturas pendientes de pago y la información del cliente.",
  },
  {
    target: '[data-tour="tabla-botones-credito"]',
    content: "Con estos botones tienes las opciones de abonar, ver la siguiente fecha de pago y los abonos que se han realizado.",
  },
  {
    target: '[data-tour="paginacion-credito"]',
    content: "Con estos botones puedes navegar entre las páginas de clientes para buscar alguno que no aparezca en la lista actual.",
  },
  ];

  const buscar = async () => {
    try {
      setCargando(true);

      if(searchTerm.trim() === ""){
        const response:PaginatedResponse<FacturaCreditoPendiente> = await buscarCreditosPendientes(
            searchTerm,
            currentPage,
            perPage
        );

        setFacturas(response.data);
        setTotal(response.total);
        setLastPage(response.last_page);
        return;
      }

      // const response = await buscarCreditosPendientes(searchTerm, currentPage, perPage);
       const response:PaginatedResponse<FacturaCreditoPendiente> = await buscarCreditosPendientes(
            searchTerm,
            currentPage,
            perPage
        );

            setFacturas(response.data);
          setTotal(response.total);
          setLastPage(response.last_page);
        } catch (error) {
            console.error(error);
        } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    buscar();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      buscar();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, currentPage]);

  // Cierra el menú desplegable al hacer clic fuera
  useEffect(() => {
    function manejarClickFuera(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAbiertoId(null);
      }
    }
    document.addEventListener("mousedown", manejarClickFuera);
    return () => document.removeEventListener("mousedown", manejarClickFuera);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      buscar();
    }
  };

  function abrirHistorial(factura: FacturaCreditoPendiente) {
    setFacturaSeleccionada(factura);
    setModalHistorialAbierto(true);
    setMenuAbiertoId(null);
  }

  function abrirSiguienteCuota(factura: FacturaCreditoPendiente) {
    setFacturaSeleccionada(factura);
    setModalSiguienteCuotaAbierto(true);
    setMenuAbiertoId(null);
  }

  function abrirAbonar(factura: FacturaCreditoPendiente) {
    setFacturaSeleccionada(factura);
    setModalAbonarAbierto(true);
  }

  function manejarAbonoConfirmado() {
    // Cuando el backend exista, aquí recargarías la factura afectada
    setModalAbonarAbierto(false);
    setNotif({ mensaje: "Abono registrado correctamente", tipo: "exito" });
    buscar();
  }

  return (
    <div className={styles.container}>
      {notif && (
        <Notificacion
          mensaje={notif.mensaje}
          tipo={notif.tipo}
          onCerrar={() => setNotif(null)}
        />
      )}
      <div className={styles.content}>
        <div className={styles.topPart}>
          <h1 className={styles.title}>Gestión de Crédito</h1>
          <button className="cliente-add-btn" onClick={() => setTourActivo(true)}>
            <HelpCircle size={18} />
          </button>
        </div>

        <div className={styles.tableContainer}>
          <div className={styles.searchWrapper} data-tour="buscar-credito">
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Buscar por cliente, cédula o factura"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <table className={styles.table} data-tour="tabla-credito">
            <thead>
              <tr>
                <th className={styles.th}>N.º FACTURA</th>
                <th className={styles.th}>CLIENTE</th>
                <th className={styles.th}>TOTAL DEUDA</th>
                <th className={styles.th}>SALDO PENDIENTE</th>
                <th className={styles.th}>ESTADO</th>
                <th className={`${styles.th} ${styles.thActions}`}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={7} className={styles.estadoVacio}>
                    Cargando facturas...
                  </td>
                </tr>
              ) : facturas.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.estadoVacio}>
                    No hay facturas de crédito pendientes.
                  </td>
                </tr>
              ) : (
                facturas.map((f) => (
                  <tr key={f.id} className={styles.tr}>
                    <td className={styles.td}>{f.numero_factura}</td>
                    <td className={styles.td}>
                        {`${f.cliente_nombre} ${f.cliente_apellido}`}
                    </td>                    <td className={styles.td}>C${formatearMoneda(f.total_deuda)}</td>
                    <td className={styles.td}>C${formatearMoneda(f.saldo_pendiente)}</td>
                    <td className={styles.td}>
                      <span className={`${styles.badge} ${claseBadge(f.estado)}`}>
                        {f.estado === "pendiente" ? "Pendiente" : "Parcial"}
                      </span>
                    </td>
                    <td className={styles.tdActions}>
                      <div className={styles.accionesWrapper} data-tour="tabla-botones-credito">
                        <button
                          className={styles.abonarBtn}
                          onClick={() => abrirAbonar(f)}
                          disabled={f.saldo_pendiente === 0}
                        >
                          <CreditCard size={18} /> Abonar
                        </button>

                        <button
                          className={styles.menuBtn}
                          onClick={() =>
                            setMenuAbiertoId(menuAbiertoId === f.id ? null : f.id)
                          }
                        >
                          <MoreVertical size={18} />
                        </button>

                        {menuAbiertoId === f.id && (
                          <div className={styles.dropdownMenu} ref={menuRef}>
                            <button
                              className={styles.dropdownItem}
                              onClick={() => abrirHistorial(f)}
                            >
                              <History size={16} /> Historial de pagos
                            </button>
                            <button
                              className={styles.dropdownItem}
                              onClick={() => abrirSiguienteCuota(f)}
                            >
                              <Clock size={16} /> Siguiente cuota
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={7}>
                  <div className={styles.footer}>
                    <span className={styles.count}>
                      Mostrando {facturas.length} de {total} facturas
                    </span>
                    <div className={styles.pagination}  data-tour="paginacion-credito">
                      <button
                        className={styles.pageBtn}
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      >
                        «
                      </button>
                      <button
                        className={styles.pageBtn}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        ‹
                      </button>
                      <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>
                        {currentPage}
                      </button>
                      <button
                        className={styles.pageBtn}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === lastPage || lastPage === 0}
                      >
                        ›
                      </button>
                      <button
                        className={styles.pageBtn}
                        onClick={() => setCurrentPage(lastPage)}
                        disabled={currentPage === lastPage || lastPage === 0}
                      >
                        »
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
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

      {facturaSeleccionada && (
        <>
          <ModalHistorialAbonos
            abierto={modalHistorialAbierto}
            factura={facturaSeleccionada}
            onClose={() => setModalHistorialAbierto(false)}
          />
          <ModalSiguienteCuota
            abierto={modalSiguienteCuotaAbierto}
            factura={facturaSeleccionada}
            onClose={() => setModalSiguienteCuotaAbierto(false)}
            onAbonar={() => {
              setModalSiguienteCuotaAbierto(false);
              setModalAbonarAbierto(true);
            }}
          />
          <ModalAbonarCredito
            abierto={modalAbonarAbierto}
            factura={facturaSeleccionada}
            onClose={() => setModalAbonarAbierto(false)}
            onConfirmado={manejarAbonoConfirmado}
          />
        </>
      )}
    </div>
  );
}

export default GestionCreditos;