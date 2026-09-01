import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import ConteoBilletes from "./ConteoBilletes";
import type { DesgloseItem } from "./ConteoBilletes";
import { cerrarCaja, obtenerResumenCierre, obtenerSesionActiva } from "../../services/caja.service";
import "./AperturaCierre.css";
import { formatearMoneda } from "../FuncionAuxiliar";

export default function CierreCaja() {
  const navigate = useNavigate();
  const [tasaCambio] = useState(36.62);
  const [totalContado, setTotalContado] = useState(0);
  const [, setDesglose] = useState<DesgloseItem[]>([]);
  const [totalTarjeta, setTotalTarjeta] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [sesionActiva, setSesionActiva] = useState<{ id_sesion: number } | null>(null);

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
    } catch (err) {
      setSesionActiva(null);
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
      navigate("/caja");
    } catch (err) {
      setError("No se pudo cerrar la caja. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
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
    </div>
  );
}