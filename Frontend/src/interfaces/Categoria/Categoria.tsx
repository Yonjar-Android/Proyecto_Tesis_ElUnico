import "./Categoria.css";
import { buscarCategorias, crearCategoria, actualizarCategoria } from "../../services/categoria.service";
import { useEffect, useState } from "react";
import ModalAgregarCategoria from "./ModalAgregarCategoria";
import type { PaginatedResponse } from "../../models/PaginatedResponse";
import ModalEditarCategoria from "./ModalEditarCategoria";

interface Categoria {

    id: number;
    Nombre_categoria: string;

}

function Categoria(){

const [categorias, setCategorias] = useState<Categoria[]>([]);
const [currentPage, setCurrentPage] = useState(1);
const [perPage] = useState(10);
const [total, setTotal] = useState(0);
const [lastPage, setLastPage] = useState(1);

const [modalAbierto, setModalAbierto] = useState(false);

const [modalEditarAbierto, setModalEditarAbierto] = useState(false);

const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);

const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => { 
      buscar();
    }, []);

const buscar = async () => {
  try {
          if (searchTerm.trim() === "") {
              const response: PaginatedResponse<Categoria> = await buscarCategorias(
          searchTerm,
          currentPage,
          perPage
      );
  
        setCategorias(response.data);
        setTotal(response.total);
        setLastPage(response.last_page);
              return;
          }
  
          const response: PaginatedResponse<Categoria> = await buscarCategorias(
          searchTerm,
          currentPage,
          perPage
      );
  
        setCategorias(response.data);
        setTotal(response.total);
        setLastPage(response.last_page);
      } catch (error) {
          console.error(error);
      }
};

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
        buscar();
    }
};


useEffect(() => {

    const timer = setTimeout(() => {
        buscar();
    }, 500);

    return () => clearTimeout(timer);

}, [searchTerm, currentPage]);

    return (
    <div className="categoria-container">
        <div className="categoria-content">
      <div className="categoria-top-part">
        <h1 className="categoria-title">Categorías</h1>
        <button className="categoria-add-btn"
        onClick={() => setModalAbierto(true)}>
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
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
                  <button className="categoria-edit-btn"
                  onClick={() => {
                            setCategoriaSeleccionada(categoria);
                            setModalEditarAbierto(true);
                       }}>
                    ✏ Editar
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>
                <div className="categoria-footer">
                  <span className="categoria-count">
                    Mostrando {categorias.length} de {total} categorías
                  </span>
                  <div className="categoria-pagination">
                    <button className="categoria-page-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>«</button>
                    <button className="categoria-page-btn" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>‹</button>
                    <button className="categoria-page-btn categoria-page-btn--active">{currentPage}</button>
                    <button className="categoria-page-btn" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === lastPage}>›</button>
                    <button className="categoria-page-btn" onClick={() => setCurrentPage(lastPage)} disabled={currentPage === lastPage}>»</button>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      </div>

      <ModalAgregarCategoria
      abierto={modalAbierto}
      onClose={() => setModalAbierto(false)}
      onGuardar={ async (nombre, setError) => {
        try{
          await crearCategoria(nombre);

          setModalAbierto(false);
          buscar();
          return true;
        } catch(error: any){
          setError(error.response.data.mensaje);
          return false;
        }
      }

      }
      />

      <ModalEditarCategoria 
      abierto={modalEditarAbierto}
      categoria={categoriaSeleccionada}
      onClose={() => {
        setModalEditarAbierto(false);
        setCategoriaSeleccionada(null)
      }}
      onEditar={async (id, nombre, setError) =>{
        try {
          await actualizarCategoria(id, nombre);

          setModalEditarAbierto(false);

          buscar();
          return true;
        } catch(error: any){

          setError(error.response.data.mensaje);
          return false;
        }
      }}
      />
    </div>
  );
}

export default Categoria;