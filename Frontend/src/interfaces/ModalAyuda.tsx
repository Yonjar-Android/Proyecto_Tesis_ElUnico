import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import styles from "./ModalAyuda.module.css";

export interface ImagenAyuda {
  src: string;
  titulo?: string;
  descripcion?: string;
}

interface Props {
  abierto: boolean;
  titulo?: string;
  imagenes: ImagenAyuda[];
  onClose: () => void;
}

export default function ModalAyuda({ abierto, titulo, imagenes, onClose }: Props) {
  const [indice, setIndice] = useState(0);

  // Reinicia a la primera imagen cada vez que se abre el modal.
  useEffect(() => {
    if (abierto) setIndice(0);
  }, [abierto]);

  if (!abierto || imagenes.length === 0) return null;

  const actual = imagenes[indice];
  const hayVarias = imagenes.length > 1;

  const anterior = () => setIndice((i) => (i === 0 ? imagenes.length - 1 : i - 1));
  const siguiente = () => setIndice((i) => (i === imagenes.length - 1 ? 0 : i + 1));

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.caja} onClick={(e) => e.stopPropagation()}>
        <div className={styles.encabezado}>
          <h3>{titulo ?? "Ayuda"}</h3>
          <button className={styles.cerrarX} onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className={styles.cuerpoImagen}>
          {hayVarias && (
            <button className={styles.flecha} onClick={anterior} aria-label="Anterior">
              <ChevronLeft size={22} />
            </button>
          )}

          <img className={styles.imagen} src={actual.src} alt={actual.titulo ?? "Ayuda"} />

          {hayVarias && (
            <button className={styles.flecha} onClick={siguiente} aria-label="Siguiente">
              <ChevronRight size={22} />
            </button>
          )}
        </div>

        {(actual.titulo || actual.descripcion) && (
          <div className={styles.textoImagen}>
            {actual.titulo && <p className={styles.tituloImagen}>{actual.titulo}</p>}
            {actual.descripcion && <p className={styles.descripcionImagen}>{actual.descripcion}</p>}
          </div>
        )}

        {hayVarias && (
          <div className={styles.indicador}>
            {indice + 1} / {imagenes.length}
          </div>
        )}
      </div>
    </div>
  );
}