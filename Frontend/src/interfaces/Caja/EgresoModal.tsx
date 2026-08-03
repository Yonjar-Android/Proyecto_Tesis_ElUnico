import { useState } from "react";
import { Wallet, X } from "lucide-react";
import { crearEgresoCaja } from "../../services/caja.service";
import "./EgresoModal.css";

interface EgresoModalProps {
  idSesion: number;
  onClose: () => void;
  onGuardado: (egreso: any) => void;
}

const TIPOS_EGRESO = ["Compras", "Servicios", "Sueldos", "Mantenimiento", "Otros"];
const METODOS_PAGO = ["Efectivo", "Tarjeta", "Transferencia"];

export default function EgresoModal({ idSesion, onClose, onGuardado }: EgresoModalProps) {
  const [tipoEgreso, setTipoEgreso] = useState(TIPOS_EGRESO[0]);
  const [metodoPago, setMetodoPago] = useState(METODOS_PAGO[0]);
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function handleGuardar() {
    setError("");
    if (!concepto || !monto || Number(monto) <= 0) {
      setError("Completa el concepto y un monto válido.");
      return;
    }

    setGuardando(true);
    try {
      const data = await crearEgresoCaja({
        idSesion,
        tipoEgreso,
        metodoPago,
        concepto,
        monto: Number(monto),
        observaciones,
      });

      onGuardado({
        id_egreso: data.idEgreso,
        tipo_egreso: tipoEgreso,
        metodo_pago: metodoPago,
        concepto,
        monto_cordobas: Number(monto),
        fecha_registro: new Date().toLocaleTimeString("es-NI", { hour: "2-digit", minute: "2-digit" }),
      });
    } catch (err) {
      setError("No se pudo guardar el egreso.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="egreso-overlay" onClick={onClose}>
      <div className="egreso-modal" onClick={(e) => e.stopPropagation()}>
        <button className="egreso-cerrar" onClick={onClose}>
          <X size={18} />
        </button>

        <h2 className="egreso-titulo">
          <Wallet size={18} />
          Registrar Egreso de Caja
        </h2>

        <div className="egreso-grid">
          <div className="egreso-campo">
            <label>Tipo de egreso</label>
            <select value={tipoEgreso} onChange={(e) => setTipoEgreso(e.target.value)}>
              {TIPOS_EGRESO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div className="egreso-campo">
            <label>Método de pago</label>
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
              {METODOS_PAGO.map((metodo) => (
                <option key={metodo} value={metodo}>
                  {metodo}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="egreso-campo">
          <label>Concepto o descripción</label>
          <input
            type="text"
            placeholder="Ej: Repuestos para taller, Pago energía..."
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
          />
        </div>

        <div className="egreso-campo">
          <label>Monto (C$)</label>
          <div className="egreso-monto-wrap">
            <span>C$</span>
            <input
              type="number"
              min={0}
              placeholder="0.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
          </div>
        </div>

        <div className="egreso-campo">
          <label>Observaciones</label>
          <textarea
            placeholder="Detalles adicionales del movimiento..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={3}
          />
        </div>

        {error && <div className="egreso-error">{error}</div>}

        <div className="egreso-acciones">
          <button className="btn-egreso-cancelar" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-egreso-guardar" onClick={handleGuardar} disabled={guardando}>
            <Wallet size={16} />
            {guardando ? "Guardando..." : "Guardar egreso"}
          </button>
        </div>
      </div>
    </div>
  );
}