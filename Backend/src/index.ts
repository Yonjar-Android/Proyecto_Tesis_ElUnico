import express from "express";
import { conectarDB } from "./config/database.js";
import marcaRoutes from "./routes/marca.routes.js";
import categoriaRoutes from "./routes/categoria.routes.js";
import clienteRoutes from "./routes/cliente.routes.js"
import detalle_abonos from "./routes/detalle_abono.routes.js"
import proveedorRoutes from "./routes/proveedor.routes.js"

import cors from "cors";

const app = express();

const PORT = 3000;

conectarDB();

app.use(cors());
app.use(express.json());

app.use("/api/marcas", marcaRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/detalle_abono", detalle_abonos)
app.use("/api/proveedores", proveedorRoutes);

app.listen(PORT, () => {

    console.log(`Servidor iniciado en http://localhost:${PORT}`);

});