export interface FacturaConDeuda {
    IdVenta: number;
    FechaVenta: string;

    IdCliente: number;
    NCliente: number;
    Nombre: string;
    Apellido: string;
    Telefono: string;
    Direccion: string;
    NCedula: string;

    IdCreditoFactura: number;
    TotalDeuda: number;
    EstadoCredito: string;
    NumeroCuotas: number;
    Frecuencia: "diario" | "semanal" | "quincenal" | "mensual";

    TotalAbonado: number;
    Saldo_Deuda: number;

    ProximaFechaPago: string;
    ProximaCuotaNumero: number | null;
    ProximaCuotaMonto: number | null;
}

