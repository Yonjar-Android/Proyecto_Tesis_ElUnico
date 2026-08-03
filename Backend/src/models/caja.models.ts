import { pool } from "../config/database.js";

export async function obtenerSesionActiva() {
  const [rows]: any = await pool.query(
    "SELECT * FROM caja_sesiones WHERE estado = 'Abierta' ORDER BY fecha_apertura DESC LIMIT 1"
  );
  return rows[0] ?? null;
}

export async function crearSesionCaja(
  montoAperturaCordobas: number,
  tasaCambio: number,
  observaciones: string
) {
  const [result]: any = await pool.query(
    `INSERT INTO caja_sesiones
      (fecha_apertura, monto_apertura_cordobas, tasa_cambio, observaciones_apertura, estado)
      VALUES (?, ?, ?, ?, 'Abierta')`,
    [new Date(), montoAperturaCordobas, tasaCambio, observaciones]
  );

  return result.insertId;
}

export async function obtenerEgresosPorSesion(idSesion: number) {
  const [rows]: any = await pool.query(
    "SELECT * FROM caja_egresos WHERE id_sesion = ? ORDER BY fecha_registro DESC",
    [idSesion]
  );
  return rows;
}

export async function crearEgresoCaja(
  idSesion: number,
  tipoEgreso: string,
  metodoPago: string,
  concepto: string,
  montoCordobas: number,
  observaciones: string
) {
  const [result]: any = await pool.query(
    `INSERT INTO caja_egresos
      (id_sesion, tipo_egreso, concepto, metodo_pago, monto_cordobas, observaciones, fecha_registro)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      idSesion,
      tipoEgreso,
      concepto,
      metodoPago,
      montoCordobas,
      observaciones,
      new Date(),
    ]
  );

  return result.insertId;
}

export async function eliminarEgresoCaja(idEgreso: number) {
  const [result]: any = await pool.query(
    "DELETE FROM caja_egresos WHERE id_egreso = ?",
    [idEgreso]
  );
  return result.affectedRows;
}

export async function obtenerIngresosDelDia() {
  const [rows]: any = await pool.query(
    "SELECT COALESCE(SUM(Total), 0) AS ingresos FROM ventas WHERE DATE(Fecha) = CURDATE()"
  );
  return rows[0]?.ingresos ?? 0;
}

export async function obtenerTotalEgresosPorSesion(idSesion: number) {
  const [rows]: any = await pool.query(
    "SELECT COALESCE(SUM(monto_cordobas), 0) AS totalEgresos FROM caja_egresos WHERE id_sesion = ?",
    [idSesion]
  );
  return rows[0]?.totalEgresos ?? 0;
}

export async function obtenerResumenCierreCaja(idSesion: number) {
  const [sesionRows]: any = await pool.query(
    "SELECT monto_apertura_cordobas, tasa_cambio, fecha_apertura, observaciones_apertura FROM caja_sesiones WHERE id_sesion = ?",
    [idSesion]
  );

  const sesion = sesionRows[0];
  if (!sesion) {
    return null;
  }

  const ingresosDia = await obtenerIngresosDelDia();
  const totalEgresos = await obtenerTotalEgresosPorSesion(idSesion);
  const efectivoEsperado = sesion.monto_apertura_cordobas + ingresosDia - totalEgresos;

  return {
    montoApertura: sesion.monto_apertura_cordobas,
    tasaCambio: sesion.tasa_cambio,
    fechaApertura: sesion.fecha_apertura,
    observacionesApertura: sesion.observaciones_apertura,
    ingresosDia,
    totalEgresos,
    efectivoEsperado,
  };
}

export async function cerrarSesionCaja(
  idSesion: number
) {
  const [result]: any = await pool.query(
    "UPDATE caja_sesiones SET estado = 'Cerrada', fecha_cierre = ? WHERE id_sesion = ? AND estado = 'Abierta'",
    [new Date(), idSesion]
  );
  return result.affectedRows;
}
