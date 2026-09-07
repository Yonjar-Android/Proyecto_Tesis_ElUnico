import { pool } from "../config/database.js";

export const obtenerHistorialAbonos = async (
    idCreditoFactura: number
) => {

    const [rows]: any = await pool.query(
        `
        SELECT
            ab.id,
            cu.numero_cuota,
            ab.monto_abonado,
            ab.fecha_abono,
            ab.metodo_pago,
            ab.referencia,
            cu.estado AS estado_cuota_resultante
        FROM abono ab
        INNER JOIN cuota cu ON cu.id = ab.id_cuota
        WHERE ab.id_credito_factura = ?
        ORDER BY ab.fecha_abono DESC, ab.id DESC
        `,
        [idCreditoFactura]
    );

    return rows.map((r: any) => ({
        id: r.id,
        numero_cuota: r.numero_cuota,
        monto_abonado: Number(r.monto_abonado),
        fecha_abono: r.fecha_abono,
        metodo_pago: r.metodo_pago,
        referencia: r.referencia,
        estado_cuota_resultante: r.estado_cuota_resultante
    }));

};

export const registrarAbono = async (
    idCreditoFactura: number,
    montoAAbonar: number,
    metodoPago: string,
    referencia: string | null,
    observaciones: string | null
) => {

    if (!montoAAbonar || montoAAbonar <= 0) {
        throw new Error("El monto a abonar debe ser mayor a cero.");
    }

    if (!metodoPago || !metodoPago.trim()) {
        throw new Error("Debe indicar el método de pago.");
    }

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        // Bloquea las cuotas pendientes/parciales de esta factura para evitar
        // que dos abonos simultáneos las distribuyan sobre las mismas cuotas.
        const [cuotas]: any = await connection.query(
            `
            SELECT id, numero_cuota, monto_a_pagar
            FROM cuota
            WHERE id_credito_factura = ?
              AND estado IN ('pendiente', 'pagada_parcial')
            ORDER BY numero_cuota ASC
            FOR UPDATE
            `,
            [idCreditoFactura]
        );

        if (cuotas.length === 0) {
            throw new Error("Esta factura no tiene cuotas pendientes por pagar.");
        }

        // Calcula el saldo real de cada cuota (monto_a_pagar - lo ya abonado)
        const cuotasConSaldo: any[] = [];
        let saldoTotalPendiente = 0;

        for (const cuota of cuotas) {

            const [montoPagadoRows]: any = await connection.query(
                `SELECT COALESCE(SUM(monto_abonado), 0) AS monto_pagado FROM abono WHERE id_cuota = ?`,
                [cuota.id]
            );

            const montoPagado = Number(montoPagadoRows[0].monto_pagado);
            const saldoCuota = Number(cuota.monto_a_pagar) - montoPagado;

            cuotasConSaldo.push({ ...cuota, saldo_cuota: saldoCuota });
            saldoTotalPendiente += saldoCuota;

        }

        if (montoAAbonar > saldoTotalPendiente) {
            throw new Error(
                `El monto ingresado (C$${montoAAbonar.toFixed(2)}) supera la deuda pendiente de la factura (C$${saldoTotalPendiente.toFixed(2)}).`
            );
        }

        let disponible = montoAAbonar;
        const distribucion: any[] = [];

        for (const cuota of cuotasConSaldo) {

            if (disponible <= 0) break;

            const aplicado = Math.min(disponible, cuota.saldo_cuota);
            const nuevoEstado = (cuota.saldo_cuota - aplicado) === 0 ? "pagada" : "pagada_parcial";

            await connection.query(
                `
                INSERT INTO abono
                (id_cuota, id_credito_factura, tipo, monto_abonado, fecha_abono, metodo_pago, referencia, observaciones)
                VALUES (?, ?, 'cuota', ?, NOW(), ?, ?, ?)
                `,
                [cuota.id, idCreditoFactura, aplicado, metodoPago, referencia, observaciones]
            );

            await connection.query(
                `UPDATE cuota SET estado = ? WHERE id = ?`,
                [nuevoEstado, cuota.id]
            );

            distribucion.push({
                id_cuota: cuota.id,
                numero_cuota: cuota.numero_cuota,
                saldo_antes: cuota.saldo_cuota,
                monto_aplicado: aplicado,
                saldo_despues: cuota.saldo_cuota - aplicado,
                estado_resultante: nuevoEstado
            });

            disponible -= aplicado;

        }

        const [pendientesRestantes]: any = await connection.query(
            `
            SELECT COUNT(*) AS total
            FROM cuota
            WHERE id_credito_factura = ?
              AND estado IN ('pendiente', 'pagada_parcial')
            `,
            [idCreditoFactura]
        );

        const nuevoEstadoFactura = pendientesRestantes[0].total === 0 ? "pagada" : "pagada_parcial";

        await connection.query(
            `UPDATE credito_factura SET estado = ? WHERE id = ?`,
            [nuevoEstadoFactura, idCreditoFactura]
        );

        await connection.commit();

        return {
            distribucion,
            estado_factura: nuevoEstadoFactura
        };

    } catch (error) {

        await connection.rollback();
        throw error;

    } finally {

        connection.release();

    }

};