import { pool } from "../config/database.js";

export const buscarProveedores = async (
    search: string = "",
    page: number = 1,
    perPage: number = 10
) => {

    const offset = (page - 1) * perPage;

    let where = "";
    const params: any[] = [];

    if (search.trim() !== "") {
        where = `
            WHERE Nombre_Empresa LIKE ?
               OR Nombre_Contacto LIKE ?
        `;

        params.push(`%${search}%`, `%${search}%`);
    }

    const [countRows]: any = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM proveedores
        ${where}
        `,
        params
    );

    const total = countRows[0].total;

    const [rows] = await pool.query(
        `
        SELECT *
        FROM proveedores
        ${where}
        LIMIT ? OFFSET ?
        `,
        [...params, perPage, offset]
    );

    return {
        data: rows,
        current_page: page,
        per_page: perPage,
        total,
        last_page: Math.ceil(total / perPage)
    };
};

export const crearProveedor = async (
    nombreEmpresa: string,
    nombreContacto: string,
    telefono: string,
    direccion: string
) => {

    if (!nombreEmpresa.trim()) {
        throw new Error("El campo nombre de la empresa no puede estar vacío.");
    }

    if (!nombreContacto.trim()) {
        throw new Error("El campo nombre del contacto no puede estar vacío.");
    }

    if (!telefono.trim()) {
        throw new Error("El campo número de teléfono no puede estar vacío.");
    }

    if (!/^[0-9]\d*$/.test(telefono)) {
        throw new Error("El número de teléfono solo puede contener dígitos del 0 al 9.");
    }

    if (telefono.length !== 8) {
        throw new Error("El número de teléfono debe contener 8 caracteres.");
    }

    const [rowsEmpresa]: any = await pool.query(
        "SELECT COUNT(*) AS count FROM proveedores WHERE Nombre_Empresa = ?",
        [nombreEmpresa]
    );

    if (rowsEmpresa[0].count > 0) {
        throw new Error("Ya existe un proveedor con ese nombre de empresa.");
    }

    const [rowsTelefono]: any = await pool.query(
        "SELECT COUNT(*) AS count FROM proveedores WHERE Telefono = ?",
        [telefono]
    );

    if (rowsTelefono[0].count > 0) {
        throw new Error("Ya existe un proveedor con ese número de teléfono.");
    }

    const [result]: any = await pool.query(
        `
        INSERT INTO proveedores
        (Nombre_Empresa, Nombre_Contacto, Telefono, Direccion)
        VALUES (?,?,?,?)
        `,
        [nombreEmpresa, nombreContacto, telefono, direccion]
    );

    return result;
};

export const actualizarProveedor = async (
    id: number,
    nombreEmpresa: string,
    nombreContacto: string,
    telefono: string,
    direccion: string
) => {

    if (!nombreEmpresa.trim()) {
        throw new Error("El campo nombre de la empresa no puede estar vacío.");
    }

    if (!nombreContacto.trim()) {
        throw new Error("El campo nombre del contacto no puede estar vacío.");
    }

    if (!telefono.trim()) {
        throw new Error("El campo número de teléfono no puede estar vacío.");
    }

    if (!/^[0-9]\d*$/.test(telefono)) {
        throw new Error("El número de teléfono solo puede contener dígitos del 0 al 9.");
    }

    if (telefono.length !== 8) {
        throw new Error("El número de teléfono debe contener 8 caracteres.");
    }

    const [rowsEmpresa]: any = await pool.query(
        `
        SELECT COUNT(*) AS count
        FROM proveedores
        WHERE Nombre_Empresa = ?
        AND id != ?
        `,
        [nombreEmpresa, id]
    );

    if (rowsEmpresa[0].count > 0) {
        throw new Error("Ya existe un proveedor con ese nombre de empresa.");
    }

    const [rowsTelefono]: any = await pool.query(
        `
        SELECT COUNT(*) AS count
        FROM proveedores
        WHERE Telefono = ?
        AND id != ?
        `,
        [telefono, id]
    );

    if (rowsTelefono[0].count > 0) {
        throw new Error("Ya existe un proveedor con ese número de teléfono.");
    }

    const [result]: any = await pool.query(
        `
        UPDATE proveedores
        SET Nombre_Empresa = ?,
            Nombre_Contacto = ?,
            Telefono = ?,
            Direccion = ?
        WHERE id = ?
        `,
        [nombreEmpresa, nombreContacto, telefono, direccion, id]
    );

    return result;
};