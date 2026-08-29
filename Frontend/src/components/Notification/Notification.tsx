import { useEffect } from "react";
import styles from "./Notificacion.module.css";

export type TipoNotificacion = "exito" | "error";

interface Props {
  mensaje: string;
  tipo: TipoNotificacion;
  onCerrar: () => void;
  duracion?: number; // ms, por defecto 4000
}

export default function Notificacion({ mensaje, tipo, onCerrar, duracion = 4000 }: Props) {
  useEffect(() => {
    const timer = setTimeout(onCerrar, duracion);
    return () => clearTimeout(timer);
  }, [duracion, onCerrar]);

  return (
    <div className={`${styles.toast} ${styles[tipo]}`} role="alert">
      <span>{mensaje}</span>
      <button className={styles.cerrar} onClick={onCerrar} aria-label="Cerrar">
        ×
      </button>
    </div>
  );
}