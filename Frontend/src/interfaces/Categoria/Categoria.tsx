import "./Categoria.css";
import { buscarCategorias, crearCategoria, actualizarCategoria } from "../../services/categoria.service";
import { useEffect, useState } from "react";
import ModalAgregarCategoria from "./ModalAgregarCategoria";
import type { PaginatedResponse } from "../../models/PaginatedResponse";
import ModalEditarCategoria from "./ModalEditarCategoria";
import { SquarePen, HelpCircle } from 'lucide-react'
import Notificacion, { type TipoNotificacion } from "../../components/Notification/Notification";
import { Joyride, type Step } from "react-joyride";

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

const [notif, setNotif] = useState<{ mensaje: string; tipo: TipoNotificacion } | null>(null);

 const [tourActivo, setTourActivo] = useState(false);
 const pasosTour: Step[] = [
  {
    target: '[data-tour="agregar-categoria"]',
    content: "Desde aquí abres una ventana para registrar una nueva categoria.",
  },
  {
    target: '[data-tour="buscar-categoria"]',
    content: "Aquí puedes buscar categorias por su nombre.",
  },
  {
    target: '[data-tour="tabla-categoria"]',
    content: "Aquí puedes ver la lista de categorias registradas.",
  },
  {
    target: '[data-tour="paginacion-categoria"]',
    content: "Con estos botones puedes navegar entre las páginas de categorias para buscar alguna que no aparezca en la lista actual.",
  },
];

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
      {notif && (
                    <Notificacion
                      mensaje={notif.mensaje}
                      tipo={notif.tipo}
                      onCerrar={() => setNotif(null)}
                    />
                  )}
        <div className="categoria-content">
      <div className="categoria-top-part">
        <h1 className="categoria-title">Categorías</h1>

        <div style={{ display: "flex", gap: "8px" }}>
        <button className="categoria-add-btn" onClick={() => setTourActivo(true)}>
            <HelpCircle size={18} />
          </button>
        <button className="categoria-add-btn"
        data-tour="agregar-categoria"
        onClick={() => setModalAbierto(true)}>
          <span className="categoria-add-icon">✦</span> Agregar categoría
        </button>
        </div>
      </div>

      <div className="categoria-table-container">
        <div className="categoria-search-wrapper" data-tour="buscar-categoria">
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

        <table className="categoria-table" data-tour="tabla-categoria">
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
                    <button
                        className="categoria-edit-btn"
                        onClick={() => {
                            setCategoriaSeleccionada(categoria);
                            setModalEditarAbierto(true);
                       }}
                    >
                        <SquarePen size={24} /> Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>
                <div className="categoria-footer" data-tour="paginacion-categoria">
                  <span className="categoria-count">
                    Mostrando {categorias.length} de {total} categorías
                  </span>
                  <div className="categoria-pagination">
                    <button className="categoria-page-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>«</button>
                    <button className="categoria-page-btn" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>‹</button>
                    <button className="categoria-page-btn categoria-page-btn--active">{currentPage}</button>
                    <button className="categoria-page-btn" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === lastPage || lastPage == 0}>›</button>
                    <button className="categoria-page-btn" onClick={() => setCurrentPage(lastPage)} disabled={currentPage === lastPage || lastPage == 0}>»</button>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      </div>

                        <Joyride
  steps={pasosTour}
  run={tourActivo}
  continuous
  locale={{
    back: "Atrás",
    close: "Cerrar",
    last: "Finalizar",
    next: "Siguiente",
    skip: "Omitir",
  }}
  onEvent={(data) => {
    if (data.type === "tour:end") {
      setTourActivo(false);
    }
  }}
/>

      <ModalAgregarCategoria
      abierto={modalAbierto}
      onClose={() => setModalAbierto(false)}
      onGuardar={ async (nombre, setError) => {
        try{
          await crearCategoria(nombre);

          setModalAbierto(false);
          buscar();
          setNotif({ mensaje: "Categoría registrada correctamente", tipo: "exito" });
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
          setNotif({ mensaje: "Categoría actualizada correctamente", tipo: "exito" });
          return true;
        } catch(error: any){
          setNotif({ mensaje: "Ocurrió un error", tipo: "exito" });
          setError(error.response.data.mensaje);
          return false;
        }
      }}
      />
    </div>
  );
}

export default Categoria;