import { useEffect, type ReactNode } from "react";
import styles from "./ModalConfirmacion.module.css";

interface Props {
  abierto: boolean;
  titulo: string;
  mensaje?: ReactNode;
  advertencia?: string; // texto secundario en rojo (ej. "no se puede revertir")
  textoConfirmar?: string;
  textoCancelar?: string;
  peligro?: boolean; // botón de confirmar en rojo y foco inicial en "Cancelar"
  onConfirmar: () => void;
  onCancelar: () => void;
}

function ModalConfirmacion({
  abierto,
  titulo,
  mensaje,
  advertencia,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  peligro = false,
  onConfirmar,
  onCancelar,
}: Props) {
  // Escape cierra el modal
  useEffect(() => {
    if (!abierto) return;
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancelar();
    };
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [abierto, onCancelar]);

  if (!abierto) return null;

  return (
    <div className={styles.overlay} onClick={onCancelar}>
      <div
        className={styles.modal}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="modal-confirmacion-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-confirmacion-titulo" className={styles.titulo}>
          {titulo}
        </h2>

        {mensaje && <p className={styles.mensaje}>{mensaje}</p>}
        {advertencia && <p className={styles.advertencia}>{advertencia}</p>}

        <div className={styles.acciones}>
          <button className={styles.btnCancelar} onClick={onCancelar} autoFocus={peligro}>
            {textoCancelar}
          </button>
          <button
            className={peligro ? styles.btnPeligro : styles.btnConfirmar}
            onClick={onConfirmar}
            autoFocus={!peligro}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalConfirmacion;