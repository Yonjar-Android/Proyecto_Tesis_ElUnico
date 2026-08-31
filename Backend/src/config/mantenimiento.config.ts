import path from "path";

export const MYSQLDUMP_PATH = "C:\\xampp\\mysql\\bin\\mysqldump.exe";
export const MYSQL_PATH = "C:\\xampp\\mysql\\bin\\mysql.exe";

// Carpeta donde se guardan los archivos .sql de respaldo
export const CARPETA_RESPALDOS = path.resolve(process.cwd(), "backups");

// Mismas credenciales que usa config/database.ts
export const DB_CONFIG = {
    host: "localhost",
    port: "3306",
    user: "root",
    password: "",
    database: "elunico_db",
};