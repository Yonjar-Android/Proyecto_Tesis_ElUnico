import "./Proveedor.css"
import { buscarProveedores, crearProveedor, actualizarProveedor } from "../../services/proveedor.service";
import { useEffect, useState } from "react";
import type { PaginatedResponse } from "../../models/PaginatedResponse";
import ModalAgregarProveedor from "./ModalAgregarProveedor";
import ModalEditarProveedor from "./ModalEditarProveedor";
import { SquarePen, HelpCircle } from "lucide-react";
import { formatearTelefono } from "../FuncionAuxiliar";
import Notificacion, { type TipoNotificacion } from "../../components/Notification/Notification";
import { Joyride, type Step } from "react-joyride";

interface Proveedor {

    id: number;
    Nombre_Empresa: string;
    Nombre_Contacto: string;
    Telefono: string;
    Direccion: string;
}

function Proveedor(){

  
// Tour de ayuda

const [tourActivo, setTourActivo] = useState(false);

const pasosTour: Step[] = [
  {
    target: '[data-tour="agregar-proveedor"]',
    content: "Desde aquí abres una ventana para registrar un nuevo proveedor.",
  },
  {
    target: '[data-tour="buscar-proveedor"]',
    content: "Aquí puedes buscar proveedores por razón social o contacto.",
  },
  {
    target: '[data-tour="tabla-proveedor"]',
    content: "En esta tabla se muestran todos los proveedores registrados.",
  },
  {
    target: '[data-tour="paginación-proveedor"]',
    content: "Con estos botones puedes navegar entre las páginas de proveedores para buscar alguno que no aparezca en la lista actual.",
  },
];

    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(7);
    const [total, setTotal] = useState(0);
    const [lastPage, setLastPage] = useState(1);
    
    const [searchTerm, setSearchTerm] = useState<string>("");
    
    const [modalAbierto, setModalAbierto] = useState(false);
    
    const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
    
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
    const [notif, setNotif] = useState<{ mensaje: string; tipo: TipoNotificacion } | null>(null);

        useEffect(() => {
    
            buscar();
    
        }, []);
    
    const buscar = async () => {
        try {
            if (searchTerm.trim() === "") {
                const response: PaginatedResponse<Proveedor> = await buscarProveedores(
            searchTerm,
            currentPage,
            perPage
        );
    
          setProveedores(response.data);
          setTotal(response.total);
          setLastPage(response.last_page);
                return;
            }
    
            const response: PaginatedResponse<Proveedor> = await buscarProveedores(
            searchTerm,
            currentPage,
            perPage
        );
    
          setProveedores(response.data);
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
    <div className="proveedor-container">
      {notif && (
                    <Notificacion
                      mensaje={notif.mensaje}
                      tipo={notif.tipo}
                      onCerrar={() => setNotif(null)}
                    />
                  )}
        <div className="proveedor-content">
<div className="proveedor-top-part">
        <h1 className="proveedor-title">Proveedores</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="proveedor-add-btn" onClick={() => setTourActivo(true)}>
  <HelpCircle size={18} />
</button>
          <button
              className="proveedor-add-btn"
              data-tour="agregar-proveedor"
              onClick={() => setModalAbierto(true)}
          >
              <span className="proveedor-add-icon">✦</span>
              Agregar proveedor
          </button>
        </div>
      </div>

      <div className="proveedor-table-container">
        <div className="proveedor-search-wrapper" data-tour="buscar-proveedor">
          <span className="proveedor-search-icon">🔍</span>
          <input
    className="proveedor-search-input"
    type="text"
    placeholder="Buscar por Razón Social o Contacto"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    onKeyDown={handleKeyDown}
/>
        </div>

        <table className="proveedor-table" data-tour="tabla-proveedor">
          <thead>
            <tr>
              <th className="proveedor-th">RAZÓN SOCIAL</th>
              <th className="proveedor-th">NOMBRE CONTACTO</th>
              <th className="proveedor-th">TELÉFONO</th>
              <th className="proveedor-th">DIRECCIÓN</th>
              <th className="proveedor-th proveedor-th-actions">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((proveedor) => (
              <tr key={proveedor.id} className="proveedor-tr">
                <td className="proveedor-td">{proveedor.Nombre_Empresa}</td>
                <td className="proveedor-td">{proveedor.Nombre_Contacto}</td>
                <td className="proveedor-td">
                {proveedor.Telefono.trim() === "" ? "Sin contacto" : formatearTelefono(proveedor.Telefono)}
                </td>
                <td className="proveedor-td">
                    {proveedor.Direccion?.trim() ? proveedor.Direccion : "Sin dirección"}
                </td>
                <td className="proveedor-td proveedor-td-actions">

                  <button
                        className="proveedor-editar-btn"
                        onClick={() => {
                            setProveedorSeleccionado(proveedor);
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
              <td colSpan={6}>
                <div className="proveedor-footer">
                  <span className="proveedor-count">
                    Mostrando {proveedores.length} de {total} proveedores
                  </span>
                  <div className="proveedor-pagination" data-tour="paginación-proveedor">
                    <button className="proveedor-page-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                      «
                    </button>
                    <button className="proveedor-page-btn" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                      ‹
                    </button>
                    <button className="proveedor-page-btn proveedor-page-btn--active">{currentPage}</button>
                    <button className="proveedor-page-btn" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === lastPage || lastPage == 0}>
                      ›
                    </button>
                    <button className="proveedor-page-btn" onClick={() => setCurrentPage(lastPage)} disabled={currentPage === lastPage || lastPage == 0}>
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

      <ModalAgregarProveedor 
      abierto={modalAbierto}
      onClose={() => setModalAbierto(false)}
      onGuardar={ async(empresa, contacto, telefono, direccion,
        setError
      ) => {
        try{

            await crearProveedor(
                empresa, contacto, telefono,
                direccion
            );

            setModalAbierto(false);
            buscar();
            setNotif({ mensaje: "Proveedor registrado correctamente", tipo: "exito" });
            return true
        } catch(error: any){
            setError(error.response.data.mensaje)
            setNotif({ mensaje: "Ocurrió un error", tipo: "error" });
            return false;
        }
      }}
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

      <ModalEditarProveedor
    abierto={modalEditarAbierto}
    proveedor={proveedorSeleccionado}
    onClose={() => {
        setModalEditarAbierto(false);
        setProveedorSeleccionado(null);
    }}
    onEditar={
      async (id, empresa, contacto, telefono, direccion,     
        setError) => {

      try{

        await actualizarProveedor(Number(id), empresa, contacto,
            telefono, direccion
        );

        setModalEditarAbierto(false);
        buscar();
        setNotif({ mensaje: "Proveedor actualizado correctamente", tipo: "exito" });
        return true;
        } catch (error: any) {
            setNotif({ mensaje: "Ocurrió un error", tipo: "error" });
            setError(error.response.data.mensaje);
            return false;
        }
    }}
/>
    </div>
  );
}

export default Proveedor;
