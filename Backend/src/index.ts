import express from "express";
import dotenv from "dotenv";
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
import cors from "cors";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 3000;

conectarDB();

app.use(cors());
app.use(express.json());

app.use("/api/marcas", marcaRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/detalle_abono", detalle_abonos)
app.use("/api/proveedores", proveedorRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/ventas", ventaRoutes);
app.use("/api/compras", compraRoutes);
app.use("/api/caja", cajaRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/reportes", reporteRoutes)

app.listen(PORT, () => {

    console.log(`Servidor iniciado en http://localhost:${PORT}`);

});