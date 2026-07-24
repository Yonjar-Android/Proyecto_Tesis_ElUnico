import "./Cliente.css"
import { crearCliente, actualizarCliente, buscarClientes } from "../../services/cliente.service";
import { useEffect, useState } from "react";
import type { PaginatedResponse } from "../../models/PaginatedResponse";
import ModalEditarCliente from "./ModalEditarCliente";
import ModalAgregarCliente from "./ModalAgregarCliente"

interface Cliente {

    id: number;
    Nombre: string;
    Apellido: string;
    Telefono: string; 
    Direccion: string;
    Credito: number;
    NCliente: number;

}

function Cliente(){

    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [lastPage, setLastPage] = useState(1);
    
    const [searchTerm, setSearchTerm] = useState<string>("");
    
    const [modalAbierto, setModalAbierto] = useState(false);
    
    const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
    
    const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
    
        useEffect(() => {
    
            buscar();
    
        }, []);
    
    
    const buscar = async () => {
        try {
            if (searchTerm.trim() === "") {
                const response: PaginatedResponse<Cliente> = await buscarClientes(
            searchTerm,
            currentPage,
            perPage
        );
    
          setClientes(response.data);
          setTotal(response.total);
          setLastPage(response.last_page);
                return;
            }
    
            const response: PaginatedResponse<Cliente> = await buscarClientes(
            searchTerm,
            currentPage,
            perPage
        );
    
          setClientes(response.data);
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
        <div className="marca-content">
      <div className="marca-top-part">
        <h1 className="marca-title">Clientes</h1>
        <button
    className="marca-add-btn"
    onClick={() => setModalAbierto(true)}
>
    <span className="marca-add-icon">✦</span>
    Agregar cliente
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
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="marca-tr">
                <td className="marca-td">{cliente.Nombre}</td>
                <td className="marca-td marca-td-actions">
                  <button
                        className="marca-edit-btn"
                        onClick={() => {
                            setClienteSeleccionado(cliente);
                            setModalEditarAbierto(true);
                       }}
                    >
                        ✏ Editar
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
                    Mostrando {clientes.length} de {total} clientes
                  </span>
                  <div className="marca-pagination">
                    <button className="marca-page-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                      «
                    </button>
                    <button className="marca-page-btn" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                      ‹
                    </button>
                    <button className="marca-page-btn marca-page-btn--active">{currentPage}</button>
                    <button className="marca-page-btn" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === lastPage}>
                      ›
                    </button>
                    <button className="marca-page-btn" onClick={() => setCurrentPage(lastPage)} disabled={currentPage === lastPage}>
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

          <ModalAgregarCliente
    abierto={modalAbierto}
    onClose={() => setModalAbierto(false)}
    onGuardar={async (nombre, apellido, telefono,
        direccion, credito, ncliente,
        setError) => {
    try {

        await crearCliente(
            nombre,apellido, telefono,
             direccion, credito, ncliente
        );

        setModalAbierto(false);
        buscar();

        return true;

    } catch (error: any) {

        setError(error.response.data.mensaje);

        return false;
    }
}}
      />

      <ModalEditarCliente
    abierto={modalEditarAbierto}
    cliente={clienteSeleccionado}
    onClose={() => {
        setModalEditarAbierto(false);
        setClienteSeleccionado(null);
    }}
    onEditar={async (id, nombre, apellido, telefono,
        direccion, credito, ncliente,        
        setError) => {

      try{
        await actualizarCliente(id, nombre, apellido,
            telefono, direccion, credito, ncliente
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

export default Cliente;
