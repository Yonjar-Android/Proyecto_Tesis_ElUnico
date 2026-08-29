import { createPortal } from "react-dom";
import ReciboVenta, { type DatosRecibo } from "./Recibo/Recibo_Venta";
import styles from "./ModalConfirmarImpresion.module.css";

interface Props {
  abierto: boolean;
  datos: DatosRecibo | null;
  onClose: () => void;
}

export default function ModalConfirmarImpresion({ abierto, datos, onClose }: Props) {
  if (!abierto || !datos) return null;

  const handleImprimir = () => {
    window.print();
  };

  return (
    <>
      <div className={styles.overlay}>
        <div className={styles.caja}>
          <h3>Venta registrada</h3>
          <p>¿Deseas imprimir el recibo de esta venta?</p>

          <div className={styles.acciones}>
            <button className={styles.botonSecundario} onClick={onClose}>
              Cerrar
            </button>
            <button className={styles.botonPrimario} onClick={handleImprimir}>
              Imprimir recibo
            </button>
          </div>
        </div>
      </div>

      {/* Portal directo a <body>: al imprimir, ocultamos todo lo que NO sea esto */}
      {createPortal(
        <div className={styles.reciboParaImprimir}>
          <ReciboVenta datos={datos} />
        </div>,
        document.body
      )}
    </>
  );
}