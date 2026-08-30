import { pool } from "../config/database.js";

export const buscarClientes = async (
    search: string = "",
    page: number = 1,
    perPage: number = 10
) => {
    const offset = (page - 1) * perPage;

    let where = "";
    const params: any[] = [];

    if (search.trim() !== "") {
        where = `
            WHERE NCliente LIKE ?
               OR CONCAT(Nombre, ' ', Apellido) LIKE ?
               OR Telefono LIKE ?
        `;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Total de registros
    const [countRows]: any = await pool.query(
        `SELECT COUNT(*) AS total
         FROM clientes
         ${where}`,
        params
    );

    const total = countRows[0].total;

    // Registros paginados
    const [rows] = await pool.query(
        `
        SELECT *
        FROM clientes
        ${where}
        LIMIT ? OFFSET ?
        `,
        [...params, perPage, offset]
    );

    return{
        data: rows,
        current_page: page,
        per_page: perPage,
        total,
        last_page: Math.ceil(total / perPage)
    };
}

export const crearCliente = async (
    nombre:string, apellido: string, telefono: string,
    direccion:string, saldo_deuda: number, Ncliente:number, Ncedula:string
) => {

        if (!nombre.trim()) {
      throw new Error("El campo nombre no puede estar vacío.");
    }

    if (!apellido.trim()) {
      throw new Error("El campo apellido no puede estar vacío.");
    }

    if (!String(Ncliente).trim()) {
      throw new Error("El campo número de cliente no puede estar vacío.");
    }

     if (!/^\d+$/.test(Ncliente.toString())) {
     throw new Error ("Ingrese un número de cliente válido.");
    }

    if (Number(Ncliente) <= 0) {
       throw new Error("El campo número de cliente debe ser mayor que 0.");
    }

    const [rows]: any = await pool.query(
    "SELECT COUNT(*) AS count FROM clientes WHERE NCliente = ?",
    [Ncliente]
    );

    if (rows[0].count > 0) {
    throw new Error("Ya existe un cliente con ese número de cliente.");
    }

    if (!/^\d+$/.test(telefono) && telefono.length != 0) {
    throw new Error("El número de teléfono solo puede contener dígitos del 0 al 9.");
    }

    if(telefono.length != 8 && telefono.length != 0){
      throw new Error("El número de teléfono debe contener 8 caracteres.");
    }

    if (telefono.trim() !== "") {
     const [rowsPhone]: any = await pool.query(
    "SELECT COUNT(*) AS count FROM clientes WHERE Telefono = ?",
    [telefono]
    );

    if (rowsPhone[0].count > 0) {
    throw new Error("Ya existe un cliente con ese número de teléfono.");
    }}

    if (Ncedula.trim() !== "") {
     const [rownCedula]: any = await pool.query(
    "SELECT COUNT(*) AS count FROM clientes WHERE NCedula = ?",
    [Ncedula]
    );

    if (rownCedula[0].count > 0) {
    throw new Error("Ya existe un cliente con ese número de cédula.");
    }}

    if (isNaN(saldo_deuda)) {
    throw new Error("Ingrese un valor válido en el campo deuda.");
    }

    if(Number(String(saldo_deuda)) < 0){
      throw new Error("El valor de crédito no puede ser negativo.");
    }

    const [result]: any = await pool.query(
        "INSERT INTO clientes (Nombre, Apellido, Telefono, Direccion, Saldo_Deuda, NCliente, NCedula) VALUES (?,?,?,?,?,?,?)",
        [nombre, apellido, telefono, direccion, saldo_deuda, Ncliente, Ncedula]
    );

    const idCliente = result.insertId;

    await pool.query(
    "INSERT INTO abonos (Id_cliente, Total_deuda) VALUES (?, ?)",
    [idCliente, saldo_deuda]
    );

    return result;
}

export const actualizarCliente = async (
    id: number,
    nombre: string,
    apellido: string,
    telefono: string,
    direccion: string,
    saldo_deuda: number,
    Ncliente: number,
    Ncedula:string
) => {

    if (!nombre.trim()) {
      throw new Error("El campo nombre no puede estar vacío.");
    }

    if (!apellido.trim()) {
      throw new Error("El campo apellido no puede estar vacío.");
    }

    if (!String(Ncliente).trim()) {
      throw new Error("El campo número de cliente no puede estar vacío.");
    }

     if (!/^\d+$/.test(Ncliente.toString())) {
     throw new Error ("Ingrese un número de cliente válido.");
    }

    if (Number(Ncliente) <= 0) {
       throw new Error("El campo número de cliente debe ser mayor que 0.");
    }

    const [rows]: any = await pool.query(
    "SELECT COUNT(*) AS count FROM clientes WHERE NCliente = ? AND id != ?",
    [Ncliente, id]
    );

    if (rows[0].count > 0) {
    throw new Error("Ya existe un cliente con ese número de cliente.");
    }

    if(!/^\d+$/.test(telefono)  && telefono.length != 0) {
    throw new Error("El número de teléfono solo puede contener dígitos del 0 al 9.");
    }

    if(telefono.length != 8 && telefono.length != 0){
      throw new Error("El número de teléfono debe contener 8 caracteres.");
    }

    if (telefono.trim() !== "") {
    const [rowsPhone]: any = await pool.query(
    "SELECT COUNT(*) AS count FROM clientes WHERE Telefono = ? AND id != ?",
    [telefono, id]
    );

    if (rowsPhone[0].count > 0) {
    throw new Error("Ya existe un cliente con ese número de teléfono.");
    }}

    if (Ncedula.trim() !== "") {
    const [rownCedula]: any = await pool.query(
    "SELECT COUNT(*) AS count FROM clientes WHERE NCedula = ? AND id != ?",
    [Ncedula, id]
    );

    if (rownCedula[0].count > 0) {
    throw new Error("Ya existe un cliente con ese número de cédula.");
    }}

    if (!/^\d+$/.test(String(saldo_deuda))) {
    throw new Error("Ingrese un valor válido en el campo crédito");
    }

    if(Number(String(saldo_deuda)) < 0){
      throw new Error("El valor de crédito no puede ser negativo.");
    }


    const [result]: any = await pool.query(
        `UPDATE clientes
         SET Nombre = ?,
             Apellido = ?,
             Telefono = ?,
             Direccion = ?,
             Saldo_Deuda = ?,
             NCliente = ?,
             NCedula = ?
         WHERE id = ?`,
        [nombre, apellido, telefono, direccion, saldo_deuda, Ncliente, Ncedula ,id]
    );

    return result;
};