import { pool } from "../config/database.js";

export const obtenerCuotasPendientes = async (
    idCreditoFactura: number
) => {

    const [rows]: any = await pool.query(
        `
        SELECT
            cu.id,
            cu.numero_cuota,
            cu.monto_a_pagar,
            cu.fecha_vencimiento,
            cu.estado,
            COALESCE(ab.monto_pagado, 0) AS monto_pagado
        FROM cuota cu
        LEFT JOIN (
            SELECT id_cuota, SUM(monto_abonado) AS monto_pagado
            FROM abono
            WHERE id_cuota IS NOT NULL
            GROUP BY id_cuota
        ) ab ON ab.id_cuota = cu.id
        WHERE cu.id_credito_factura = ?
          AND cu.estado IN ('pendiente', 'pagada_parcial')
        ORDER BY cu.numero_cuota ASC
        `,
        [idCreditoFactura]
    );

    return rows.map((r: any) => ({
        id: r.id,
        numero_cuota: r.numero_cuota,
        monto_a_pagar: Number(r.monto_a_pagar),
        monto_pagado: Number(r.monto_pagado),
        saldo_cuota: Number(r.monto_a_pagar) - Number(r.monto_pagado),
        fecha_vencimiento: r.fecha_vencimiento,
        estado: r.estado
    }));

};

export const obtenerSiguienteCuota = async (
    idCreditoFactura: number
) => {

    const cuotas = await obtenerCuotasPendientes(idCreditoFactura);

    return cuotas.length > 0 ? cuotas[0] : null;

};