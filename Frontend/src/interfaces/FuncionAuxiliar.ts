export function formatearMoneda(valor: number | null | undefined): string {
  const numero = Number(valor);

  if (isNaN(numero)) {
    return "0.00";
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numero);
}

export function formatearTelefono(valor: string | number | null | undefined): string {
  if (valor === null || valor === undefined) {
    return "";
  }

  const numero = String(valor).replace(/\D/g, "");

  if (numero.length !== 8) {
    return numero;
  }

  return `${numero.slice(0, 4)}-${numero.slice(4)}`;
}

export function formatearFecha(fecha: Date | string) {
  if (typeof fecha === "string") {
    const soloFecha = fecha.split("T")[0].split(" ")[0]; // "2026-09-07"
    const [anio, mes, dia] = soloFecha.split("-");
    return `${dia}-${mes}-${anio}`;
  }

  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  return `${dia}-${mes}-${anio}`;
}

export const obtenerFechaHoy = (): string => {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, "0");
  const day = String(hoy.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};