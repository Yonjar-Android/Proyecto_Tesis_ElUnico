import { useEffect, useState } from "react";
import type { DetalleConfirmacionVenta } from "./ModalConfirmarVenta";
import styles from "./ModalCobrarDiferencia.module.css";

type TipoMoneda = "cordobas" | "dolares" | "mixto";

// Debe ser la misma tasa que usa ModalConfirmarVenta
const TASA_CAMBIO = 36.6;

interface Props {
  abierto: boolean;
  totalAnterior: number;
  totalNuevo: number;
  onClose: () => void;
  // Debe devolver true si se guardó bien (el padre cierra el modal) y false si falló
  onConfirmar: (
    detalle: DetalleConfirmacionVenta,
    setErrorModal: (mensaje: string) => void
  ) => Promise<boolean>;
}

const redondear = (n: number) => Math.round(n * 100) / 100;

function formatearMoneda(valor: number) {
  return valor.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function ModalCobrarDiferencia({
  abierto,
  totalAnterior,
  totalNuevo,
  onClose,
  onConfirmar,
}: Props) {
  const [tipoMoneda, setTipoMoneda] = useState<TipoMoneda>("cordobas");
  const [montoCordobas, setMontoCordobas] = useState("");
  const [montoDolares, setMontoDolares] = useState("");
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (abierto) {
      setTipoMoneda("cordobas");
      setMontoCordobas("");
      setMontoDolares("");
      setError("");
      setProcesando(false);
    }
  }, [abierto]);

  if (!abierto) return null;

  // Lo que el cliente debe entregar ahora: solo la diferencia
  const diferencia = redondear(totalNuevo - totalAnterior);

  const numCordobas = Number(montoCordobas) || 0;
  const numDolares = Number(montoDolares) || 0;

  // Lo recibido, normalizado a córdobas
  const recibidoEnCordobas =
    tipoMoneda === "cordobas"
      ? numCordobas
      : tipoMoneda === "dolares"
      ? numDolares * TASA_CAMBIO
      : numCordobas + numDolares * TASA_CAMBIO;

  const cambioCordobas = Math.max(0, recibidoEnCordobas - diferencia);
  const faltanteCordobas = Math.max(0, diferencia - recibidoEnCordobas);
  const alcanza = recibidoEnCordobas > 0 && recibidoEnCordobas >= diferencia;

  const cambiarMoneda = (tipo: TipoMoneda) => {
    setTipoMoneda(tipo);
    setMontoCordobas("");
    setMontoDolares("");
    setError("");
  };

  const cerrar = () => {
    if (procesando) return;
    onClose();
    setError("");
  };

  const confirmar = async () => {
    if (procesando) return;

    if (tipoMoneda === "cordobas" && numCordobas <= 0) {
      setError("Ingresa el monto recibido en córdobas.");
      return;
    }
    if (tipoMoneda === "dolares" && numDolares <= 0) {
      setError("Ingresa el monto recibido en dólares.");
      return;
    }
    if (tipoMoneda === "mixto" && numCordobas <= 0 && numDolares <= 0) {
      setError("Ingresa al menos un monto recibido (córdobas o dólares).");
      return;
    }
    if (recibidoEnCordobas < diferencia) {
      setError("El monto recibido no puede ser menor a la diferencia a cobrar.");
      return;
    }

    // Ingresos netos por moneda (misma lógica que ModalConfirmarVenta, sobre la diferencia)
    const cordobasNetos =
      tipoMoneda === "cordobas"
        ? diferencia
        : tipoMoneda === "dolares"
        ? 0
        : Math.max(0, numCordobas - cambioCordobas);

    const dolaresNetos =
      tipoMoneda === "dolares"
        ? cambioCordobas === 0
          ? numDolares
          : Number((diferencia / TASA_CAMBIO).toFixed(2))
        : tipoMoneda === "cordobas"
        ? 0
        : numDolares;

    const detalle: DetalleConfirmacionVenta = {
      tipoMonedaRecibida: tipoMoneda,
      montoRecibidoCordobas: Number(cordobasNetos.toFixed(2)),
      montoRecibidoDolares: Number(dolaresNetos.toFixed(2)),
      cambioCordobas: redondear(cambioCordobas),
      tasaCambio: TASA_CAMBIO,
      dineroRecibido: recibidoEnCordobas,
    };

    setError("");
    setProcesando(true);
    const ok = await onConfirmar(detalle, setError);
    if (!ok) setProcesando(false);
  };

  return (
    <div className={styles.overlay} onClick={cerrar}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Cobrar diferencia"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.titulo}>Cobrar diferencia</h2>
          <button className={styles.cerrar} onClick={cerrar} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className={styles.resumen}>
          <div className={styles.fila}>
            <span>Total anterior</span>
            <span>C${formatearMoneda(totalAnterior)}</span>
          </div>
          <div className={styles.fila}>
            <span>Total nuevo</span>
            <span>C${formatearMoneda(totalNuevo)}</span>
          </div>
        </div>

        <div className={styles.totalCard}>
          <span className={styles.totalLabel}>Diferencia a cobrar</span>
          <span className={styles.totalMonto}>C${formatearMoneda(diferencia)}</span>
        </div>

        <p className={styles.nota}>
          El cliente solo entrega la diferencia. Lo que pagó antes ya está registrado en la factura.
        </p>

        <div className={styles.campo}>
          <label>
            Moneda recibida <span style={{ color: "#e5484d" }}>*</span>
          </label>
          <div className={styles.monedaSelector}>
            {(["cordobas", "dolares", "mixto"] as const).map((m) => (
              <button
                key={m}
                type="button"
                className={`${styles.monedaBtn} ${tipoMoneda === m ? styles.monedaBtnActivo : ""}`}
                onClick={() => cambiarMoneda(m)}
              >
                {m === "cordobas" ? "Córdobas" : m === "dolares" ? "Dólares" : "Mixto"}
              </button>
            ))}
          </div>
        </div>

        {tipoMoneda !== "dolares" && (
          <div className={styles.campo}>
            <label>Monto recibido (córdobas)</label>
            <div className={styles.inputGrupo}>
              <span>C$</span>
              <input
                type="number"
                step="1"
                min="0"
                placeholder="0.00"
                autoFocus
                value={montoCordobas}
                onChange={(e) => setMontoCordobas(e.target.value)}
              />
            </div>
          </div>
        )}

        {tipoMoneda !== "cordobas" && (
          <div className={styles.campo}>
            <label>Monto recibido (dólares)</label>
            <div className={styles.inputGrupo}>
              <span>$</span>
              <input
                type="number"
                step="1"
                min="0"
                placeholder="0.00"
                autoFocus={tipoMoneda === "dolares"}
                value={montoDolares}
                onChange={(e) => setMontoDolares(e.target.value)}
              />
            </div>
          </div>
        )}

        {tipoMoneda !== "cordobas" && (
          <p className={styles.nota}>
            Equivalente recibido: C${formatearMoneda(recibidoEnCordobas)} (tasa C$
            {formatearMoneda(TASA_CAMBIO)} por $1)
          </p>
        )}

        {faltanteCordobas > 0 ? (
          <div className={`${styles.cambioCard} ${styles.cambioCardFalta}`}>
            <span>⚠️ Falta</span>
            <span className={styles.cambioMonto}>C${formatearMoneda(faltanteCordobas)}</span>
          </div>
        ) : (
          <div className={styles.cambioCard}>
            <span>💵 Cambio</span>
            <span className={styles.cambioMonto}>C${formatearMoneda(cambioCordobas)}</span>
          </div>
        )}

        {error && <span className={styles.error}>{error}</span>}

        <div className={styles.acciones}>
          <button className={styles.btnCancelar} onClick={cerrar} disabled={procesando}>
            Cancelar
          </button>
          <button className={styles.btnConfirmar} onClick={confirmar} disabled={!alcanza || procesando}>
            {procesando ? "Guardando..." : "✓ Cobrar y guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalCobrarDiferencia;