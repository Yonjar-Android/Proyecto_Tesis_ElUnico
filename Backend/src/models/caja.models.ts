import { pool } from "../config/database.js";

export async function crearSesionCaja(
  idUsuario: number,
  montoAperturaCordobas: number,
  montoAperturaDolares: number, // <-- NUEVO PARÁMETRO
  tasaCambio: number,
  observaciones: string
) {
  const [result]: any = await pool.query(
    `INSERT INTO sesiones_caja (
       id_usuario, 
       fecha_apertura, 
       monto_apertura_cordobas, 
       monto_apertura_dolares, 
       tasa_cambio, 
       observaciones, 
       estado
     )
     VALUES (?, NOW(), ?, ?, ?, ?, 'Abierta')`,
    [
      idUsuario,
      Number(montoAperturaCordobas) || 0,
      Number(montoAperturaDolares) || 0,
      Number(tasaCambio),
      observaciones || null,
    ]
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

export async function calcularIngresosSesion(fechaInicio: Date | string, fechaFin?: Date | string | null) {
  const fechaFinVentas = fechaFin ? "AND Fecha <= ?" : "";
  const paramsVentas: any[] = [fechaInicio];
  if (fechaFin) paramsVentas.push(fechaFin);

  const [desglose]: any = await pool.query(
    `SELECT
       COALESCE(SUM(CASE WHEN Tipo_Pago = 'Contado' THEN CASE WHEN RecibidoCordobas > VueltoCordobas THEN RecibidoCordobas - VueltoCordobas ELSE 0 END ELSE 0 END), 0) AS contado_cordobas,
       COALESCE(SUM(CASE WHEN Tipo_Pago = 'Contado' THEN CASE WHEN VueltoCordobas > RecibidoCordobas THEN VueltoCordobas - RecibidoCordobas ELSE 0 END ELSE 0 END), 0) AS vueltos_cordobas,
       COALESCE(SUM(CASE WHEN Tipo_Pago = 'Contado' THEN RecibidoDolares ELSE 0 END), 0) AS contado_dolares,
       COALESCE(SUM(CASE WHEN Tipo_Pago = 'Transferencia' THEN Total ELSE 0 END), 0) AS transferencias
     FROM ventas 
     WHERE Fecha >= ? ${fechaFinVentas} AND Estado <> 'Anulada'`,
    paramsVentas
  );

  const fechaFinAbonos = fechaFin ? "AND fecha_abono <= ?" : "";
  const paramsAbonos: any[] = [fechaInicio];
  if (fechaFin) paramsAbonos.push(fechaFin);

  const [abonos]: any = await pool.query(
    `SELECT 
       COALESCE(SUM(CASE WHEN LOWER(metodo_pago) = 'contado' THEN monto_abonado ELSE 0 END), 0) AS abonos_efectivo,
       COALESCE(SUM(CASE WHEN LOWER(metodo_pago) = 'transferencia' THEN monto_abonado ELSE 0 END), 0) AS abonos_transferencia
     FROM abono
     WHERE fecha_abono >= ? ${fechaFinAbonos}`,
    paramsAbonos
  );

  const ingresosCordobas = (Number(desglose[0]?.contado_cordobas) || 0) + (Number(abonos[0]?.abonos_efectivo) || 0);
  const vueltosCordobas = Number(desglose[0]?.vueltos_cordobas) || 0;
  const ingresosDolares = Number(desglose[0]?.contado_dolares) || 0;
  const transferencias = (Number(desglose[0]?.transferencias) || 0) + (Number(abonos[0]?.abonos_transferencia) || 0);

  return { ingresosCordobas, vueltosCordobas, ingresosDolares, transferencias };
}

export async function buscarSesionActiva(idUsuario?: number) {
  await normalizarSesionesAbiertas();
  const [rows]: any = await pool.query(
    `SELECT sc.*, COALESCE(u.Nombre_Usuario, 'Desconocido') AS usuario_apertura_nombre
     FROM sesiones_caja sc
     LEFT JOIN usuarios u ON sc.id_usuario = u.id
     WHERE sc.estado = 'Abierta'
     ORDER BY sc.id_sesion DESC LIMIT 1`
  );
  const sesion = rows[0] || null;

  if (!sesion) {
    return {
      sesion: null,
      egresos: [],
      ingresosDia: 0,
      vueltosCordobas: 0,
      ingresosDolares: 0,
      transferencias: 0,
      totalEgresos: 0,
    };
  }

  const [egresos]: any = await pool.query(
    `SELECT * FROM egresos_caja WHERE id_sesion = ? ORDER BY fecha_registro DESC`,
    [sesion.id_sesion]
  );

  const { ingresosCordobas, vueltosCordobas, ingresosDolares, transferencias } = await calcularIngresosSesion(sesion.fecha_apertura);

  return {
    sesion,
    egresos,
    ingresosDia: ingresosCordobas,
    vueltosCordobas,
    ingresosDolares,
    transferencias,
    totalEgresos: Number(sesion.total_egresos_sistema) || 0,
  };
}

export async function crearEgresoCaja(
  idSesion: number,
  tipoEgreso: string,
  metodoPago: string,
  concepto: string,
  montoCordobas: number,
  montoDolares: number,
  observaciones: string
) {
  const [result]: any = await pool.query(
    `INSERT INTO egresos_caja (id_sesion, tipo_egreso, metodo_pago, concepto, monto_cordobas, monto_dolares, observaciones)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [idSesion, tipoEgreso, metodoPago, concepto, montoCordobas, montoDolares, observaciones]
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

export async function obtenerResumenCierreModel(idUsuario?: number) {
  await normalizarSesionesAbiertas();
  const [rows]: any = await pool.query(
    `SELECT sc.*, COALESCE(u.Nombre_Usuario, 'Desconocido') AS usuario_apertura_nombre
     FROM sesiones_caja sc
     LEFT JOIN usuarios u ON sc.id_usuario = u.id
     WHERE sc.estado = 'Abierta'
     ORDER BY sc.id_sesion DESC LIMIT 1`
  );
  const sesion = rows[0] || null;

  if (!sesion) {
    return {
      sesion: null,
      montoApertura: 0,
      montoAperturaCordobas: 0,
      montoAperturaDolares: 0,
      ingresosDia: 0,
      ingresosCordobas: 0,
      vueltosCordobas: 0,
      ingresosDolares: 0,
      transferencias: 0,
      totalEgresos: 0,
      totalEgresosDolares: 0,
      efectivoEsperado: 0,
      efectivoEsperadoCordobas: 0,
      efectivoEsperadoDolares: 0,
    };
  }

  const [egresosRows]: any = await pool.query(
    `SELECT 
       COALESCE(SUM(CASE WHEN metodo_pago = 'Efectivo' THEN monto_cordobas ELSE 0 END), 0) AS total_cordobas,
       COALESCE(SUM(CASE WHEN metodo_pago = 'Efectivo' THEN monto_dolares ELSE 0 END), 0) AS total_dolares
     FROM egresos_caja WHERE id_sesion = ?`,
    [sesion.id_sesion]
  );
  const totalEgresosCordobas = Number(egresosRows[0]?.total_cordobas) || 0;
  const totalEgresosDolares = Number(egresosRows[0]?.total_dolares) || 0;

  const { ingresosCordobas, vueltosCordobas, ingresosDolares, transferencias } = await calcularIngresosSesion(sesion.fecha_apertura);

  const montoAperturaCordobas = Number(sesion.monto_apertura_cordobas) || 0;
  const montoAperturaDolares = Number(sesion.monto_apertura_dolares) || 0;
  const tasaCambio = Number(sesion.tasa_cambio) || 36.60;

  // Efectivo esperado COMBINADO (equivalente en córdobas). Solo dinero en efectivo
  // (C$ y USD); transferencias se excluyen expresamente. Se sigue usando en el
  // frontend para calcular la "diferencia" del arqueo, así que no se toca.
  const totalAperturaEquivalente = montoAperturaCordobas + (montoAperturaDolares * tasaCambio);
  const totalIngresosEfectivoEquivalente = (ingresosCordobas - vueltosCordobas) + (ingresosDolares * tasaCambio);
  const totalEgresosEfectivoEquivalente = totalEgresosCordobas + (totalEgresosDolares * tasaCambio);

  const efectivoEsperado = totalAperturaEquivalente + totalIngresosEfectivoEquivalente - totalEgresosEfectivoEquivalente;

  // Efectivo esperado PURO por moneda (sin conversión), para las tarjetas del
  // frontend que muestran córdobas y dólares por separado.
  const efectivoEsperadoCordobas = montoAperturaCordobas + ingresosCordobas - vueltosCordobas - totalEgresosCordobas;
  const efectivoEsperadoDolares = montoAperturaDolares + ingresosDolares - totalEgresosDolares;

  return {
    sesion,
    montoApertura: totalAperturaEquivalente,
    montoAperturaCordobas,
    montoAperturaDolares,
    tasaCambio,
    ingresosDia: ingresosCordobas,
    ingresosCordobas,
    vueltosCordobas,
    ingresosDolares,
    transferencias,
    totalEgresos: totalEgresosCordobas,
    totalEgresosDolares,
    efectivoEsperado,
    efectivoEsperadoCordobas,
    efectivoEsperadoDolares,
  };
}

export async function actualizarEgresoCajaModel(
  idEgreso: number,
  tipoEgreso: string,
  metodoPago: string,
  concepto: string,
  montoCordobas: number,
  montoDolares: number,
  observaciones: string
) {
  const [result]: any = await pool.query(
    `UPDATE egresos_caja SET tipo_egreso = ?, metodo_pago = ?, concepto = ?, monto_cordobas = ?, monto_dolares = ?, observaciones = ? WHERE id_egreso = ?`,
    [tipoEgreso, metodoPago, concepto, montoCordobas, montoDolares, observaciones, idEgreso]
  );
  return result.affectedRows;
}

export async function listarHistorialCajasModel() {
  const [rows]: any = await pool.query(
    `SELECT 
       sc.id_sesion,
       sc.id_usuario,
       COALESCE(u.Nombre_Usuario, 'Desconocido') AS usuario_nombre,
       sc.fecha_apertura,
       sc.fecha_cierre,
       sc.monto_apertura_cordobas,
       sc.monto_apertura_dolares,
       sc.tasa_cambio,
       sc.total_ingresos_sistema,
       sc.total_egresos_sistema,
       sc.total_neto_sistema,
       sc.total_efectivo_contado,
       sc.total_tarjeta_transferencia,
       sc.diferencia,
       sc.observaciones,
       sc.estado
     FROM sesiones_caja sc
     LEFT JOIN usuarios u ON sc.id_usuario = u.id
     ORDER BY sc.id_sesion DESC`
  );
  return rows;
}

export async function normalizarSesionesAbiertas(idUsuario?: number) {
  // 1. Cerrar automáticamente cualquier sesión abierta que ya supere las 24 horas
  await pool.query(
    `UPDATE sesiones_caja
     SET estado = 'Cerrada',
         fecha_cierre = COALESCE(fecha_cierre, DATE_ADD(fecha_apertura, INTERVAL 24 HOUR)),
         observaciones = CONCAT(COALESCE(observaciones, ''), ' [Cierre automático del sistema: superó las 24 horas de apertura.]')
     WHERE estado = 'Abierta'
       AND fecha_apertura <= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
  );

  // 2. Resolver bucles o aperturas duplicadas: solo puede haber una única caja abierta global en el negocio
  await pool.query(
    `UPDATE sesiones_caja sc
     JOIN (
       SELECT MAX(id_sesion) AS id_sesion_activa
       FROM sesiones_caja
       WHERE estado = 'Abierta'
     ) actuales
     SET sc.estado = 'Cerrada',
         sc.fecha_cierre = COALESCE(sc.fecha_cierre, NOW()),
         sc.observaciones = CONCAT(COALESCE(sc.observaciones, ''), ' [Cierre automático por apertura duplicada.]')
     WHERE sc.estado = 'Abierta'
       AND sc.id_sesion < actuales.id_sesion_activa`
  );
}

export async function obtenerDetalleCierrePorSesionModel(idSesion: number) {
  const [rows]: any = await pool.query(
    `SELECT sc.*, COALESCE(u.Nombre_Usuario, 'Desconocido') AS usuario_nombre
     FROM sesiones_caja sc
     LEFT JOIN usuarios u ON sc.id_usuario = u.id
     WHERE sc.id_sesion = ? LIMIT 1`,
    [idSesion]
  );
  const sesion = rows[0] || null;
  if (!sesion) return null;

  const fechaFin = sesion.fecha_cierre || new Date();

  const [egresos]: any = await pool.query(
    `SELECT * FROM egresos_caja WHERE id_sesion = ? ORDER BY fecha_registro ASC`,
    [idSesion]
  );

  const [egresosRows]: any = await pool.query(
    `SELECT 
       COALESCE(SUM(CASE WHEN metodo_pago = 'Efectivo' THEN monto_cordobas ELSE 0 END), 0) AS total_cordobas,
       COALESCE(SUM(CASE WHEN metodo_pago = 'Efectivo' THEN monto_dolares ELSE 0 END), 0) AS total_dolares
     FROM egresos_caja WHERE id_sesion = ?`,
    [idSesion]
  );
  const totalEgresosCordobas = Number(egresosRows[0]?.total_cordobas) || 0;
  const totalEgresosDolares = Number(egresosRows[0]?.total_dolares) || 0;

  const { ingresosCordobas, vueltosCordobas, ingresosDolares, transferencias } = await calcularIngresosSesion(sesion.fecha_apertura, fechaFin);

  const montoAperturaCordobas = Number(sesion.monto_apertura_cordobas) || 0;
  const montoAperturaDolares = Number(sesion.monto_apertura_dolares) || 0;
  const tasaCambio = Number(sesion.tasa_cambio) || 36.60;

  // Efectivo esperado COMBINADO: solo dinero físico (C$ y USD). Transferencias quedan fuera, a propósito.
  const totalAperturaEquivalente = montoAperturaCordobas + montoAperturaDolares * tasaCambio;
  const totalIngresosEquivalente = (ingresosCordobas - vueltosCordobas) + ingresosDolares * tasaCambio;
  const totalEgresosEquivalente = totalEgresosCordobas + totalEgresosDolares * tasaCambio;
  const efectivoEsperado = totalAperturaEquivalente + totalIngresosEquivalente - totalEgresosEquivalente;

  // Efectivo esperado PURO por moneda (mismo criterio que obtenerResumenCierreModel).
  const efectivoEsperadoCordobas = montoAperturaCordobas + ingresosCordobas - vueltosCordobas - totalEgresosCordobas;
  const efectivoEsperadoDolares = montoAperturaDolares + ingresosDolares - totalEgresosDolares;

  return {
    sesion,
    egresos,
    montoAperturaCordobas,
    montoAperturaDolares,
    tasaCambio,
    ingresosCordobas,
    vueltosCordobas,
    ingresosDolares,
    transferencias,
    totalEgresosCordobas,
    totalEgresosDolares,
    efectivoEsperado,
    efectivoEsperadoCordobas,
    efectivoEsperadoDolares,
    totalEfectivoContado: Number(sesion.total_efectivo_contado) || 0,
    totalTarjetaTransferencia: Number(sesion.total_tarjeta_transferencia) || 0,
    diferencia: Number(sesion.diferencia) || 0,
  };
}