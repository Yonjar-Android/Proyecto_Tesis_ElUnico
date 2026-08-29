import { crearMarca, buscarMarcas, actualizarMarca  } from "../../services/marca.service";
import { useEffect, useState } from "react";
import ModalAgregarMarca from "./ModalAgregarMarca";
import type { PaginatedResponse } from "../../models/PaginatedResponse";
import ModalEditarMarca from "./ModalEditarMarca";
import "./Marca.css";
import { SquarePen } from 'lucide-react'
import Notificacion, { type TipoNotificacion } from "../../components/Notification/Notification";

interface Marca {

    id: number;
    Nombre_marca: string;

}

function Marca() {

const [marcas, setMarcas] = useState<Marca[]>([]);
const [currentPage, setCurrentPage] = useState(1);
const [perPage] = useState(10);
const [total, setTotal] = useState(0);
const [lastPage, setLastPage] = useState(1);

const [searchTerm, setSearchTerm] = useState<string>("");

const [modalAbierto, setModalAbierto] = useState(false);

const [modalEditarAbierto, setModalEditarAbierto] = useState(false);

const [marcaSeleccionada, setMarcaSeleccionada] = useState<Marca | null>(null);

const [notif, setNotif] = useState<{ mensaje: string; tipo: TipoNotificacion } | null>(null);

    useEffect(() => {

        buscar();

    }, []);


const buscar = async () => {
    try {
        if (searchTerm.trim() === "") {
            const response: PaginatedResponse<Marca> = await buscarMarcas(
        searchTerm,
        currentPage,
        perPage
    );


      setMarcas(response.data);
      setTotal(response.total);
      setLastPage(response.last_page);
            return;
        }

        const response: PaginatedResponse<Marca> = await buscarMarcas(
        searchTerm,
        currentPage,
        perPage
    );

    console.log(response)

      setMarcas(response.data);
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
    <div className="marca-container">
      {notif && (
                    <Notificacion
                      mensaje={notif.mensaje}
                      tipo={notif.tipo}
                      onCerrar={() => setNotif(null)}
                    />
                  )}
        <div className="marca-content">
      <div className="marca-top-part">
        <h1 className="marca-title">Marcas</h1>
        <button
    className="marca-add-btn"
    onClick={() => setModalAbierto(true)}
>
    <span className="marca-add-icon">✦</span>
    Agregar marca
</button>
      </div>

      <div className="marca-table-container">
        <div className="marca-search-wrapper">
          <span className="marca-search-icon">🔍</span>
          <input
    className="marca-search-input"
    type="text"
    placeholder="Buscar por id o nombre"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    onKeyDown={handleKeyDown}
/>
        </div>

        <table className="marca-table">
          <thead>
            <tr>
              <th className="marca-th">NOMBRE DE MARCA</th>
              <th className="marca-th marca-th-actions">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {marcas.map((marca) => (
              <tr key={marca.id} className="marca-tr">
                <td className="marca-td">{marca.Nombre_marca}</td>
                <td className="marca-td marca-td-actions">
                    <button
                        className="marca-edit-btn"
                        onClick={() => {
                            setMarcaSeleccionada(marca);
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
                <div className="marca-footer">
                  <span className="marca-count">
                    Mostrando {marcas.length} de {total} marcas
                  </span>
                  <div className="marca-pagination">
                    <button className="marca-page-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                      «
                    </button>
                    <button className="marca-page-btn" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                      ‹
                    </button>
                    <button className="marca-page-btn marca-page-btn--active">{currentPage}</button>
                    <button className="marca-page-btn" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === lastPage || lastPage == 0}>
                      ›
                    </button>
                    <button className="marca-page-btn" onClick={() => setCurrentPage(lastPage)} disabled={currentPage === lastPage || lastPage == 0}>
                      »
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      </div>

          <ModalAgregarMarca
    abierto={modalAbierto}
    onClose={() => setModalAbierto(false)}
    onGuardar={async (nombre, setError) => {
    try {

        await crearMarca(nombre);

        setModalAbierto(false);
        buscar();
        setNotif({ mensaje: "Marca registrada correctamente", tipo: "exito" });
        return true;

    } catch (error: any) {
        setNotif({ mensaje: "Ocurrió un error", tipo: "error" });
        setError(error.response.data.mensaje);

        return false;
    }
}}
      />

      <ModalEditarMarca
    abierto={modalEditarAbierto}
    marca={marcaSeleccionada}
    onClose={() => {
        setModalEditarAbierto(false);
        setMarcaSeleccionada(null);
    }}
    onEditar={async (id, nombre, setError) => {

      try{
        await actualizarMarca(id, nombre);

        setModalEditarAbierto(false);
        setNotif({ mensaje: "Marca actualizada correctamente", tipo: "exito" });
        buscar();
        return true;
        } catch (error: any) {
            setError(error.response.data.mensaje);
            setNotif({ mensaje: "Ocurrió un error", tipo: "error" });
            return false;
        }
    }}
/>
    </div>
  );
}

export default Marca;