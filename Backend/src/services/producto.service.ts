import { pool } from "../config/database.js";

export const buscarProductos = async (
    search: string = "",
    page: number = 1,
    perPage: number = 10
) => {

    const offset = (page - 1) * perPage;

    let where = "";
    const params: any[] = [];

    if (search.trim() !== "") {

    const palabras = search.trim().split(/\s+/);

    const condiciones: string[] = [];

    for (const palabra of palabras) {
        condiciones.push(`
            (
                p.Nombre LIKE ?
                OR c.Nombre_categoria LIKE ?
                OR m.Nombre_marca LIKE ?
                OR p.id LIKE ?
            )
        `);

        params.push(
            `%${palabra}%`,
            `%${palabra}%`,
            `%${palabra}%`,
            `%${palabra}%`
        );
    }

    where = `WHERE ${condiciones.join(" AND ")}`;
}

    const [countRows]: any = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM productos p
        INNER JOIN marcas m ON p.Id_marca = m.id
        INNER JOIN categorias c ON p.Id_categoria = c.id
        ${where}
        `,
        params
    );

    const total = countRows[0].total;

    const [rows] = await pool.query(
        `
        SELECT
            p.id,
            p.Nombre,
            p.Id_marca,
            m.Nombre_marca,
            p.Id_categoria,
            c.Nombre_categoria,
            p.Precio_venta,
            p.Stock,
            p.Stock_min,
            p.Fecha_vencimiento
        FROM productos p
        INNER JOIN marcas m ON p.Id_marca = m.id
        INNER JOIN categorias c ON p.Id_categoria = c.id
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

export const buscarProductoPorId = async (id: number) => {

    const [rows]: any = await pool.query(
        `
        SELECT
            p.id,
            p.Nombre,
            p.Id_marca,
            m.Nombre_marca,
            p.Id_categoria,
            c.Nombre_categoria,
            p.Precio_venta,
            p.Stock,
            p.Stock_min,
            p.Fecha_vencimiento
        FROM productos p
        INNER JOIN marcas m ON p.Id_marca = m.id
        INNER JOIN categorias c ON p.Id_categoria = c.id
        WHERE p.id = ?
        `,
        [id]
    );

    if (rows.length === 0) {
        throw new Error("Producto no encontrado.");
    }

    return rows[0];
};

export const crearProducto = async (
    nombre: string,
    idMarca: number,
    idCategoria: number,
    precioVenta: number,
    stock: number,
    stockMin: number,
    fechaVencimiento: String | null
) => {

    if (!nombre.trim()) {
        throw new Error("El nombre del producto no puede estar vacío.");
    }

    const [rowsNombre]: any = await pool.query(
        "SELECT COUNT(*) AS count FROM productos WHERE Nombre = ?",
        [nombre]
    );

    if (rowsNombre[0].count > 0) {
        throw new Error("Ya existe un producto con ese nombre.");
    }

    if (isNaN(idMarca) || idMarca <= 0) {
        throw new Error("Seleccione una marca válida.");
    }

    if (isNaN(idCategoria) || idCategoria <= 0) {
        throw new Error("Seleccione una categoría válida.");
    }

    const [marca]: any = await pool.query(
        "SELECT COUNT(*) AS count FROM marcas WHERE id = ?",
        [idMarca]
    );

    if (marca[0].count === 0) {
        throw new Error("La marca seleccionada no existe.");
    }

    const [categoria]: any = await pool.query(
        "SELECT COUNT(*) AS count FROM categorias WHERE id = ?",
        [idCategoria]
    );

    if (categoria[0].count === 0) {
        throw new Error("La categoría seleccionada no existe.");
    }

    if (isNaN(precioVenta) || precioVenta <= 0) {
        throw new Error("Ingrese un precio de venta válido.");
    }

    if (!Number.isInteger(stock) || stock < 0) {
        throw new Error("El stock debe ser un número entero mayor o igual a 0.");
    }

    if (!Number.isInteger(stockMin) || stockMin < 0) {
        throw new Error("El stock mínimo debe ser un número entero mayor o igual a 0.");
    }
    const [result]: any = await pool.query(
        `
        INSERT INTO productos
        (
            Nombre,
            Id_marca,
            Id_categoria,
            Precio_venta,
            Stock,
            Stock_min,
            Fecha_vencimiento
        )
        VALUES (?,?,?,?,?,?,?)
        `,
        [
            nombre,
            idMarca,
            idCategoria,
            precioVenta,
            stock,
            stockMin,
            fechaVencimiento
        ]
    );

    return result;
};

export const actualizarProducto = async (
    id: number,
    nombre: string,
    idCategoria: number,
    idMarca: number,
    precioVenta: number,
    stock: number,
    stockMin: number,
    fechaVencimiento: Date | null
) => {

    if (!nombre.trim()) {
        throw new Error("El nombre del producto no puede estar vacío.");
    }

    const [rowsNombre]: any = await pool.query(
        "SELECT COUNT(*) AS count FROM productos WHERE Nombre = ? AND id != ?",
        [nombre, id]
    );

    if (rowsNombre[0].count > 0) {
        throw new Error("Ya existe un producto con ese nombre.");
    }

    if (isNaN(idMarca) || idMarca <= 0) {
        throw new Error("Seleccione una marca válida.");
    }

    if (isNaN(idCategoria) || idCategoria <= 0) {
        throw new Error("Seleccione una categoría válida.");
    }

    const [marca]: any = await pool.query(
        "SELECT COUNT(*) AS count FROM marcas WHERE id = ?",
        [idMarca]
    );

    if (marca[0].count === 0) {
        throw new Error("La marca seleccionada no existe.");
    }

    const [categoria]: any = await pool.query(
        "SELECT COUNT(*) AS count FROM categorias WHERE id = ?",
        [idCategoria]
    );

    if (categoria[0].count === 0) {
        throw new Error("La categoría seleccionada no existe.");
    }

    if (isNaN(precioVenta) || precioVenta <= 0) {
        throw new Error("Ingrese un precio de venta válido.");
    }

    if (!Number.isInteger(stock) || stock < 0) {
        throw new Error("El stock debe ser un número entero mayor o igual a 0.");
    }

    if (!Number.isInteger(stockMin) || stockMin < 0) {
        throw new Error("El stock mínimo debe ser un número entero mayor o igual a 0.");
    }

    if (fechaVencimiento !== null && isNaN(new Date(fechaVencimiento).getTime())) {
        throw new Error("La fecha de vencimiento no es válida.");
    }

    const [result]: any = await pool.query(
        `
        UPDATE productos
        SET Nombre = ?,
            Id_marca = ?,
            Id_categoria = ?,
            Precio_venta = ?,
            Stock = ?,
            Stock_min = ?,
            Fecha_vencimiento = ?
        WHERE id = ?
        `,
        [
            nombre,
            idMarca,
            idCategoria,
            precioVenta,
            stock,
            stockMin,
            fechaVencimiento,
            id
        ]
    );

    return result;
};


export const obtenerTotalProductosCategorias = async () => {

    const [[productos], [categorias], marcaSinMarca]: any = await Promise.all([
        pool.query("SELECT COUNT(*) AS total FROM productos"),
        pool.query("SELECT COUNT(*) AS total FROM categorias"),
        pool.query(`
            SELECT id, Nombre_marca
            FROM marcas
            WHERE id = '20'
            LIMIT 1
        `)
    ]);


    return {
        totalProductos: productos[0].total,
        totalCategorias: categorias[0].total,
        marcaSinMarca: marcaSinMarca[0] || null
    };
};