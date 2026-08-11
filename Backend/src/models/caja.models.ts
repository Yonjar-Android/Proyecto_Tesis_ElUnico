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
  return rows[0] || null;
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

export async function obtenerResumenCierreModel(idSesion: number) {
  const [sesion]: any = await pool.query(
    `SELECT * FROM sesiones_caja WHERE id_sesion = ?`,
    [idSesion]
  );
  const [egresos]: any = await pool.query(
    `SELECT * FROM egresos_caja WHERE id_sesion = ?`,
    [idSesion]
  );
  return { sesion: sesion[0] || null, egresos };
}