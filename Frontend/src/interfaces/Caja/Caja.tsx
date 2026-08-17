import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, AlertTriangle, FileDown } from "lucide-react";
import EgresoModal from "./EgresoModal";
import { obtenerSesionActiva } from "../../services/caja.service";
import "./Caja.css";

interface SesionCaja {
  id_sesion: number;
  fecha_apertura: string;
  monto_apertura_cordobas: number;
  tasa_cambio: number;
  estado: "Abierta" | "Cerrada";
}

interface Egreso {
  id_egreso: number;
  tipo_egreso: string;
  concepto: string;
  metodo_pago: string;
  monto_cordobas: number;
  fecha_registro: string;
}

export default function Caja() {
  const navigate = useNavigate();
  const [sesionActiva, setSesionActiva] = useState<SesionCaja | null>(null);
  const [egresos, setEgresos] = useState<Egreso[]>([]);
  const [ingresosDia, setIngresosDia] = useState(0);
  const [modalEgresoAbierto, setModalEgresoAbierto] = useState(false);
  const [tab, setTab] = useState<"arqueo" | "historial">("arqueo");
const [egresoEditando, setEgresoEditando] = useState<Egreso | null>(null);
  useEffect(() => {
    cargarEstadoCaja();
  }, []);

  async function cargarEstadoCaja() {
    try {
      const data = await obtenerSesionActiva();
      setSesionActiva(data.sesion);
      setEgresos(data.egresos || []);
      setIngresosDia(Number(data.ingresosDia) || 0);
    } catch (error) {
      console.error(error);
      setSesionActiva(null);
      setEgresos([]);
      setIngresosDia(0);
    }
  }

  const totalEgresos = egresos.reduce((acc, e) => acc + Number(e.monto_cordobas), 0);
  const netoDia = ingresosDia - totalEgresos;

 function handleEgresoActualizado(egresoActualizado: Egreso) {
  setEgresos((prev) =>
    prev.map((e) => (e.id_egreso === egresoActualizado.id_egreso ? egresoActualizado : e))
  );
  setEgresoEditando(null);
}

  return (
    <div className="caja-container">
      <div className="caja-header">
        <div>
          <h1 className="caja-titulo">Arqueo de Caja</h1>
          <p className="caja-subtitulo">
            Motorepuestos El Único · {new Date().toLocaleDateString("es-NI", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="caja-header-derecha">
          <span className="caja-tasa-pill">1 USD · C$36.62</span>
          <span className={`caja-estado-pill ${sesionActiva ? "estado-abierta" : "estado-cerrada"}`}>
            {sesionActiva ? "Caja abierta" : "Caja cerrada"}
          </span>
        </div>
      </div>

      {!sesionActiva ? (
        <div className="caja-alerta">
          <div className="caja-alerta-texto">
            <AlertTriangle size={20} />
            <div>
              <p className="caja-alerta-titulo">No hay caja abierta</p>
              <p className="caja-alerta-desc">Para realizar el arqueo debes tener una sesión de caja activa.</p>
            </div>
          </div>
          <button className="btn-abrir-caja" onClick={() => navigate("/caja/apertura")}>
            Abrir caja
          </button>
        </div>
      ) : (
        <>
          <div className="caja-tabs">
            <button
              className={`caja-tab ${tab === "arqueo" ? "caja-tab-activo" : ""}`}
              onClick={() => setTab("arqueo")}
            >
              Arqueo del día
            </button>
            <button
              className={`caja-tab caja-tab-egresos ${tab === "arqueo" ? "caja-tab-egresos-activo" : ""}`}
            >
              Egresos ({egresos.length})
            </button>
            <button
              className={`caja-tab ${tab === "historial" ? "caja-tab-activo" : ""}`}
              onClick={() => setTab("historial")}
            >
              Historial
            </button>
          </div>

          <div className="caja-resumen-grid">
  <div className="caja-resumen-card">
    <span>Monto de apertura</span>
    <strong>C${sesionActiva.monto_apertura_cordobas.toLocaleString()}</strong>
  </div>
  <div className="caja-resumen-card">
    <span>Ingresos del día</span>
    <strong className="valor-verde">C${ingresosDia.toLocaleString()}</strong>
  </div>
  <div className="caja-resumen-card">
    <span>Egresos del día</span>
    <strong className="valor-rojo">- C${totalEgresos.toLocaleString()}</strong>
  </div>
  <div className="caja-resumen-card caja-resumen-neto">
    <span>Neto del día</span>
    <strong>C${netoDia.toLocaleString()}</strong>
  </div>
</div>

          <button className="btn-registrar-egreso" onClick={() => setModalEgresoAbierto(true)}>
            <Plus size={18} />
            Registrar nuevo egreso
          </button>

          <div className="caja-movimientos">
            <div className="caja-movimientos-header">
              <h3>Movimientos registrados</h3>
              <span>{egresos.length} egresos</span>
            </div>

            {egresos.length === 0 ? (
              <p className="caja-sin-movimientos">Aún no se han registrado egresos hoy.</p>
            ) : (
              <>
                {egresos.map((egreso) => (
                  <div className="caja-movimiento-item" key={egreso.id_egreso}>
                    <div className="movimiento-info">
                      <p className="movimiento-concepto">{egreso.concepto}</p>
                      <p className="movimiento-meta">
                        {egreso.tipo_egreso.toUpperCase()} · {egreso.fecha_registro}
                      </p>
                    </div>
                    <div className="movimiento-derecha">
  <span className="movimiento-monto">- C${egreso.monto_cordobas}</span>
  <button
    className="movimiento-eliminar"
    onClick={() => setEgresoEditando(egreso)}
  >
    <Pencil size={15} />
  </button>
</div>
                  </div>
                ))}
                <div className="caja-total-egresos">
                  <span>Total egresos</span>
                  <strong>- C${totalEgresos.toLocaleString()}</strong>
                </div>
              </>
            )}
          </div>

          <div className="caja-footer-acciones">
            <button className="btn-exportar">
              <FileDown size={16} />
              Exportar cierre de ayer
            </button>
            <button className="btn-cerrar-caja" onClick={() => navigate("/caja/cierre")}>
              Cerrar caja
            </button>
          </div>
        </>
      )}

      {(modalEgresoAbierto || egresoEditando) && sesionActiva && (
  <EgresoModal
    idSesion={sesionActiva.id_sesion}
    egresoAEditar={egresoEditando}
    onClose={() => {
      setModalEgresoAbierto(false);
      setEgresoEditando(null);
    }}
    onGuardado={(egreso) => {
      if (egresoEditando) {
        handleEgresoActualizado(egreso);
      } else {
        setEgresos((prev) => [...prev, egreso]);
      }
      setModalEgresoAbierto(false);
    }}
  />
)}
    </div>
  );
}