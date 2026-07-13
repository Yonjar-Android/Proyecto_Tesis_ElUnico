import mysql from "mysql2/promise";

export const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "elunico_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export async function conectarDB(){
    try {
        await pool.getConnection();
        console.log("Conexión a la base de datos establecida");
    }
    catch (error) {
        console.error("Error al conectar a la base de datos:", error);
        throw error;
    }
}