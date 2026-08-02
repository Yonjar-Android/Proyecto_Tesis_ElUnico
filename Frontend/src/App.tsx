import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Marca from "./interfaces/Marca/Marca";
import Categoria from "./interfaces/Categoria/Categoria";
import Cliente from "./interfaces/Clientes/Cliente";
import Proveedor from "./interfaces/Proveedores/Proveedor";
import Inventario from "./interfaces/Productos/Inventario";
import EditarProducto from "./interfaces/Productos/EditarProducto";
import CrearProducto from "./interfaces/Productos/CrearProducto";
import Facturacion from "./interfaces/Facturacion/Facturacion";

function App() {
  return (
    <BrowserRouter>

      <nav>
        <Link to="/">
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

      </nav>

      <Routes>
        <Route path="/" element={<Marca />} />
        <Route path="/categorias" element={<Categoria />} />
        <Route path="/clientes" element={<Cliente />} />
        <Route path="/proveedores" element={<Proveedor />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/facturacion" element={<Facturacion />} />
        <Route path="/inventario/crear" element={<CrearProducto />} />
        <Route path="/inventario/editar/:id" element={<EditarProducto />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;