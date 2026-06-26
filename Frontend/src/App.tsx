import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Marca from "./interfaces/Marca/Marca";
import Categoria from "./interfaces/Categoria/Categoria";

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
      </nav>

      <Routes>
        <Route path="/" element={<Marca />} />
        <Route path="/categorias" element={<Categoria />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;