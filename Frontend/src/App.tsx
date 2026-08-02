import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Marca from "./interfaces/Marca/Marca";
import Categoria from "./interfaces/Categoria/Categoria";
import Cliente from "./interfaces/Clientes/Cliente";
import Proveedor from "./interfaces/Proveedores/Proveedor";
import Inventario from "./interfaces/Productos/Inventario";
import EditarProducto from "./interfaces/Productos/EditarProducto";
import CrearProducto from "./interfaces/Productos/CrearProducto";
import Facturacion from "./interfaces/Facturacion/Facturacion";
import Compras from "./interfaces/Compras/Compras";
import LoginElUnico from "./interfaces/IniciodeSesion/LoginElUnico";
import ReporteCuentasPorCobrar from "./interfaces/Reportes/ReporteCuentasPorCobrar/ReporteCuentasPorCobrar";
import ReporteStockProximoAgotarse from "./interfaces/Reportes/ReporteStockPromiAgotarse/ReporteStockBajo";

function App() {
  return (
    <BrowserRouter>

      <nav>
        <Link to="/marcas">
          <button>Marcas</button>
        </Link>

        <Link to="/categorias">
          <button>Categorías</button>
        </Link>

        <Link to="/clientes">
          <button>Clientes</button>
        </Link>

        <Link to="/proveedores">
          <button>Proveedores</button>
        </Link>

        <Link to="/inventario">
          <button>Inventario</button>
        </Link>

        <Link to="/facturacion">
          <button>Facturación</button>
        </Link>

        <Link to="/compras">
          <button>Compras</button>
        </Link>

        <Link to="/reportes/cuentas-por-cobrar">
          <button>Reporte Cuentas por Cobrar</button>
        </Link>

        <Link to="/reportes/stock-proximo-agotarse">
          <button>Reporte Stock Próximo a Agotarse</button>
        </Link>

      </nav>

      <Routes>
        <Route path="/" element={<LoginElUnico />} />
        <Route path="/marcas" element={<Marca />} />
        <Route path="/categorias" element={<Categoria />} />
        <Route path="/clientes" element={<Cliente />} />
        <Route path="/proveedores" element={<Proveedor />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/facturacion" element={<Facturacion />} />
        <Route path="/compras" element={<Compras />} />
        <Route path="/inventario/crear" element={<CrearProducto />} />
        <Route path="/inventario/editar/:id" element={<EditarProducto />} />

        // Reportes
        <Route path="/reportes/cuentas-por-cobrar" element={<ReporteCuentasPorCobrar />} />
        <Route path="/reportes/stock-proximo-agotarse" element={<ReporteStockProximoAgotarse />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;