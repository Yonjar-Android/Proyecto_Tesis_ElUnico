import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, FileDown, CheckCircle } from "lucide-react";
import ConteoBilletes from "./ConteoBilletes";
import type { DesgloseItem } from "./ConteoBilletes";
import { cerrarCaja, obtenerResumenCierre, obtenerSesionActiva } from "../../services/caja.service";
import { useCajaAbierta } from "../../context/CajaContext";
import "./AperturaCierre.css";
import { formatearMoneda } from "../FuncionAuxiliar";

export default function CierreCaja() {
  const navigate = useNavigate();
  const { refrescarCaja } = useCajaAbierta();
  const [tasaCambio] = useState(36.62);
  const [totalContado, setTotalContado] = useState(0);
  const [, setDesglose] = useState<DesgloseItem[]>([]);
  const [totalTarjeta, setTotalTarjeta] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [sesionActiva, setSesionActiva] = useState<{ id_sesion: number; [key: string]: any } | null>(null);
  const [dataCaja, setDataCaja] = useState<any>(null);
  const [modalCierreExitoso, setModalCierreExitoso] = useState(false);

  // Totales del sistema (calculados en base a las ventas/egresos del día)
  const [totalSistema, setTotalSistema] = useState({
    montoApertura: 0,
    ingresos: 0,
    egresos: 0,
    neto: 0,
    efectivoEsperado: 0,
  });

  useEffect(() => {
    cargarResumenSistema();
    cargarSesionActiva();
  }, []);

  async function cargarResumenSistema() {
    try {
      const data = await obtenerResumenCierre();
      setTotalSistema({
        montoApertura: data.resumen.montoApertura,
        ingresos: data.resumen.ingresosDia,
        egresos: data.resumen.totalEgresos,
        neto: data.resumen.ingresosDia - data.resumen.totalEgresos,
        efectivoEsperado: data.resumen.efectivoEsperado,
      });
    } catch (err) {
      setTotalSistema({
        montoApertura: 0,
        ingresos: 0,
        egresos: 0,
        neto: 0,
        efectivoEsperado: 0,
      });
    }
  }

  async function cargarSesionActiva() {
    try {
      const data = await obtenerSesionActiva();
      setSesionActiva(data.sesion);
      setDataCaja(data);

      if (data.sesion?.total_tarjeta_transferencia && !totalTarjeta) {
        setTotalTarjeta(String(Number(data.sesion.total_tarjeta_transferencia) || ""));
      }
    } catch (err) {
      setSesionActiva(null);
      setDataCaja(null);
    }
  }

  const diferencia = totalContado + Number(totalTarjeta || 0) - totalSistema.efectivoEsperado;

  async function handleCerrarCaja() {
    setError("");
    if (!sesionActiva) {
      setError("No hay una sesión de caja activa.");
      return;
    }

    if (totalContado <= 0) {
      setError("Debes contar el efectivo antes de cerrar la caja.");
      return;
    }

    setGuardando(true);
    try {
      await cerrarCaja(
        sesionActiva.id_sesion,
        totalContado,
        Number(totalTarjeta || 0),
        diferencia,
        observaciones
      );
      await refrescarCaja();
      setModalCierreExitoso(true);
    } catch (err) {
      setError("No se pudo cerrar la caja. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  function exportarCierreExcel() {
    const sesion = dataCaja?.sesion || sesionActiva;
    if (!sesion) return;

    const fechaHoy = new Date().toLocaleDateString("es-NI", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const horaActual = new Date().toLocaleTimeString("es-NI", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const aperturaCordobas = Number(sesion.monto_apertura_cordobas) || 0;
    const aperturaDolares = Number(sesion.monto_apertura_dolares) || 0;
    const tasa = Number(sesion.tasa_cambio) || tasaCambio;
    const aperturaDolaresEnCordobas = aperturaDolares * tasa;
    const egresosList: any[] = dataCaja?.egresos || [];
    const totalEgresos = totalSistema.egresos;
    const transferenciasMonto = Number(totalTarjeta || sesion.total_tarjeta_transferencia || 0);

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
          <tr><td colspan="4">REPORTE OFICIAL DE CIERRE DE CAJA</td></tr>
          <tr><td colspan="4">Fecha: ${fechaHoy} ${horaActual} | Sesión: #${sesion.id_sesion} | Tasa: C$${tasa.toFixed(2)}</td></tr>
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
            <td colspan="2" class="td-val" style="color: #16a34a; font-weight: bold;">C$ ${formatearMoneda(totalSistema.ingresos)}</td>
          </tr>
          <tr>
            <td colspan="2" class="td-lbl">Ingresos por Transferencias</td>
            <td colspan="2" class="td-val" style="color: #0047ab; font-weight: bold;">C$ ${formatearMoneda(transferenciasMonto)}</td>
          </tr>
          <tr>
            <td colspan="2" class="td-lbl">Total Egresos del Día</td>
            <td colspan="2" class="td-val" style="color: #dc2626; font-weight: bold;">- C$ ${formatearMoneda(totalEgresos)}</td>
          </tr>
          <tr>
            <td colspan="2" class="td-lbl">Total Esperado por Sistema</td>
            <td colspan="2" class="td-val" style="font-weight: bold;">C$ ${formatearMoneda(totalSistema.efectivoEsperado)}</td>
          </tr>
          <tr>
            <td colspan="2" class="td-lbl">Efectivo Físico Contado</td>
            <td colspan="2" class="td-val" style="font-weight: bold;">C$ ${formatearMoneda(totalContado)}</td>
          </tr>
          <tr>
            <td colspan="2" class="td-lbl">Diferencia al Cierre</td>
            <td colspan="2" class="td-val" style="font-weight: bold; color: ${diferencia < 0 ? '#dc2626' : '#16a34a'};">
              ${diferencia > 0 ? "+" : ""}C$ ${formatearMoneda(diferencia)}
            </td>
          </tr>
          <tr>
            <td colspan="2" class="td-neto-lbl">TOTAL DINERO AL CIERRE (Contado + Transferencia)</td>
            <td colspan="2" class="td-neto">C$ ${formatearMoneda(totalContado + transferenciasMonto)}</td>
          </tr>

          <tr><td colspan="4"></td></tr>

          <tr>
            <th colspan="4" class="th-egreso">DETALLE DE EGRESOS REGISTRADOS (${egresosList.length})</th>
          </tr>
          <tr style="background-color: #f1f5f9; font-weight: bold;">
            <td>#</td>
            <td>Concepto</td>
            <td>Tipo</td>
            <td style="text-align: right;">Monto</td>
          </tr>
          ${
            egresosList.length === 0
              ? '<tr><td colspan="4" style="text-align: center; color: #888;">No hubo egresos registrados en esta sesión</td></tr>'
              : egresosList
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
    link.download = `Cierre_Caja_${fechaHoy.replace(/\//g, "-")}_Sesion_${sesion.id_sesion}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="apertura-container">
      <h1 className="apertura-titulo">
        <Lock size={22} />
        Cierre de Caja
      </h1>
      <p className="apertura-subtitulo">
        Cuenta el efectivo final y compara contra lo esperado por el sistema.
      </p>

      <div className="cierre-resumen-sistema">
        <div>
          <span>Apertura</span>
          <strong>C${formatearMoneda(totalSistema.montoApertura)}</strong>
        </div>
        <div>
          <span>+ Ingresos</span>
          <strong className="valor-verde-cierre">C${formatearMoneda(totalSistema.ingresos)}</strong>
        </div>
        <div>
          <span>- Egresos</span>
          <strong className="valor-rojo-cierre">C${formatearMoneda(totalSistema.egresos)}</strong>
        </div>
        <div className="cierre-esperado">
          <span>Efectivo esperado</span>
          <strong>C${formatearMoneda(totalSistema.efectivoEsperado)}</strong>
        </div>
      </div>

      <div className="apertura-card">
        <ConteoBilletes
          tasaCambio={tasaCambio}
          onTotalChange={(total, items) => {
            setTotalContado(total);
            setDesglose(items);
          }}
        />

        <div className="apertura-campo">
          <label>Tarjeta / Transferencia (C$)</label>
          <input
            type="number"
            min={0}
            placeholder="0.00"
            value={totalTarjeta}
            onChange={(e) => setTotalTarjeta(e.target.value)}
          />
        </div>

        <div className={`cierre-diferencia ${diferencia < 0 ? "diferencia-negativa" : diferencia > 0 ? "diferencia-positiva" : ""}`}>
          <span>Diferencia</span>
          <strong>
            {diferencia > 0 ? "+" : ""}C${diferencia.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </strong>
        </div>

        <div className="apertura-campo">
          <label>Observaciones del cierre</label>
          <textarea
            placeholder="Ej: Faltante por vuelto no registrado..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={3}
          />
        </div>

        {error && <div className="apertura-error">{error}</div>}

        <div className="apertura-acciones">
          <button className="btn-apertura-cancelar" onClick={() => navigate("/caja")}>
            Cancelar
          </button>
          <button className="btn-apertura-confirmar btn-cierre-confirmar" onClick={handleCerrarCaja} disabled={guardando}>
            {guardando ? "Cerrando caja..." : "Confirmar cierre"}
          </button>
        </div>
      </div>

      {modalCierreExitoso && (
        <div className="modal-cierre-overlay">
          <div className="modal-cierre-content">
            <div className="modal-cierre-icono">
              <CheckCircle size={38} />
            </div>
            <h2 className="modal-cierre-titulo">¡Caja cerrada exitosamente!</h2>
            <p className="modal-cierre-subtitulo">
              La sesión #{sesionActiva?.id_sesion} ha finalizado y se ha completado el arqueo de cierre.
            </p>

            <div className="modal-cierre-resumen-grid">
              <div className="modal-cierre-resumen-item">
                <span>Efectivo Contado</span>
                <strong>C${formatearMoneda(totalContado)}</strong>
              </div>
              <div className="modal-cierre-resumen-item">
                <span>Transferencias</span>
                <strong>C${formatearMoneda(Number(totalTarjeta || 0))}</strong>
              </div>
              <div className="modal-cierre-resumen-item">
                <span>Total Esperado</span>
                <strong>C${formatearMoneda(totalSistema.efectivoEsperado)}</strong>
              </div>
              <div className="modal-cierre-resumen-item">
                <span>Diferencia</span>
                <strong style={{ color: diferencia < 0 ? "#dc2626" : "#16a34a" }}>
                  {diferencia > 0 ? "+" : ""}C${formatearMoneda(diferencia)}
                </strong>
              </div>
            </div>

            <div className="modal-cierre-acciones">
              <button className="btn-modal-exportar" onClick={exportarCierreExcel}>
                <FileDown size={18} />
                Descargar Cierre en Excel
              </button>
              <button
                className="btn-modal-salir"
                onClick={() => navigate("/caja/historial")}
              >
                Ver Historial de Cajas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}