import "./Proveedor.css"
import { buscarProveedores, crearProveedor, actualizarProveedor } from "../../services/proveedor.service";
import { useEffect, useState } from "react";
import type { PaginatedResponse } from "../../models/PaginatedResponse";
import ModalAgregarProveedor from "./ModalAgregarProveedor";
import ModalEditarProveedor from "./ModalEditarProveedor";
import { SquarePen } from "lucide-react";
import { formatearTelefono } from "../FuncionAuxiliar";

interface Proveedor {

    id: number;
    Nombre_Empresa: string;
    Nombre_Contacto: string;
    Telefono: string;
    Direccion: string;
}

function Proveedor(){

    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [lastPage, setLastPage] = useState(1);
    
    const [searchTerm, setSearchTerm] = useState<string>("");
    
    const [modalAbierto, setModalAbierto] = useState(false);
    
    const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
    
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
    
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
        <div className="proveedor-content">
      <div className="proveedor-top-part">
        <h1 className="proveedor-title">Proveedores</h1>
        <button
    className="proveedor-add-btn"
    onClick={() => setModalAbierto(true)}
>
    <span className="proveedor-add-icon">✦</span>
    Agregar proveedor
</button>
      </div>

      <div className="proveedor-table-container">
        <div className="proveedor-search-wrapper">
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

        <table className="proveedor-table">
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
                  <div className="proveedor-pagination">
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

            return true
        } catch(error: any){
            setError(error.response.data.mensaje)

            return false;
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
        return true;
        } catch (error: any) {
            
            setError(error.response.data.mensaje);
            return false;
        }
    }}
/>
    </div>
  );
}

export default Proveedor;
