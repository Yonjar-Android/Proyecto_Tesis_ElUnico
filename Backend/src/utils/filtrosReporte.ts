// reportes/filtrosReporte.ts
export interface FiltroAplicado {
    label: string;
    value?: string | null;
}

/** Devuelve el valor, o el texto por defecto si viene vacío */
export const valorFiltro = (v?: string | null, porDefecto = 'Todos'): string =>
    v && v.trim() ? v.trim() : porDefecto;

/** 2026-01-05 -> 05/01/2026 (sin pasar por Date para evitar desfases de zona horaria) */
export const fechaFiltro = (f: string): string => {
    const [y, m, d] = f.split('-');
    return y && m && d ? `${d}/${m}/${y}` : f;
};

/** Período legible; cubre cuando falta uno de los extremos */
export const periodoFiltro = (fechaInicio?: string, fechaFin?: string): string => {
    if (!fechaInicio && !fechaFin) return 'Todas las fechas';
    return `${fechaInicio ? fechaFiltro(fechaInicio) : 'Sin límite'} al ${fechaFin ? fechaFiltro(fechaFin) : 'Sin límite'}`;
};

/** Para filtros por ID: usa el nombre si llegó, si no "ID n", y si no hay filtro el valor por defecto */
export const idONombre = (
    id?: number | null,
    nombre?: string | null,
    porDefecto = 'Todos'
): string => {
    if (nombre && nombre.trim()) return nombre.trim();
    if (id) return `ID ${id}`;
    return porDefecto;
};