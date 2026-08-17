import express from "express";
//import dotenv from "dotenv";
import { conectarDB } from "./config/database.js";
import marcaRoutes from "./routes/marca.routes.js";
import categoriaRoutes from "./routes/categoria.routes.js";
import clienteRoutes from "./routes/cliente.routes.js";
import detalle_abonos from "./routes/detalle_abono.routes.js";
import proveedorRoutes from "./routes/proveedor.routes.js";
import productoRoutes from "./routes/producto.routes.js";
import ventaRoutes from "./routes/venta.routes.js";
import authRoutes from "./routes/auth.routes.js";
import compraRoutes from "./routes/compra.routes.js";
import reporteRoutes from "./routes/reporte.routes.js";
import cajaRoutes from "./routes/caja.routes.js";
import servicioRoutes from "./routes/service.routes.js"
import cors from "cors";
import { authMiddleware } from "./authMiddleware/authMiddleware.js";
import usuarioRoutes from "./routes/usuario.routes.js";

//dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 3000;

conectarDB();

app.use(cors());
app.use(express.json());

// Rutas públicas
app.use("/api/servicios", authMiddleware, servicioRoutes);
app.use("/api/auth", authRoutes)

// Rutas protegidas
app.use("/api/marcas", authMiddleware, marcaRoutes);
app.use("/api/categorias", authMiddleware, categoriaRoutes);
app.use("/api/clientes", authMiddleware, clienteRoutes);
app.use("/api/detalle_abono", authMiddleware, detalle_abonos);
app.use("/api/proveedores", authMiddleware, proveedorRoutes);
app.use("/api/productos", authMiddleware, productoRoutes);
app.use("/api/ventas", authMiddleware, ventaRoutes);
app.use("/api/compras", authMiddleware, compraRoutes);
app.use("/api/caja", authMiddleware, cajaRoutes);
app.use("/api/reportes", authMiddleware, reporteRoutes);
app.use("/api/usuarios", authMiddleware, usuarioRoutes);

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});