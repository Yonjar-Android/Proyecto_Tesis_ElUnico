import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet } from "lucide-react";
import ConteoBilletes from "./ConteoBilletes";
import type { DesgloseItem } from "./ConteoBilletes";
import { abrirCaja } from "../../services/caja.service";
import "./AperturaCierre.css";

export default function AperturaCaja() {
  const navigate = useNavigate();
  const [tasaCambio, setTasaCambio] = useState(36.62);
  const [totalContado, setTotalContado] = useState(0);
  const [, setDesglose] = useState<DesgloseItem[]>([]);
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function handleAbrirCaja() {
    setError("");
    if (totalContado <= 0) {
      setError("Debes contar el efectivo inicial antes de abrir la caja.");
      return;
    }

    setGuardando(true);
    try {
      await abrirCaja(totalContado, tasaCambio, observaciones);
      navigate("/caja");
    } catch (err) {
      setError("No se pudo abrir la caja. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="apertura-container">
      <h1 className="apertura-titulo">
        <Wallet size={22} />
        Apertura de Caja
      </h1>
      <p className="apertura-subtitulo">
        Cuenta el efectivo con el que se inicia el día antes de comenzar a operar.
      </p>

      <div className="apertura-card">
        <div className="apertura-campo apertura-tasa">
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

        <ConteoBilletes
          tasaCambio={tasaCambio}
          onTotalChange={(total, items) => {
            setTotalContado(total);
            setDesglose(items);
          }}
        />

        <div className="apertura-campo">
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
          <button className="btn-apertura-confirmar" onClick={handleAbrirCaja} disabled={guardando}>
            {guardando ? "Abriendo caja..." : "Confirmar apertura"}
          </button>
        </div>
      </div>
    </div>
  );
}