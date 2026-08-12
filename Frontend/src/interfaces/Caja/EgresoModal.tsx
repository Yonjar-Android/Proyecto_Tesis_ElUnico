import { useState } from "react";
import { Wallet, X } from "lucide-react";
import { crearEgresoCaja, actualizarEgreso } from "../../services/caja.service";
import "./EgresoModal.css";

interface EgresoExistente {
  id_egreso: number;
  tipo_egreso: string;
  metodo_pago: string;
  concepto: string;
  monto_cordobas: number;
  observaciones?: string;
}

interface EgresoModalProps {
  idSesion: number;
  egresoAEditar?: EgresoExistente | null;
  onClose: () => void;
  onGuardado: (egreso: any) => void;
}

const TIPOS_EGRESO = ["Compras", "Servicios", "Sueldos", "Mantenimiento", "Otros"];
const METODOS_PAGO = ["Efectivo", "Tarjeta", "Transferencia"];

export default function EgresoModal({ idSesion, egresoAEditar, onClose, onGuardado }: EgresoModalProps) {
  const esEdicion = !!egresoAEditar;

  const [tipoEgreso, setTipoEgreso] = useState(egresoAEditar?.tipo_egreso || TIPOS_EGRESO[0]);
  const [metodoPago, setMetodoPago] = useState(egresoAEditar?.metodo_pago || METODOS_PAGO[0]);
  const [concepto, setConcepto] = useState(egresoAEditar?.concepto || "");
  const [monto, setMonto] = useState(egresoAEditar ? String(egresoAEditar.monto_cordobas) : "");
  const [observaciones, setObservaciones] = useState(egresoAEditar?.observaciones || "");
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
      const payload = {
        idSesion,
        tipoEgreso,
        metodoPago,
        concepto,
        montoCordobas: Number(monto),
        observaciones,
      };

      if (esEdicion && egresoAEditar) {
        await actualizarEgreso(egresoAEditar.id_egreso, payload);
        onGuardado({
          id_egreso: egresoAEditar.id_egreso,
          tipo_egreso: tipoEgreso,
          metodo_pago: metodoPago,
          concepto,
          monto_cordobas: Number(monto),
          fecha_registro: (egresoAEditar as any).fecha_registro,
        });
      } else {
        const data = await crearEgresoCaja(payload);
        onGuardado({
          id_egreso: data.idEgreso,
          tipo_egreso: tipoEgreso,
          metodo_pago: metodoPago,
          concepto,
          monto_cordobas: Number(monto),
          fecha_registro: new Date().toLocaleTimeString("es-NI", { hour: "2-digit", minute: "2-digit" }),
        });
      }
    } catch (err) {
      setError(esEdicion ? "No se pudo actualizar el egreso." : "No se pudo guardar el egreso.");
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
            {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Guardar egreso"}
          </button>
        </div>
      </div>
    </div>
  );
}