import "./Categoria.css";
import { obtenerCategorias } from "../../services/categoria.service";
import { useEffect, useState } from "react";

interface Categoria {

    id: number;
    Nombre_categoria: string;

}


function Categoria(){


const [categorias, setCategorias] = useState<Categoria[]>([]);

    useEffect(() => { 
      cargarCategorias();
    }, []);

const cargarCategorias = async () => {
  try {
    const data = await obtenerCategorias();
    setCategorias(data);
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
};

    return (
    <div className="categoria-container">
        <div className="categoria-content">
      <div className="categoria-top-part">
        <h1 className="categoria-title">Categorías</h1>
        <button className="categoria-add-btn">
          <span className="categoria-add-icon">✦</span> Agregar categoría
        </button>
      </div>

      <div className="categoria-table-container">
        <div className="categoria-search-wrapper">
          <span className="categoria-search-icon">🔍</span>
          <input
            className="categoria-search-input"
            type="text"
            placeholder="Buscar por id o nombre"
          />
        </div>

        <table className="categoria-table">
          <thead>
            <tr>
              <th className="categoria-th">NOMBRE DE CATEGORIA</th>
              <th className="categoria-th categoria-th-actions">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((categoria) => (
              <tr key={categoria.id} className="categoria-tr">
                <td className="categoria-td">{categoria.Nombre_categoria}</td>
                <td className="categoria-td categoria-td-actions">
                  <button className="categoria-edit-btn">✏ Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>
                <div className="categoria-footer">
                  <span className="categoria-count">
                    Mostrando {categorias.length} de {categorias.length} categorías
                  </span>
                  <div className="categoria-pagination">
                    <button className="categoria-page-btn">«</button>
                    <button className="categoria-page-btn">‹</button>
                    <button className="categoria-page-btn categoria-page-btn--active">1</button>
                    <button className="categoria-page-btn">›</button>
                    <button className="categoria-page-btn">»</button>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      </div>
    </div>
  );
}

export default Categoria;