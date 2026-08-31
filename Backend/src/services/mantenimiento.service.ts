import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { pool } from "../config/database.js";
import { MYSQLDUMP_PATH, MYSQL_PATH, CARPETA_RESPALDOS, DB_CONFIG } from "../config/mantenimiento.config.js";

const execAsync = promisify(exec);

const ACCION_RESPALDO = "Respaldo";

function asegurarCarpetaRespaldos() {
    if (!fs.existsSync(CARPETA_RESPALDOS)) {
        fs.mkdirSync(CARPETA_RESPALDOS, { recursive: true });
    }
}

function formatearNombreArchivo(): string {
    const ahora = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const fecha = `${ahora.getFullYear()}${pad(ahora.getMonth() + 1)}${pad(ahora.getDate())}_${pad(
        ahora.getHours()
    )}${pad(ahora.getMinutes())}${pad(ahora.getSeconds())}`;
    return `respaldo_${DB_CONFIG.database}_${fecha}.sql`;
}

export const crearRespaldo = async (idUsuario: number | null) => {
    asegurarCarpetaRespaldos();

    const nombreArchivo = formatearNombreArchivo();
    const rutaArchivo = path.join(CARPETA_RESPALDOS, nombreArchivo);

    const passwordFlag = DB_CONFIG.password ? `-p${DB_CONFIG.password}` : "";
    const comando = `"${MYSQLDUMP_PATH}" -h ${DB_CONFIG.host} -P ${DB_CONFIG.port} -u ${DB_CONFIG.user} ${passwordFlag} ${DB_CONFIG.database} > "${rutaArchivo}"`;

    try {
        await execAsync(comando);

        const stats = fs.statSync(rutaArchivo);

        await pool.query(
            `INSERT INTO mantenimiento (Accion, Fecha, Id_usuario, nombre_archivo, tamano_bytes, estado)
             VALUES (?, NOW(), ?, ?, ?, 'Exitoso')`,
            [ACCION_RESPALDO, idUsuario, nombreArchivo, stats.size]
        );

        return { mensaje: "Respaldo creado correctamente.", nombreArchivo };
    } catch (error: any) {
        await pool.query(
            `INSERT INTO mantenimiento (Accion, Fecha, Id_usuario, nombre_archivo, tamano_bytes, estado, mensaje_error)
             VALUES (?, NOW(), ?, ?, 0, 'Fallido', ?)`,
            [ACCION_RESPALDO, idUsuario, nombreArchivo, error.message?.slice(0, 500) || "Error desconocido"]
        );

        if (fs.existsSync(rutaArchivo)) {
            fs.unlinkSync(rutaArchivo);
        }

        throw new Error("No se pudo crear el respaldo. Verifica la conexión a la base de datos y la ruta de mysqldump.");
    }
};

export const listarRespaldos = async () => {
    const [rows]: any = await pool.query(
        `SELECT id, Fecha AS fecha_respaldo, nombre_archivo, tamano_bytes, estado, mensaje_error
         FROM mantenimiento
         WHERE Accion = ?
         ORDER BY Fecha DESC`,
        [ACCION_RESPALDO]
    );
    return rows;
};

export const obtenerRutaRespaldo = async (idRespaldo: number) => {
    const [rows]: any = await pool.query(
        "SELECT nombre_archivo FROM mantenimiento WHERE id = ? AND Accion = ?",
        [idRespaldo, ACCION_RESPALDO]
    );

    if (rows.length === 0) {
        throw new Error("El respaldo solicitado no existe.");
    }

    const rutaArchivo = path.join(CARPETA_RESPALDOS, rows[0].nombre_archivo);

    if (!fs.existsSync(rutaArchivo)) {
        throw new Error("El archivo de respaldo ya no existe en el servidor.");
    }

    return { rutaArchivo, nombreArchivo: rows[0].nombre_archivo };
};

export const eliminarRespaldo = async (idRespaldo: number) => {
    const [rows]: any = await pool.query(
        "SELECT nombre_archivo FROM mantenimiento WHERE id = ? AND Accion = ?",
        [idRespaldo, ACCION_RESPALDO]
    );

    if (rows.length === 0) {
        throw new Error("El respaldo solicitado no existe.");
    }

    const rutaArchivo = path.join(CARPETA_RESPALDOS, rows[0].nombre_archivo);

    if (fs.existsSync(rutaArchivo)) {
        fs.unlinkSync(rutaArchivo);
    }

    await pool.query("DELETE FROM mantenimiento WHERE id = ? AND Accion = ?", [idRespaldo, ACCION_RESPALDO]);

    return { mensaje: "Respaldo eliminado correctamente." };
};

export const restaurarDesdeArchivo = async (rutaArchivoSql: string) => {
    if (!fs.existsSync(rutaArchivoSql)) {
        throw new Error("El archivo de restauración no existe.");
    }

    const passwordFlag = DB_CONFIG.password ? `-p${DB_CONFIG.password}` : "";
    const comando = `"${MYSQL_PATH}" -h ${DB_CONFIG.host} -P ${DB_CONFIG.port} -u ${DB_CONFIG.user} ${passwordFlag} ${DB_CONFIG.database} < "${rutaArchivoSql}"`;

    try {
        await execAsync(comando);
        return { mensaje: "Base de datos restaurada correctamente." };
    } catch (error: any) {
        throw new Error("No se pudo restaurar la base de datos. Verifica que el archivo .sql sea válido.");
    }
};

export const restaurarDesdeRespaldoExistente = async (idRespaldo: number) => {
    const { rutaArchivo } = await obtenerRutaRespaldo(idRespaldo);
    return restaurarDesdeArchivo(rutaArchivo);
};