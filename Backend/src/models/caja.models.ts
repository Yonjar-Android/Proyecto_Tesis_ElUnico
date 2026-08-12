import { pool } from "../config/database.js";

// Ajusta el import de tu conexión/pool según cómo lo tengas en este archivo
// import { pool } from "../config/database.js";

export async function crearSesionCaja(
  idUsuario: number,
  montoAperturaCordobas: number,
  tasaCambio: number,
  observaciones: string
) {
  const [result]: any = await pool.query(
    `INSERT INTO sesiones_caja (id_usuario, fecha_apertura, monto_apertura_cordobas, tasa_cambio, observaciones, estado)
     VALUES (?, NOW(), ?, ?, ?, 'Abierta')`,
    [idUsuario, montoAperturaCordobas, tasaCambio, observaciones]
  );
  return result.insertId;
}

export async function cerrarSesionCaja(
  idSesion: number,
  totalEfectivoContado: number,
  totalTarjetaTransferencia: number,
  diferencia: number,
  observaciones: string
) {
  const [result]: any = await pool.query(
    `UPDATE sesiones_caja SET
      fecha_cierre = NOW(),
      total_efectivo_contado = ?,
      total_tarjeta_transferencia = ?,
      diferencia = ?,
      observaciones = ?,
      estado = 'Cerrada'
     WHERE id_sesion = ? AND estado = 'Abierta'`,
    [totalEfectivoContado, totalTarjetaTransferencia, diferencia, observaciones, idSesion]
  );
  return result.affectedRows;
}

export async function buscarSesionActiva(idUsuario: number) {
  const [rows]: any = await pool.query(
    `SELECT * FROM sesiones_caja WHERE id_usuario = ? AND estado = 'Abierta' LIMIT 1`,
    [idUsuario]
  );
  const sesion = rows[0] || null;

  if (!sesion) {
    return { sesion: null, egresos: [], ingresosDia: 0 };
  }

  const [egresos]: any = await pool.query(
    `SELECT * FROM egresos_caja WHERE id_sesion = ? ORDER BY fecha_registro DESC`,
    [sesion.id_sesion]
  );

  const [ingresos]: any = await pool.query(
    `SELECT COALESCE(SUM(Total), 0) AS total FROM ventas WHERE Fecha >= ?`,
    [sesion.fecha_apertura]
  );

  return { sesion, egresos, ingresosDia: Number(ingresos[0].total) };
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
    `INSERT INTO egresos_caja (id_sesion, tipo_egreso, metodo_pago, concepto, monto_cordobas, observaciones)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [idSesion, tipoEgreso, metodoPago, concepto, montoCordobas, observaciones]
  );
  return result.insertId;
}

export async function eliminarEgresoCajaModel(idEgreso: number) {
  const [result]: any = await pool.query(
    `DELETE FROM egresos_caja WHERE id_egreso = ?`,
    [idEgreso]
  );
  return result.affectedRows;
}

export async function obtenerResumenCierreModel(idUsuario: number) {
  const [rows]: any = await pool.query(
    `SELECT * FROM sesiones_caja WHERE id_usuario = ? AND estado = 'Abierta' LIMIT 1`,
    [idUsuario]
  );
  const sesion = rows[0] || null;

  if (!sesion) {
    return {
      sesion: null,
      montoApertura: 0,
      ingresosDia: 0,
      totalEgresos: 0,
      efectivoEsperado: 0,
    };
  }

  const [egresosRows]: any = await pool.query(
    `SELECT COALESCE(SUM(monto_cordobas), 0) AS total FROM egresos_caja WHERE id_sesion = ?`,
    [sesion.id_sesion]
  );
  const totalEgresos = Number(egresosRows[0].total);

  const [ventasRows]: any = await pool.query(
    `SELECT COALESCE(SUM(Total), 0) AS total FROM ventas WHERE Fecha >= ?`,
    [sesion.fecha_apertura]
  );
  const ingresosDia = Number(ventasRows[0].total);

  const montoApertura = Number(sesion.monto_apertura_cordobas);
  const efectivoEsperado = montoApertura + ingresosDia - totalEgresos;

  return { sesion, montoApertura, ingresosDia, totalEgresos, efectivoEsperado };
}
  
export async function actualizarEgresoCajaModel(
  idEgreso: number,
  tipoEgreso: string,
  metodoPago: string,
  concepto: string,
  montoCordobas: number,
  observaciones: string
) {
  const [result]: any = await pool.query(
    `UPDATE egresos_caja SET tipo_egreso = ?, metodo_pago = ?, concepto = ?, monto_cordobas = ?, observaciones = ? WHERE id_egreso = ?`,
    [tipoEgreso, metodoPago, concepto, montoCordobas, observaciones, idEgreso]
  );
  return result.affectedRows;
}