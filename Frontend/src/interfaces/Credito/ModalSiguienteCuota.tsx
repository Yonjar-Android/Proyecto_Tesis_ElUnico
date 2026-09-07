import { useEffect, useState } from "react";
import "../Productos/ModalesSeleccion/ModalSeleccion.css";
import styles from "./ModalSiguienteCuota.module.css";
import { obtenerSiguienteCuota } from "../../services/cuota.service";
import type { FacturaCreditoPendiente, CuotaInfo } from "../../models/Credito";

function formatearMoneda(valor: number) {
  return valor.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function diasEntre(fechaISO: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(fechaISO);
  fecha.setHours(0, 0, 0, 0);
  return Math.round((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

interface Props {
  abierto: boolean;
  factura: FacturaCreditoPendiente;
  onClose: () => void;
  onAbonar: () => void;
}

function ModalSiguienteCuota({ abierto, factura, onClose, onAbonar }: Props) {
  const [cuota, setCuota] = useState<CuotaInfo | null>(null);
  const [cargando, setCargando] = useState(true);

  const buscar = async () => {
    try {
      setCargando(true);

      const response: CuotaInfo | null = await obtenerSiguienteCuota(factura.id);

      setCuota(response);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!abierto) return;
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, factura.id]);

  if (!abierto) return null;

  const dias = cuota ? diasEntre(cuota.fecha_vencimiento) : 0;
  const vencida = dias < 0;

  return (
    <div className="modal-overlay">
      <div className="modal modal-cliente">
        <div className="modal-header">
          <h2>Siguiente Cuota — {factura.numero_factura}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {cargando ? (
            <p className={styles.estadoVacio}>Cargando cuota...</p>
          ) : !cuota ? (
            <p className={styles.estadoVacio}>No hay más cuotas pendientes.</p>
          ) : (
            <>
              <div className={styles.card}>
                <div className={styles.fila}>
                  <span>Cuota</span>
                  <strong>#{cuota.numero_cuota}</strong>
                </div>
                <div className={styles.fila}>
                  <span>Monto total de la cuota</span>
                  <strong>C${formatearMoneda(cuota.monto_a_pagar)}</strong>
                </div>
                <div className={styles.fila}>
                  <span>Ya abonado</span>
                  <strong>C${formatearMoneda(cuota.monto_pagado)}</strong>
                </div>
                <div className={`${styles.fila} ${styles.filaDestacada}`}>
                  <span>Saldo de esta cuota</span>
                  <strong>C${formatearMoneda(cuota.saldo_cuota)}</strong>
                </div>
                <div className={styles.fila}>
                  <span>Fecha de vencimiento</span>
                  <strong>{cuota.fecha_vencimiento}</strong>
                </div>
              </div>

              {vencida ? (
                <div className={`${styles.avisoEstado} ${styles.avisoVencida}`}>
                  <span>⚠️</span>
                  <span>Vencida hace {Math.abs(dias)} día(s)</span>
                </div>
              ) : dias === 0 ? (
                <div className={`${styles.avisoEstado} ${styles.avisoVencida}`}>
                  <span>⏰</span>
                  <span>Vence hoy</span>
                </div>
              ) : (
                <div className={styles.avisoEstado}>
                  <span>✅</span>
                  <span>Vence en {dias} día(s)</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onClose}>Cerrar</button>
          {cuota && (
            <button className="btn-guardar" onClick={onAbonar}>
              Abonar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModalSiguienteCuota;