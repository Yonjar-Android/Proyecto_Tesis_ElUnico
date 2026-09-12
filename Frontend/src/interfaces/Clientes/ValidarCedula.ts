
  const CODIGOS_MUNICIPIOS = new Set([
  // Managua
  "001", "002", "003", "004", "005", "006", "007", "008", "009",

  // Carazo
  "041", "042", "043", "044", "045", "046", "047", "048",

  // Chinandega
  "081", "082", "083", "084", "085", "086", "087", "088",
  "089", "090", "091", "092", "093",

  // Chontales
  "121", "122", "123", "124", "125", "126", "127", "128",
  "129", "130",

  // Estelí
  "161", "162", "163", "164", "165", "166",

  // Granada
  "201", "202", "203", "204",

  // Jinotega
  "241", "242", "243", "244", "245", "246", "247",

  // León
  "281", "283", "284", "285", "286", "287", "288", "289",
  "290", "291",

  // Madriz
  "321", "322", "323", "324", "325", "326", "327", "328", "329",

  // Masaya
  "401", "402", "403", "404", "405", "406", "407", "408", "409",

  // Matagalpa
  "441", "442", "443", "444", "445", "446", "447", "448",
  "449", "450", "451", "452", "453", "454",

  // Nueva Segovia
  "481", "482", "483", "484", "485", "486", "487", "488",
  "489", "490", "491", "492", "493",

  // Río San Juan
  "521", "522", "523", "524", "525", "526",

  // Rivas
  "561", "562", "563", "564", "565", "566", "567", "568",
  "569", "570",

  // Caribe
  "601", "602", "603", "604", "605", "606", "607", "608",
  "610", "611", "612", "615", "616", "619", "624", "626",
  "627", "628", "888"
]);

export const validarCedula = (cedula: string): boolean => {
  if (!cedula) return false;

  // Acepta:
  // 441-250704-1003N
  // 4412507041003N
  const limpia = cedula.replace(/-/g, "").trim().toUpperCase();

  // 13 números + 1 letra
  if (!/^\d{13}[A-Z]$/.test(limpia)) {
    return false;
  }

  const codigoMunicipio = limpia.substring(0, 3);
  const fechaNacimiento = limpia.substring(3, 9);
  const numeroProgresivo = limpia.substring(9, 13);
  const letra = limpia.substring(13, 14);

  // 1. Municipio válido
  if (!CODIGOS_MUNICIPIOS.has(codigoMunicipio)) {
    return false;
  }

  // 2. Los 4 últimos caracteres antes de la letra deben ser numéricos
  if (!/^\d{4}$/.test(numeroProgresivo)) {
    return false;
  }

  // 3. Validar fecha DDMMYY
  const dia = Number(fechaNacimiento.substring(0, 2));
  const mes = Number(fechaNacimiento.substring(2, 4));
  const anio = Number(fechaNacimiento.substring(4, 6));

  // Determinar siglo.
  // Se asume que fechas YY corresponden a personas nacidas
  // entre 1900 y el año actual.
  const anioActual = new Date().getFullYear();
  const anioCompleto =
    anio <= anioActual % 100
      ? 2000 + anio
      : 1900 + anio;

  const fecha = new Date(
    Date.UTC(anioCompleto, mes - 1, dia)
  );

  // Evita fechas como 31/02/2004
  const fechaValida =
    fecha.getUTCFullYear() === anioCompleto &&
    fecha.getUTCMonth() === mes - 1 &&
    fecha.getUTCDate() === dia;

  if (!fechaValida) {
    return false;
  }

  // 4. Debe tener al menos 16 años
  const hoy = new Date();

  let edad = hoy.getFullYear() - anioCompleto;

  const yaCumplio =
    hoy.getMonth() + 1 > mes ||
    (hoy.getMonth() + 1 === mes && hoy.getDate() >= dia);

  if (!yaCumplio) {
    edad--;
  }

  if (edad < 16) {
    return false;
  }

  // 5. La letra debe existir
  if (!/^[A-Z]$/.test(letra)) {
    return false;
  }

  return true;
};