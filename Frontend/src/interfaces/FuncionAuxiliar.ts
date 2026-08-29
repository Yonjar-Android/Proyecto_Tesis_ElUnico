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