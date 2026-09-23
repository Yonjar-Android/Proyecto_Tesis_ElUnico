import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Wallet, HelpCircle } from "lucide-react";
import { Joyride, type Step } from "react-joyride";
import ConteoBilletes from "./ConteoBilletes";
import type { DesgloseItem } from "./ConteoBilletes";
import { abrirCaja } from "../../services/caja.service";
import { useCajaAbierta } from "../../context/CajaContext";
import "./AperturaCierre.css";
 
export default function AperturaCaja() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cajaAbierta, refrescarCaja, marcarCajaAbierta } = useCajaAbierta();
 
  const mensajeCaja = (location.state as { mensajeCaja?: string } | null)?.mensajeCaja;
 
  const [tasaCambio, setTasaCambio] = useState(36.62);
  const [totalContado, setTotalContado] = useState(0);
  const [montoCordobas, setMontoCordobas] = useState(0); // <-- Córdobas contados
  const [montoDolares, setMontoDolares] = useState(0);     // <-- Dólares contados
  const [, setDesglose] = useState<DesgloseItem[]>([]);
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [tourActivo, setTourActivo] = useState(false);
  const pasosTour: Step[] = [
    {
      target: '[data-tour="apertura-tasa"]',
      content: "Establece la tasa de cambio oficial de Córdobas por Dólar (USD) para las operaciones de la jornada.",
    },
    {
      target: '[data-tour="apertura-conteo"]',
      content: "Ingresa el desglose físico de billetes y monedas en Córdobas y Dólares con los que inicia el fondo de caja.",
    },
    {
      target: '[data-tour="apertura-observaciones"]',
      content: "Permite registrar notas u observaciones iniciales del turno si existieran irregularidades.",
    },
    {
      target: '[data-tour="apertura-confirmar"]',
      content: "Confirma la apertura formal de la caja para habilitar facturación y cobros en el sistema.",
    },
  ];

  async function handleAbrirCaja() {
    setError("");
    if (totalContado <= 0) {
      setError("Debes contar el efectivo inicial antes de abrir la caja.");
      return;
    }
 
    setGuardando(true);
    try {
      // AQUÍ ESTABA EL ERROR: Ahora pasamos los 4 argumentos en orden
      const respuesta = await abrirCaja(montoCordobas, montoDolares, tasaCambio, observaciones);
      if (respuesta?.success === false) {
        throw new Error(respuesta.message || "No se pudo abrir la caja.");
      }
      marcarCajaAbierta();
      navigate("/caja", { replace: true });
      void refrescarCaja();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "No se pudo abrir la caja. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  if (cajaAbierta === true) {
    return (
      <div className="apertura-container">
        <h1 className="apertura-titulo">
          <Wallet size={22} />
          Apertura de Caja
        </h1>
        <div className="apertura-card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ color: "#16a34a", fontSize: 44, marginBottom: 12 }}>✓</div>
          <h2 style={{ fontSize: 20, color: "#0f172a", marginBottom: 8, fontWeight: 700 }}>
            Ya existe una sesión de caja activa
          </h2>
          <p style={{ color: "#64748b", maxWidth: 460, margin: "0 auto 24px", fontSize: 14 }}>
            No es posible realizar una nueva apertura mientras haya una caja abierta. Puedes continuar operando en el arqueo del día o realizar el cierre.
          </p>
          <button
            className="btn-apertura-confirmar"
            style={{ margin: "0 auto", display: "inline-flex" }}
            onClick={() => navigate("/caja")}
          >
            Ir al Arqueo del día
          </button>
        </div>
      </div>
    );
  }
 
  return (
    <div className="apertura-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <h1 className="apertura-titulo" style={{ margin: 0 }}>
          <Wallet size={22} />
          Apertura de Caja
        </h1>
        <button
          type="button"
          className="apertura-help-btn"
          onClick={() => setTourActivo(true)}
          title="Guía de ayuda"
        >
          <HelpCircle size={18} />
        </button>
      </div>
      <p className="apertura-subtitulo">
        Cuenta el efectivo con el que se inicia el día antes de comenzar a operar.
      </p>
 
      {mensajeCaja && (
        <div className="apertura-error">⚠ {mensajeCaja}</div>
      )}
 
      <div className="apertura-card">
        <div className="apertura-campo apertura-tasa" data-tour="apertura-tasa">
          <label>Tasa de cambio del día (1 USD =)</label>
          <div className="apertura-tasa-input">
            <span>C$</span>
            <input
              type="number"
              step="0.01"
              value={tasaCambio}
              onChange={(e) => setTasaCambio(Number(e.target.value) || 0)}
            />
          </div>
        </div>
 
        <div data-tour="apertura-conteo">
          <ConteoBilletes
            tasaCambio={tasaCambio}
            onTotalChange={(total, items, cordobas, dolares) => {
              setTotalContado(total);
              setDesglose(items);
              setMontoCordobas(cordobas || 0); // <-- Guarda los córdobas contados
              setMontoDolares(dolares || 0);   // <-- Guarda los dólares contados
            }}
          />
        </div>
 
        <div className="apertura-campo" data-tour="apertura-observaciones">
          <label>Observaciones de apertura</label>
          <textarea
            placeholder="Ej: Todo en orden, sin novedades..."
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
          <button className="btn-apertura-confirmar" data-tour="apertura-confirmar" onClick={handleAbrirCaja} disabled={guardando}>
            {guardando ? "Abriendo caja..." : "Confirmar apertura"}
          </button>
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
    </div>
  );
}