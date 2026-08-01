import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Marca from "./interfaces/Marca/Marca";
import Categoria from "./interfaces/Categoria/Categoria";
import Cliente from "./interfaces/Clientes/Cliente";
import Proveedor from "./interfaces/Proveedores/Proveedor";

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
      </nav>

      <Routes>
        <Route path="/" element={<Marca />} />
        <Route path="/categorias" element={<Categoria />} />
        <Route path="/clientes" element={<Cliente />} />
        <Route path="/proveedores" element={<Proveedor />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;