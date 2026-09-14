import type { RespuestaReporteSalidas } from "../models/SalidaInventario";

/**
 * ⚠️ BACKEND PENDIENTE ⚠️
 * Ninguno de estos endpoints existe todavía. Las llamadas reales quedan
 * comentadas justo encima de cada función, listas para descomentar cuando
 * el backend esté disponible. Mientras tanto, cada función arma una
 * respuesta con datos de prueba (mock) que simulan el join entre
 * Productos + Otras_salidas_inventario + Detalle_otras_salidas_inventario,
 * para poder maquetar y probar el reporte en el frontend.
 *
 * Cuando el backend exista, basta con:
 *   1. Descomentar el bloque "llamada real".
 *   2. Borrar el bloque "MOCK" de esta misma función.
 */

// import api from "./api"; // instancia de axios/fetch ya configurada del proyecto

// ---------------------------------------------------------------------
// ------------------------- DATOS DE PRUEBA ----------------------------
// ---------------------------------------------------------------------

const PRODUCTOS_MOCK = [
  { id: 1, Nombre: "Cemento Canal 42.5kg" },
  { id: 2, Nombre: "Varilla de hierro 3/8" },
  { id: 3, Nombre: "Pintura látex blanca 1gal" },
  { id: 4, Nombre: "Clavos 2 pulgadas (caja)" },
  { id: 5, Nombre: "Lámina de zinc 12ft" },
];

const SALIDAS_MOCK: {
  id: number;
  Id_usuario: number;
  Fecha: string;
  Tipo_Salida: string;
  Observacion: string | null;
  Estado: string;
}[] = [
  { id: 101, Id_usuario: 1, Fecha: "2026-09-01", Tipo_Salida: "Merma", Observacion: "Sacos dañados por humedad", Estado: "Activa" },
  { id: 102, Id_usuario: 2, Fecha: "2026-09-03", Tipo_Salida: "Uso interno", Observacion: "Reparación de bodega", Estado: "Activa" },
  { id: 103, Id_usuario: 1, Fecha: "2026-09-05", Tipo_Salida: "Ajuste de inventario", Observacion: null, Estado: "Activa" },
  { id: 104, Id_usuario: 2, Fecha: "2026-09-08", Tipo_Salida: "Devolución a proveedor", Observacion: "Producto en mal estado", Estado: "Anulada" },
  { id: 105, Id_usuario: 1, Fecha: "2026-09-10", Tipo_Salida: "Merma", Observacion: "Vencimiento", Estado: "Activa" },
];

const DETALLE_MOCK: { id: number; Id_salida: number; Id_producto: number; Cantidad: number }[] = [
  { id: 1, Id_salida: 101, Id_producto: 1, Cantidad: 5 },
  { id: 2, Id_salida: 101, Id_producto: 4, Cantidad: 3 },
  { id: 3, Id_salida: 102, Id_producto: 2, Cantidad: 10 },
  { id: 4, Id_salida: 103, Id_producto: 3, Cantidad: 2 },
  { id: 5, Id_salida: 104, Id_producto: 5, Cantidad: 4 },
  { id: 6, Id_salida: 105, Id_producto: 1, Cantidad: 8 },
  { id: 7, Id_salida: 105, Id_producto: 4, Cantidad: 1 },
];

function construirFilasReporte() {
  return DETALLE_MOCK.map((detalle) => {
    const salida = SALIDAS_MOCK.find((s) => s.id === detalle.Id_salida)!;
    const producto = PRODUCTOS_MOCK.find((p) => p.id === detalle.Id_producto)!;
    return {
      id: detalle.id,
      Id_salida: salida.id,
      Fecha: salida.Fecha,
      Id_producto: producto.id,
      Nombre_Producto: producto.Nombre,
      Tipo_Salida: salida.Tipo_Salida,
      Cantidad: detalle.Cantidad,
      Estado: salida.Estado,
      Observacion: salida.Observacion,
    };
  });
}

// ---------------------------------------------------------------------

/**
 * Obtiene el detalle del reporte: una fila por cada producto que salió
 * de inventario (join Detalle_otras_salidas_inventario + Productos +
 * Otras_salidas_inventario), filtrado por rango de fechas y paginado.
 */
export async function obtenerReporteSalidasPorPeriodo(
  fechaInicio: string,
  fechaFin: string,
  page: number,
  perPage: number
): Promise<RespuestaReporteSalidas> {
  // ------------------------- Llamada real (backend pendiente) -------------------------
  // const response = await api.get("/reportes/salidas-inventario", {
  //   params: { fechaInicio, fechaFin, page, perPage },
  // });
  // return response.data;
  // --------------------------------------------------------------------------------------

  // ------------------------------- MOCK temporal -----------------------------------
  await new Promise((resolve) => setTimeout(resolve, 250)); // simula latencia de red

  let filas = construirFilasReporte();

  if (fechaInicio) filas = filas.filter((f) => f.Fecha >= fechaInicio);
  if (fechaFin) filas = filas.filter((f) => f.Fecha <= fechaFin);

  filas.sort((a, b) => (a.Fecha < b.Fecha ? 1 : -1));

  const totalUnidades = filas.reduce((acc, f) => acc + f.Cantidad, 0);
  const totalRegistros = filas.length;
  const lastPage = Math.max(1, Math.ceil(totalRegistros / perPage));

  const start = (page - 1) * perPage;
  const paginado = filas.slice(start, start + perPage);

  return {
    data: paginado,
    last_page: lastPage,
    TotalRegistros: totalRegistros,
    TotalUnidadesSalidas: totalUnidades,
  };
  // ------------------------------------------------------------------------------------
}

/**
 * Descarga el reporte de salidas en Excel para el rango de fechas dado.
 * Pendiente de implementación en backend.
 */
export async function descargarReporteSalidasExcel(
  fechaInicio: string,
  fechaFin: string
): Promise<Blob> {
  // ------------------------- Llamada real (backend pendiente) -------------------------
  // const response = await api.get("/reportes/salidas-inventario/exportar", {
  //   params: { fechaInicio, fechaFin },
  //   responseType: "blob",
  // });
  // return response.data;
  // --------------------------------------------------------------------------------------

  throw new Error(
    "La exportación a Excel de salidas de inventario aún no está disponible: falta implementar el backend."
  );
}