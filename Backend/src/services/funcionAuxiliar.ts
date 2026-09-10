export function addOneDay(fecha: string): string {
    const date = new Date(`${fecha}T00:00:00`);
    date.setDate(date.getDate() + 1);
    // Formato YYYY-MM-DD HH:mm:ss
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} 00:00:00`;
}