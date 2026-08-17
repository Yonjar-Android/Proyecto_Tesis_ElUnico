import {
  cerrarSesionCaja,
  crearSesionCaja,
  buscarSesionActiva,
  crearEgresoCaja,
  eliminarEgresoCajaModel,
  obtenerResumenCierreModel,
  actualizarEgresoCajaModel
} from "../models/caja.models.js";

export async function abrirCaja(
  idUsuario: number,
  montoAperturaCordobas: number,
  tasaCambio: number,
  observaciones: string
) {
  if (montoAperturaCordobas <= 0 || isNaN(montoAperturaCordobas)) {
    throw new Error("El monto de apertura debe ser mayor a 0.");
  }
  if (tasaCambio <= 0 || isNaN(tasaCambio)) {
    throw new Error("La tasa de cambio debe ser válida.");
  }
  return await crearSesionCaja(idUsuario, montoAperturaCordobas, tasaCambio, observaciones);
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
  observaciones: string
) {
  if (!idSesion || isNaN(idSesion)) {
    throw new Error("Sesión de caja inválida.");
  }
  if (!concepto || concepto.trim() === "") {
    throw new Error("El concepto del egreso es obligatorio.");
  }
  if (montoCordobas <= 0 || isNaN(montoCordobas)) {
    throw new Error("El monto del egreso debe ser mayor a 0.");
  }
  return await crearEgresoCaja(idSesion, tipoEgreso, metodoPago, concepto, montoCordobas, observaciones);
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
  observaciones: string
) {
  if (!idEgreso || isNaN(idEgreso)) {
    throw new Error("Egreso inválido.");
  }
  if (!concepto || concepto.trim() === "") {
    throw new Error("El concepto del egreso es obligatorio.");
  }
  if (montoCordobas <= 0 || isNaN(montoCordobas)) {
    throw new Error("El monto del egreso debe ser mayor a 0.");
  }

  const filas = await actualizarEgresoCajaModel(idEgreso, tipoEgreso, metodoPago, concepto, montoCordobas, observaciones);
  if (filas === 0) {
    throw new Error("No se encontró el egreso a actualizar.");
  }
  return true;
}