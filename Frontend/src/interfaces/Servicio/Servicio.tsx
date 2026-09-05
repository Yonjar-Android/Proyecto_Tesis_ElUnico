import "../Categoria/Categoria.css";
import { buscarServicios, crearServicio, actualizarServicio } from "../../services/servicio.service";
import { useEffect, useState } from "react";
import ModalAgregarServicio from "./ModalAgregarServicio";
import type { PaginatedResponse } from "../../models/PaginatedResponse";
import ModalEditarServicio from "./ModalEditarServicio";
import { SquarePen, HelpCircle } from 'lucide-react'
import { formatearMoneda } from "../FuncionAuxiliar";
import Notificacion, { type TipoNotificacion } from "../../components/Notification/Notification";
import { Joyride, type Step } from "react-joyride";


interface Servicio {
    id: number;
    Nombre_servicio: string;
    Descripcion: string | null;
    Precio: number;
}

function Servicio(){

const [servicios, setServicios] = useState<Servicio[]>([]);
const [currentPage, setCurrentPage] = useState(1);
const [perPage] = useState(7);
const [total, setTotal] = useState(0);
const [lastPage, setLastPage] = useState(1);

const [modalAbierto, setModalAbierto] = useState(false);

const [modalEditarAbierto, setModalEditarAbierto] = useState(false);

const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null);

const [searchTerm, setSearchTerm] = useState<string>("");

const [notif, setNotif] = useState<{ mensaje: string; tipo: TipoNotificacion } | null>(null);

    useEffect(() => { 
        console.log("hola");
      buscar();
    }, []);

 const [tourActivo, setTourActivo] = useState(false);

 const pasosTour: Step[] = [
  {
    target: '[data-tour="agregar-servicio"]',
    content: "Desde aquí abres una ventana para registrar un nuevo servicio.",
  },
  {
    target: '[data-tour="buscar-servicio"]',
    content: "Aquí puedes buscar servicios por su nombre.",
  },
  {
    target: '[data-tour="paginacion-servicio"]',
    content: "Con estos botones puedes navegar entre las páginas de servicios para buscar alguno que no aparezca en la lista actual.",
  },
];

const buscar = async () => {
  try {
          if (searchTerm.trim() === "") {
              const response: PaginatedResponse<Servicio> = await buscarServicios(
          searchTerm,
          currentPage,
          perPage
      );
  
        setServicios(response.data);
        setTotal(response.total);
        setLastPage(response.last_page);
              return;
          }
  
          const response: PaginatedResponse<Servicio> = await buscarServicios(
          searchTerm,
          currentPage,
          perPage
      );
  
        setServicios(response.data);
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
        <h1 className="categoria-title">Servicios</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="categoria-add-btn" onClick={() => setTourActivo(true)}>
            <HelpCircle size={18} />
          </button>
          <button className="categoria-add-btn"
          data-tour="agregar-servicio"
          onClick={() => setModalAbierto(true)}>
            <span className="categoria-add-icon">✦</span> Agregar servicio
          </button>
        </div>
      </div>

      <div className="categoria-table-container">
        <div className="categoria-search-wrapper" data-tour="buscar-servicio">
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
              <th className="categoria-th">NOMBRE DEL SERVICIO</th>
              <th className="categoria-th">DESCRIPCIÓN</th>
              <th className="categoria-th">PRECIO</th>
              <th className="categoria-th categoria-th-actions">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((servicio) => (
              <tr key={servicio.id} className="categoria-tr">
                <td className="categoria-td">{servicio.Nombre_servicio}</td>
                <td className="categoria-td">{servicio.Descripcion || "—"}</td>
                <td className="categoria-td">C${formatearMoneda(servicio.Precio) || "0"}</td>
                <td className="categoria-td categoria-td-actions">
                    <button
                        className="categoria-edit-btn"
                        onClick={() => {
                            setServicioSeleccionado(servicio);
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
              <td colSpan={4}>
                <div className="categoria-footer">
                  <span className="categoria-count">
                    Mostrando {servicios.length} de {total} servicios
                  </span>
                  <div className="categoria-pagination" data-tour="paginacion-servicio">
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

      <ModalAgregarServicio
      abierto={modalAbierto}
      onClose={() => setModalAbierto(false)}
      onGuardar={ async (nombre, descripcion, precio, setError) => {
        try{
          await crearServicio(nombre, descripcion, precio);

          setModalAbierto(false);
          buscar();
          setNotif({ mensaje: "Servicio creado correctamente", tipo: "exito" });
          return true;
        } catch(error: any){
          setNotif({ mensaje: "Ocurrió un error", tipo: "error" });
          setError(error.response.data.mensaje);
          return false;
        }
      }

      }
      />

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

      <ModalEditarServicio 
      abierto={modalEditarAbierto}
      servicio={servicioSeleccionado}
      onClose={() => {
        setModalEditarAbierto(false);
        setServicioSeleccionado(null)
      }}
      onEditar={async (id, nombre, descripcion, precio, setError) =>{
        try {
          await actualizarServicio(id, nombre, descripcion, precio);

          setModalEditarAbierto(false);

          buscar();
          setNotif({ mensaje: "Servicio actualizado correctamente", tipo: "exito" });
          return true;
        } catch(error: any){
          setNotif({ mensaje: "Ocurrió un error", tipo: "error" });
          setError(error.response.data.mensaje);
          return false;
        }
      }}
      />
    </div>
  );
}

export default Servicio;