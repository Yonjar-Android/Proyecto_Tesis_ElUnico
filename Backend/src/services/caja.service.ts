import {
  obtenerSesionActiva,
  crearSesionCaja,
  obtenerEgresosPorSesion,
  crearEgresoCaja,
  eliminarEgresoCaja,
  obtenerIngresosDelDia,
  obtenerTotalEgresosPorSesion,
  obtenerResumenCierreCaja,
  cerrarSesionCaja,
} from "../models/caja.models.js";

export async function obtenerEstadoCaja() {
  const sesion = await obtenerSesionActiva();
  if (!sesion) {
    return { sesion: null, egresos: [], ingresosDia: 0 };
  }

  const ingresosDia = await obtenerIngresosDelDia();
  const egresos = await obtenerEgresosPorSesion(sesion.id_sesion);

  return {
    sesion,
    egresos,
    ingresosDia,
  };
}

export async function abrirCaja(
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

  return await crearSesionCaja(montoAperturaCordobas, tasaCambio, observaciones);
}

export async function agregarEgreso(
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

  if (!tipoEgreso.trim()) {
    throw new Error("El tipo de egreso es obligatorio.");
  }

  if (!concepto.trim()) {
    throw new Error("El concepto del egreso es obligatorio.");
  }

  if (montoCordobas <= 0 || isNaN(montoCordobas)) {
    throw new Error("El monto del egreso debe ser mayor a 0.");
  }

  return await crearEgresoCaja(idSesion, tipoEgreso, metodoPago, concepto, montoCordobas, observaciones);
}

export async function eliminarEgreso(idEgreso: number) {
  if (!idEgreso || isNaN(idEgreso)) {
    throw new Error("Egreso inválido.");
  }

  const filas = await eliminarEgresoCaja(idEgreso);
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

  const filas = await cerrarSesionCaja(idSesion);
  if (filas === 0) {
    throw new Error("No se pudo cerrar la sesión de caja. Ya está cerrada o no existe.");
  }

  return {
    idSesion,
    totalEfectivoContado,
    totalTarjetaTransferencia,
    diferencia,
    observaciones,
  };
}

export async function obtenerResumenCierre(idSesion: number) {
  const resumen = await obtenerResumenCierreCaja(idSesion);
  if (!resumen) {
    throw new Error("No se encontró la sesión de caja para el cierre.");
  }
  return resumen;
}
