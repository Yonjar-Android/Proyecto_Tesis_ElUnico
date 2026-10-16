import express from "express";
//import dotenv from "dotenv";
import { conectarDB } from "./config/database.js";
import marcaRoutes from "./routes/marca.routes.js";
import categoriaRoutes from "./routes/categoria.routes.js";
import clienteRoutes from "./routes/cliente.routes.js";
import creditoRoutes from "./routes/credito.routes.js";
import cuotaRoutes from "./routes/cuota.routes.js";
import abonoRoutes from "./routes/abono.routes.js";
import detalle_abonos from "./routes/detalle_abono.routes.js";
import proveedorRoutes from "./routes/proveedor.routes.js";
import productoRoutes from "./routes/producto.routes.js";
import ventaRoutes from "./routes/venta.routes.js";
import authRoutes from "./routes/auth.routes.js";
import compraRoutes from "./routes/compra.routes.js";
import reporteRoutes from "./routes/reporte.routes.js";
import reporteExcelRoutes from "./routes/reporteExcel.routes.js";
import reportePdfRoutes from "./routes/reportePdf.routes.js";
import cajaRoutes from "./routes/caja.routes.js";
import servicioRoutes from "./routes/service.routes.js"
import cors from "cors";
import { authMiddleware, requireRole } from "./authMiddleware/authMiddleware.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import devolucionesRoutes from "./routes/devoluciones.routes.js";
import salidasRoutes from "./routes/salidas_Inventario.js";
import mantenimientoRoutes from "./routes/mantenimiento.routes.js";

import bitacoraRoutes from "./routes/bitacora.routes.js";

//dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 3001;

conectarDB();

app.use(cors());
app.use(express.json());

// Rutas públicas de autenticación
app.use("/api/auth", authRoutes);
app.use("/api/servicios", authMiddleware, servicioRoutes);

// Rutas operativas protegidas
app.use("/api/marcas", authMiddleware, marcaRoutes);
app.use("/api/categorias", authMiddleware, categoriaRoutes);
app.use("/api/clientes", authMiddleware, clienteRoutes);
app.use("/api/credito", authMiddleware, creditoRoutes);
app.use("/api/cuota", authMiddleware, cuotaRoutes);
app.use("/api/abono", authMiddleware, abonoRoutes);
app.use("/api/detalle_abono", authMiddleware, detalle_abonos);
app.use("/api/proveedores", authMiddleware, proveedorRoutes);
app.use("/api/productos", authMiddleware, productoRoutes);
app.use("/api/ventas", authMiddleware, ventaRoutes);
app.use("/api/compras", authMiddleware, compraRoutes);
app.use("/api/caja", authMiddleware, cajaRoutes);
app.use("/api/devoluciones", authMiddleware, devolucionesRoutes);
app.use("/api/salidas_inventario", authMiddleware, salidasRoutes);
app.use("/api/excel", authMiddleware, reporteExcelRoutes);
app.use("/api/pdf", authMiddleware, reportePdfRoutes);

// Rutas administrativas protegidas (solo Administrador)
app.use("/api/usuarios", authMiddleware, requireRole("Administrador"), usuarioRoutes);
app.use("/api/mantenimiento", authMiddleware, requireRole("Administrador"), mantenimientoRoutes);
app.use("/api/reportes", authMiddleware, requireRole("Administrador"), reporteRoutes);
app.use("/api/bitacora", authMiddleware, requireRole("Administrador"), bitacoraRoutes);

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});