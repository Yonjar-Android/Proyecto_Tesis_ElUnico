import { useState } from "react";
import { Wallet, X } from "lucide-react";
import { crearEgresoCaja, actualizarEgreso } from "../../services/caja.service";
import "./EgresoModal.css";
import { formatearMoneda } from "../FuncionAuxiliar";

interface EgresoExistente {
  id_egreso: number;
  tipo_egreso: string;
  metodo_pago: string;
  concepto: string;
  monto_cordobas: number;
  monto_dolares?: number;
  fecha_registro?: string;
  observaciones?: string;
}

interface EgresoModalProps {
  idSesion: number;
  egresoAEditar?: EgresoExistente | null;
  disponibleCordobas?: number;
  disponibleDolares?: number;
  tasaCambio?: number;
  onClose: () => void;
  onGuardado: (egreso: any) => void;
}

const TIPOS_EGRESO = ["Compras", "Servicios", "Sueldos", "Mantenimiento", "Otros"];
const METODOS_PAGO = ["Efectivo", "Tarjeta", "Transferencia"];

export default function EgresoModal({
  idSesion,
  egresoAEditar,
  disponibleCordobas,
  disponibleDolares,
  tasaCambio = 36.62,
  onClose,
  onGuardado
}: EgresoModalProps) {
  const esEdicion = !!egresoAEditar;

  const [tipoEgreso, setTipoEgreso] = useState(egresoAEditar?.tipo_egreso || TIPOS_EGRESO[0]);
  const [metodoPago, setMetodoPago] = useState(egresoAEditar?.metodo_pago || METODOS_PAGO[0]);
  const [concepto, setConcepto] = useState(egresoAEditar?.concepto || "");
  const [montoCordobas, setMontoCordobas] = useState(egresoAEditar ? String(egresoAEditar.monto_cordobas) : "");
  const [montoDolares, setMontoDolares] = useState(egresoAEditar ? String(egresoAEditar.monto_dolares || 0) : "");
  const [observaciones, setObservaciones] = useState(egresoAEditar?.observaciones || "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function handleGuardar() {
    setError("");
    const numCordobas = Number(montoCordobas) || 0;
    const numDolares = Number(montoDolares) || 0;

    if (!concepto.trim()) {
      setError("Completa el concepto o descripción del egreso.");
      return;
    }

    if (numCordobas <= 0 && numDolares <= 0) {
      setError("Ingresa al menos un monto válido en córdobas o dólares.");
      return;
    }

    // Validación estricta: No se debe de sacar más de la caja
    if (metodoPago === "Efectivo") {
      const limiteCordobas = (disponibleCordobas ?? Infinity) + (esEdicion && egresoAEditar?.metodo_pago === "Efectivo" ? Number(egresoAEditar.monto_cordobas || 0) : 0);
      const limiteDolares = (disponibleDolares ?? Infinity) + (esEdicion && egresoAEditar?.metodo_pago === "Efectivo" ? Number(egresoAEditar.monto_dolares || 0) : 0);

      if (numCordobas > 0 && numCordobas > limiteCordobas + 0.01) {
        setError(`No se puede sacar más de la caja. Saldo disponible en córdobas: C$${formatearMoneda(Math.max(0, limiteCordobas))}.`);
        return;
      }

      if (numDolares > 0 && numDolares > limiteDolares + 0.01) {
        setError(`No se puede sacar más de la caja. Saldo disponible en dólares: $${formatearMoneda(Math.max(0, limiteDolares))} USD.`);
        return;
      }
    }

    setGuardando(true);
    try {
      const payload = {
        idSesion,
        tipoEgreso,
        metodoPago,
        concepto: concepto.trim(),
        montoCordobas: numCordobas,
        montoDolares: numDolares,
        observaciones,
      };

      if (esEdicion && egresoAEditar) {
        await actualizarEgreso(egresoAEditar.id_egreso, payload);
        onGuardado({
          id_egreso: egresoAEditar.id_egreso,
          tipo_egreso: tipoEgreso,
          metodo_pago: metodoPago,
          concepto: concepto.trim(),
          monto_cordobas: numCordobas,
          monto_dolares: numDolares,
          fecha_registro: (egresoAEditar as any).fecha_registro,
        });
      } else {
        const data = await crearEgresoCaja(payload);
        onGuardado({
          id_egreso: data.idEgreso,
          tipo_egreso: tipoEgreso,
          metodo_pago: metodoPago,
          concepto: concepto.trim(),
          monto_cordobas: numCordobas,
          monto_dolares: numDolares,
          fecha_registro: new Date().toLocaleTimeString("es-NI", { hour: "2-digit", minute: "2-digit" }),
        });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || (esEdicion ? "No se pudo actualizar el egreso." : "No se pudo guardar el egreso."));
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
          {esEdicion ? "Editar Egreso de Caja" : "Registrar Egreso de Caja"}
        </h2>

        {/* Resumen de efectivo disponible en caja física */}
        <div style={{
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "8px",
          padding: "10px 14px",
          marginBottom: "14px",
          fontSize: "13px",
          color: "#166534",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <strong>Saldo disponible en caja:</strong>
            <div style={{ marginTop: 2, display: "flex", gap: "10px", fontSize: "12.5px" }}>
              <span>C$ {formatearMoneda(disponibleCordobas ?? 0)}</span>
              <span>·</span>
              <span>$ {formatearMoneda(disponibleDolares ?? 0)} USD</span>
            </div>
          </div>
          <span style={{ fontSize: "11.5px", color: "#15803d" }}>
            1 USD = C$ {Number(tasaCambio).toFixed(2)}
          </span>
        </div>

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
          <label>Monto en córdobas</label>
          <div className="egreso-monto-wrap">
            <span>C$</span>
            <input
              type="number"
              min={0}
              placeholder="0.00"
              value={montoCordobas}
              onChange={(e) => setMontoCordobas(e.target.value)}
            />
          </div>
        </div>

        <div className="egreso-campo">
          <label>Monto en dólares</label>
          <div className="egreso-monto-wrap">
            <span>$</span>
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              value={montoDolares}
              onChange={(e) => setMontoDolares(e.target.value)}
            />
          </div>
          {Number(montoDolares) > 0 && (
            <small style={{ color: "#0047ab", fontSize: 12, marginTop: 4, display: "block" }}>
              Equivalente en córdobas: C$ {formatearMoneda(Number(montoDolares) * tasaCambio)}
            </small>
          )}
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
            {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Guardar egreso"}
          </button>
        </div>
      </div>
    </div>
  );
}