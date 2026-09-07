import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, AlertTriangle, FileDown } from "lucide-react";
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
  const [ingresosDolares, setIngresosDolares] = useState(0);
  const [transferencias, setTransferencias] = useState(0);

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

      // Desglose si tu backend lo provee
      setTransferencias(
        Number(data.transferencias ?? data.total_transferencias ?? data.ingresosTransferencias ?? 0)
      );
      setIngresosDolares(
        Number(data.ingresosDolares ?? data.ingresos_dolares ?? 0)
      );
    } catch (error) {
      console.error(error);
      setSesionActiva(null);
      setEgresos([]);
      setIngresosDia(0);
      setTransferencias(0);
      setIngresosDolares(0);
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

  // --- EXPORTAR A EXCEL ---
  function exportarCierreExcel() {
    if (!sesionActiva) return;

    const fechaHoy = new Date().toLocaleDateString("es-NI", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const horaActual = new Date().toLocaleTimeString("es-NI", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; font-size: 11pt; }
          .empresa { font-size: 16pt; font-weight: bold; color: #0047ab; }
          .th-col { background-color: #0047ab; color: #ffffff; font-weight: bold; padding: 8px; }
          .th-egreso { background-color: #dc2626; color: #ffffff; font-weight: bold; padding: 8px; }
          .td-lbl { background-color: #f8fafc; font-weight: bold; border: 1px solid #e2e8f0; padding: 6px 10px; }
          .td-val { text-align: right; border: 1px solid #e2e8f0; padding: 6px 10px; }
          .td-neto { background-color: #0047ab; color: #ffffff; font-weight: bold; font-size: 12pt; text-align: right; padding: 8px 10px; }
          .td-neto-lbl { background-color: #0047ab; color: #ffffff; font-weight: bold; font-size: 12pt; padding: 8px 10px; }
        </style>
      </head>
      <body>
        <table>
          <tr><td colspan="4" class="empresa">EL ÚNICO MOTO REPUESTOS</td></tr>
          <tr><td colspan="4">REPORTE DE ARQUEO Y CIERRE DE CAJA</td></tr>
          <tr><td colspan="4">Fecha: ${fechaHoy} ${horaActual} | Sesión: #${sesionActiva.id_sesion} | Tasa: C$${tasaCambio.toFixed(2)}</td></tr>
          <tr><td colspan="4"></td></tr>

          <tr>
            <th colspan="2" class="th-col">CONCEPTO</th>
            <th colspan="2" class="th-col">MONTO</th>
          </tr>
          <tr>
            <td colspan="2" class="td-lbl">Apertura en Córdobas</td>
            <td colspan="2" class="td-val">C$ ${formatearMoneda(aperturaCordobas)}</td>
          </tr>
          <tr>
            <td colspan="2" class="td-lbl">Apertura en Dólares</td>
            <td colspan="2" class="td-val">$ ${formatearMoneda(aperturaDolares)} USD (Equiv: C$ ${formatearMoneda(aperturaDolaresEnCordobas)})</td>
          </tr>
          <tr>
            <td colspan="2" class="td-lbl">Ingresos en Efectivo (Ventas)</td>
            <td colspan="2" class="td-val" style="color: #16a34a; font-weight: bold;">C$ ${formatearMoneda(ingresosDia)}</td>
          </tr>
          <tr>
            <td colspan="2" class="td-lbl">Ingresos por Transferencias</td>
            <td colspan="2" class="td-val" style="color: #0047ab; font-weight: bold;">C$ ${formatearMoneda(transferencias)}</td>
          </tr>
          <tr>
            <td colspan="2" class="td-lbl">Total Egresos del Día</td>
            <td colspan="2" class="td-val" style="color: #dc2626; font-weight: bold;">- C$ ${formatearMoneda(totalEgresos)}</td>
          </tr>
          <tr>
            <td colspan="2" class="td-neto-lbl">TOTAL NETO EN CAJA (Apertura + Ingresos - Egresos)</td>
            <td colspan="2" class="td-neto">C$ ${formatearMoneda(netoDia)}</td>
          </tr>

          <tr><td colspan="4"></td></tr>

          <tr>
            <th colspan="4" class="th-egreso">DETALLE DE EGRESOS REGISTRADOS (${egresos.length})</th>
          </tr>
          <tr style="background-color: #f1f5f9; font-weight: bold;">
            <td>#</td>
            <td>Concepto</td>
            <td>Tipo</td>
            <td style="text-align: right;">Monto</td>
          </tr>
          ${
            egresos.length === 0
              ? '<tr><td colspan="4" style="text-align: center; color: #888;">No hubo egresos registrados</td></tr>'
              : egresos
                  .map(
                    (e, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${e.concepto}</td>
              <td>${e.tipo_egreso || "Egreso"}</td>
              <td style="text-align: right; color: #dc2626;">- C$ ${formatearMoneda(e.monto_cordobas)}</td>
            </tr>`
                  )
                  .join("")
          }
          <tr>
            <td colspan="3" style="font-weight: bold; text-align: right; background-color: #f8fafc;">TOTAL EGRESOS:</td>
            <td style="font-weight: bold; text-align: right; color: #dc2626; background-color: #f8fafc;">- C$ ${formatearMoneda(totalEgresos)}</td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Cierre_Caja_${fechaHoy.replace(/\//g, "-")}_Sesion_${sesionActiva.id_sesion}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

          <div className="caja-footer-acciones">
            <button className="btn-exportar" onClick={exportarCierreExcel}>
              <FileDown size={16} />
              Exportar cierre a Excel
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