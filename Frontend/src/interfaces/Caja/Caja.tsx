import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, AlertTriangle } from "lucide-react";
import EgresoModal from "./EgresoModal";
import { obtenerSesionActiva } from "../../services/caja.service";
import "./Caja.css";
import { formatearMoneda } from "../FuncionAuxiliar";

interface SesionCaja {
  id_sesion: number;
  fecha_apertura: string;
  monto_apertura_cordobas: number;
  monto_apertura_dolares?: number;
  monto_apertura_usd?: number;
  monto_dolares?: number;
  tasa_cambio: number;
  total_ingresos_sistema?: number;
  total_tarjeta_transferencia?: number;
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
  const [transferencias, setTransferencias] = useState(0);

  const [modalEgresoAbierto, setModalEgresoAbierto] = useState(false);
  const [egresoEditando, setEgresoEditando] = useState<Egreso | null>(null);

  useEffect(() => {
    cargarEstadoCaja();
  }, []);

  async function cargarEstadoCaja() {
    try {
      const data = await obtenerSesionActiva();
      setSesionActiva(data.sesion);
      setEgresos(data.egresos || []);

      // Ingresos en efectivo del día
      setIngresosDia(
        Number(data.ingresosDia ?? data.sesion?.total_ingresos_sistema ?? 0)
      );

      // Ingresos por transferencias (banco / electrónico)
      setTransferencias(
        Number(
          data.transferencias ??
          data.sesion?.total_tarjeta_transferencia ??
          data.total_transferencias ??
          data.ingresosTransferencias ??
          0
        )
      );
    } catch (error) {
      console.error(error);
      setSesionActiva(null);
      setEgresos([]);
      setIngresosDia(0);
      setTransferencias(0);
    }
  }

  // --- CÁLCULOS FINANCIEROS LIMPIOS ---
  const tasaCambio = Number(sesionActiva?.tasa_cambio) || 36.62;
  const aperturaCordobas = Number(sesionActiva?.monto_apertura_cordobas) || 0;

  // Busca los dólares de apertura bajo cualquier nombre común que devuelva el backend
  const aperturaDolares = Number(
    sesionActiva?.monto_apertura_dolares ??
    sesionActiva?.monto_apertura_usd ??
    sesionActiva?.monto_dolares ??
    0
  );

  // Equivalente en córdobas de los dólares de apertura
  const aperturaDolaresEnCordobas = aperturaDolares * tasaCambio;

  // Total de egresos registrados
  const totalEgresos = egresos.reduce((acc, e) => acc + Number(e.monto_cordobas || 0), 0);

  // Total apertura consolidada
  const aperturaTotal = aperturaCordobas + aperturaDolaresEnCordobas;

  // NETO DEL DÍA: Monto de apertura + Ingresos - Egresos
  const netoDia = aperturaTotal + ingresosDia + transferencias - totalEgresos;

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
          <span className="caja-tasa-pill">1 USD · C${tasaCambio.toFixed(2)}</span>
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
            <button className="caja-tab caja-tab-activo">
              Arqueo del día
            </button>
            <button className="caja-tab caja-tab-egresos caja-tab-egresos-activo">
              Egresos ({egresos.length})
            </button>
          </div>

          {/* GRID DE RESUMEN FINANCIERO: 6 TARJETAS (2 filas de 3) */}
          <div className="caja-resumen-grid">
            {/* 1. Apertura Córdobas */}
            <div className="caja-resumen-card">
              <span>Apertura Córdobas</span>
              <strong>C${formatearMoneda(aperturaCordobas)}</strong>
              <small style={{ color: "#64748b", fontSize: 12 }}>Fondo inicial C$</small>
            </div>

            {/* 2. Apertura Dólares (ESPACIO DEDICADO) */}
            <div className="caja-resumen-card">
              <span>Apertura Dólares</span>
              <strong style={{ color: "#0047ab" }}>${formatearMoneda(aperturaDolares)} USD</strong>
              <small style={{ color: "#64748b", fontSize: 12 }}>
                Equiv. C${formatearMoneda(aperturaDolaresEnCordobas)}
              </small>
            </div>

            {/* 3. Ingresos del día */}
            <div className="caja-resumen-card">
              <span>Ingresos del día</span>
              <strong className="valor-verde">C${formatearMoneda(ingresosDia)}</strong>
              <small style={{ color: "#16a34a", fontSize: 12 }}>Ventas en efectivo</small>
            </div>

            {/* 4. Transferencias */}
            <div className="caja-resumen-card">
              <span>Transferencias</span>
              <strong style={{ color: "#0047ab" }}>C${formatearMoneda(transferencias)}</strong>
              <small style={{ color: "#64748b", fontSize: 12 }}>Banco / Electrónico</small>
            </div>

            {/* 5. Egresos del día */}
            <div className="caja-resumen-card">
              <span>Egresos del día</span>
              <strong className="valor-rojo">- C${formatearMoneda(totalEgresos)}</strong>
              <small style={{ color: "#dc2626", fontSize: 12 }}>{egresos.length} salidas</small>
            </div>

            {/* 6. Neto del día (ÚNICA TARJETA DE TOTAL CONSOLIDADO) */}
            <div className="caja-resumen-card caja-resumen-neto">
              <span>Neto del día</span>
              <strong>C${formatearMoneda(netoDia)}</strong>
              <small style={{ color: "rgba(255,255,255,0.85)", fontSize: 11.5 }}>
                Apertura + Ingresos - Egresos
              </small>
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
                      <span className="movimiento-monto">- C${formatearMoneda(egreso.monto_cordobas)}</span>
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
                  <strong>- C${formatearMoneda(totalEgresos)}</strong>
                </div>
              </>
            )}
          </div>

          <div className="caja-footer-acciones" style={{ justifyContent: "flex-end" }}>
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