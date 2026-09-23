import {
  cerrarSesionCaja,
  crearSesionCaja,
  buscarSesionActiva,
  crearEgresoCaja,
  eliminarEgresoCajaModel,
  obtenerResumenCierreModel,
  actualizarEgresoCajaModel,
  listarHistorialCajasModel,
  normalizarSesionesAbiertas,
  obtenerDetalleCierrePorSesionModel,
} from "../models/caja.models.js";

export async function abrirCaja(
  idUsuario: number,
  montoAperturaCordobas: number,
  montoAperturaDolares: number, // <-- NUEVO
  tasaCambio: number,
  observaciones: string
) {
  await normalizarSesionesAbiertas(idUsuario);
  const [sesiones]: any = await (await import("../config/database.js")).pool.query(
    `SELECT id_sesion FROM sesiones_caja WHERE id_usuario = ? AND estado = 'Abierta' LIMIT 1`,
    [idUsuario]
  );
  if (sesiones.length > 0) {
    throw new Error(`Ya existe una caja abierta (sesión #${sesiones[0].id_sesion}). Cierre esa sesión antes de abrir otra.`);
  }

  const totalEnCordobas =
    (Number(montoAperturaCordobas) || 0) +
    (Number(montoAperturaDolares) || 0) * tasaCambio;

  // Valida que el TOTAL contado (en C$ o USD) sea mayor a 0
  if (totalEnCordobas <= 0 || isNaN(totalEnCordobas)) {
    throw new Error("El monto de apertura debe ser mayor a 0.");
  }
  if (tasaCambio <= 0 || isNaN(tasaCambio)) {
    throw new Error("La tasa de cambio debe ser válida.");
  }

  return await crearSesionCaja(
    idUsuario,
    montoAperturaCordobas || 0,
    montoAperturaDolares || 0, // <-- Pasa los dólares al modelo
    tasaCambio,
    observaciones
  );
}

export async function obtenerSesionActiva(idUsuario: number) {
  if (!idUsuario || isNaN(idUsuario)) {
    throw new Error("Usuario inválido.");
  }
  return await buscarSesionActiva(idUsuario);
}

export async function registrarEgresoCaja(
  idSesion: number,
  tipoEgreso: string,
  metodoPago: string,
  concepto: string,
  montoCordobas: number,
  montoDolares: number,
  observaciones: string
) {
  if (!idSesion || isNaN(idSesion)) {
    throw new Error("Sesión de caja inválida.");
  }
  if (!concepto || concepto.trim() === "") {
    throw new Error("El concepto del egreso es obligatorio.");
  }
  if (montoCordobas < 0 || montoDolares < 0 || isNaN(montoCordobas) || isNaN(montoDolares)) {
    throw new Error("Los montos no pueden ser negativos.");
  }
  if (montoCordobas === 0 && montoDolares === 0) {
    throw new Error("Debes ingresar un monto en córdobas o dólares mayor a 0.");
  }

  const { pool } = await import("../config/database.js");
  const [sesiones]: any = await pool.query(
    `SELECT id_sesion, id_usuario, monto_apertura_cordobas, monto_apertura_dolares, tasa_cambio, fecha_apertura
     FROM sesiones_caja WHERE id_sesion = ? AND estado = 'Abierta' LIMIT 1`,
    [idSesion]
  );
  const sesion = sesiones[0];
  if (!sesion) throw new Error("La sesión de caja no existe o está cerrada.");

  if (metodoPago === "Efectivo") {
    const [desglose]: any = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN Tipo_Pago = 'Contado' THEN RecibidoCordobas ELSE 0 END), 0) AS contado_cordobas,
         COALESCE(SUM(CASE WHEN Tipo_Pago = 'Contado' THEN RecibidoDolares ELSE 0 END), 0) AS contado_dolares
       FROM ventas 
       WHERE Fecha >= ? AND (Id_usuario = ? OR ? = 0)`,
      [sesion.fecha_apertura, sesion.id_usuario, sesion.id_usuario]
    );

    const [abonos]: any = await pool.query(
      `SELECT COALESCE(SUM(CASE WHEN LOWER(metodo_pago) = 'contado' THEN monto_abonado ELSE 0 END), 0) AS total_abonos
       FROM abono
       WHERE fecha_abono >= ?`,
      [sesion.fecha_apertura]
    );

    const [egresosPrevios]: any = await pool.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN metodo_pago = 'Efectivo' THEN monto_cordobas ELSE 0 END), 0) AS total_cordobas,
         COALESCE(SUM(CASE WHEN metodo_pago = 'Efectivo' THEN monto_dolares ELSE 0 END), 0) AS total_dolares
       FROM egresos_caja WHERE id_sesion = ?`,
      [idSesion]
    );

    const ingresosCordobas = (Number(desglose[0]?.contado_cordobas) || 0) + (Number(abonos[0]?.total_abonos) || 0);
    const ingresosDolares = Number(desglose[0]?.contado_dolares) || 0;

    const disponibleCordobas = Number(sesion.monto_apertura_cordobas || 0) + ingresosCordobas - Number(egresosPrevios[0]?.total_cordobas || 0);
    const disponibleDolares = Number(sesion.monto_apertura_dolares || 0) + ingresosDolares - Number(egresosPrevios[0]?.total_dolares || 0);

    if (montoCordobas > 0 && montoCordobas > disponibleCordobas + 0.01) {
      throw new Error(`Efectivo insuficiente en córdobas. Saldo disponible en caja: C$${Math.max(0, disponibleCordobas).toFixed(2)}.`);
    }

    if (montoDolares > 0 && montoDolares > disponibleDolares + 0.01) {
      throw new Error(`Efectivo insuficiente en dólares. Saldo disponible en caja: $${Math.max(0, disponibleDolares).toFixed(2)} USD.`);
    }
  }

  return await crearEgresoCaja(idSesion, tipoEgreso, metodoPago, concepto, montoCordobas, montoDolares, observaciones);
}

export async function eliminarEgresoCaja(idEgreso: number) {
  if (!idEgreso || isNaN(idEgreso)) {
    throw new Error("Egreso inválido.");
  }
  const filas = await eliminarEgresoCajaModel(idEgreso);
  if (filas === 0) {
    throw new Error("No se encontró el egreso a eliminar.");
  }
  return true;
}

export async function cerrarCaja(
  idSesion: number,
  totalEfectivoContado: number,
  totalTarjetaTransferencia: number,
  diferencia: number,
  observaciones: string
) {
  if (!idSesion || isNaN(idSesion)) {
    throw new Error("Sesión de caja inválida.");
  }
  if (totalEfectivoContado < 0 || isNaN(totalEfectivoContado)) {
    throw new Error("El monto contado debe ser válido.");
  }
  if (totalTarjetaTransferencia < 0 || isNaN(totalTarjetaTransferencia)) {
    throw new Error("El monto de tarjeta/transferencia debe ser válido.");
  }

  const filas = await cerrarSesionCaja(
    idSesion,
    totalEfectivoContado,
    totalTarjetaTransferencia,
    diferencia,
    observaciones
  );

  if (filas === 0) {
    throw new Error("No se pudo cerrar la sesión de caja. Ya está cerrada o no existe.");
  }

  return { idSesion, totalEfectivoContado, totalTarjetaTransferencia, diferencia, observaciones };
}

export async function obtenerResumenCierreCaja(idUsuario: number) {
  if (!idUsuario || isNaN(idUsuario)) {
    throw new Error("Usuario inválido.");
  }
  return await obtenerResumenCierreModel(idUsuario);
}
export async function actualizarEgresoCaja(
  idEgreso: number,
  tipoEgreso: string,
  metodoPago: string,
  concepto: string,
  montoCordobas: number,
  montoDolares: number,
  observaciones: string
) {
  if (!idEgreso || isNaN(idEgreso)) {
    throw new Error("Egreso inválido.");
  }
  if (!concepto || concepto.trim() === "") {
    throw new Error("El concepto del egreso es obligatorio.");
  }
  if (montoCordobas < 0 || montoDolares < 0 || isNaN(montoCordobas) || isNaN(montoDolares)) {
    throw new Error("Los montos no pueden ser negativos.");
  }
  if (montoCordobas === 0 && montoDolares === 0) {
    throw new Error("Debes ingresar un monto en córdobas o dólares mayor a 0.");
  }

  const { pool } = await import("../config/database.js");
  const [datos]: any = await pool.query(
    `SELECT e.id_sesion, s.id_usuario, s.monto_apertura_cordobas, s.monto_apertura_dolares, s.tasa_cambio, s.fecha_apertura
     FROM egresos_caja e JOIN sesiones_caja s ON s.id_sesion = e.id_sesion
     WHERE e.id_egreso = ? AND s.estado = 'Abierta' LIMIT 1`,
    [idEgreso]
  );
  const egreso = datos[0];
  if (!egreso) throw new Error("El egreso no existe o la sesión está cerrada.");

  if (metodoPago === "Efectivo") {
    const [desglose]: any = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN Tipo_Pago = 'Contado' THEN RecibidoCordobas ELSE 0 END), 0) AS contado_cordobas,
         COALESCE(SUM(CASE WHEN Tipo_Pago = 'Contado' THEN RecibidoDolares ELSE 0 END), 0) AS contado_dolares
       FROM ventas 
       WHERE Fecha >= ? AND (Id_usuario = ? OR ? = 0)`,
      [egreso.fecha_apertura, egreso.id_usuario, egreso.id_usuario]
    );

    const [abonos]: any = await pool.query(
      `SELECT COALESCE(SUM(CASE WHEN LOWER(metodo_pago) = 'contado' THEN monto_abonado ELSE 0 END), 0) AS total_abonos
       FROM abono
       WHERE fecha_abono >= ?`,
      [egreso.fecha_apertura]
    );

    const [totales]: any = await pool.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN metodo_pago = 'Efectivo' THEN monto_cordobas ELSE 0 END), 0) AS total_cordobas,
         COALESCE(SUM(CASE WHEN metodo_pago = 'Efectivo' THEN monto_dolares ELSE 0 END), 0) AS total_dolares
       FROM egresos_caja
       WHERE id_sesion = ? AND id_egreso <> ?`,
      [egreso.id_sesion, idEgreso]
    );

    const ingresosCordobas = (Number(desglose[0]?.contado_cordobas) || 0) + (Number(abonos[0]?.total_abonos) || 0);
    const ingresosDolares = Number(desglose[0]?.contado_dolares) || 0;

    const disponibleCordobas = Number(egreso.monto_apertura_cordobas || 0) + ingresosCordobas - Number(totales[0]?.total_cordobas || 0);
    const disponibleDolares = Number(egreso.monto_apertura_dolares || 0) + ingresosDolares - Number(totales[0]?.total_dolares || 0);

    if (montoCordobas > 0 && montoCordobas > disponibleCordobas + 0.01) {
      throw new Error(`Efectivo insuficiente en córdobas. Saldo disponible en caja: C$${Math.max(0, disponibleCordobas).toFixed(2)}.`);
    }

    if (montoDolares > 0 && montoDolares > disponibleDolares + 0.01) {
      throw new Error(`Efectivo insuficiente en dólares. Saldo disponible en caja: $${Math.max(0, disponibleDolares).toFixed(2)} USD.`);
    }
  }

  const filas = await actualizarEgresoCajaModel(idEgreso, tipoEgreso, metodoPago, concepto, montoCordobas, montoDolares, observaciones);
  if (filas === 0) {
    throw new Error("No se encontró el egreso a actualizar.");
  }
  return true;
}

export async function obtenerHistorialCajas() {
  await normalizarSesionesAbiertas();
  return await listarHistorialCajasModel();
}

export async function obtenerDetalleCierrePorSesion(idSesion: number) {
  if (!idSesion || isNaN(idSesion)) {
    throw new Error("Sesión de caja inválida.");
  }
  const detalle = await obtenerDetalleCierrePorSesionModel(idSesion);
  if (!detalle) {
    throw new Error("No se encontró la sesión de caja.");
  }
  return detalle;
}