import "./Cliente.css"
import { crearCliente, actualizarCliente, buscarClientes } from "../../services/cliente.service";
import { useEffect, useState } from "react";
import type { PaginatedResponse } from "../../models/PaginatedResponse";
import ModalEditarCliente from "./ModalEditarCliente";
import ModalAgregarCliente from "./ModalAgregarCliente"
import ModalAbonarCliente from "./ModalAbonarCliente";
import { crearDetalleAbono } from "../../services/detalle_abono.service";
import { SquarePen, CreditCard } from "lucide-react";
import { formatearMoneda, formatearTelefono } from "../FuncionAuxiliar"
import Notificacion, { type TipoNotificacion } from "../../components/Notification/Notification";

interface Cliente {

    id: number;
    Nombre: string;
    Apellido: string;
    Telefono: string; 
    Direccion: string;
    Saldo_Deuda: number;
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

    const [modalAbonarAbierto, setModalAbonarAbierto] = useState(false);
    
    const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

    const [notif, setNotif] = useState<{ mensaje: string; tipo: TipoNotificacion } | null>(null);
    
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
    <div className="cliente-container">
      {notif && (
                    <Notificacion
                      mensaje={notif.mensaje}
                      tipo={notif.tipo}
                      onCerrar={() => setNotif(null)}
                    />
                  )}
        <div className="cliente-content">
      <div className="cliente-top-part">
        <h1 className="cliente-title">Clientes</h1>
        <button
    className="cliente-add-btn"
    onClick={() => setModalAbierto(true)}
>
    <span className="cliente-add-icon">✦</span>
    Agregar cliente
</button>
      </div>

      <div className="cliente-table-container">
        <div className="cliente-search-wrapper">
          <span className="cliente-search-icon">🔍</span>
          <input
    className="cliente-search-input"
    type="text"
    placeholder="Buscar por id o nombre"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    onKeyDown={handleKeyDown}
/>
        </div>

        <table className="cliente-table">
          <thead>
            <tr>
              <th className="cliente-th">CÓDIGO</th>
              <th className="cliente-th">NOMBRE</th>
              <th className="cliente-th">APELLIDO</th>
              <th className="cliente-th">CONTACTO</th>
              <th className="cliente-th">CRÉDITO</th>
              <th className="cliente-th cliente-th-actions">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="cliente-tr">
                <td className="cliente-td">{cliente.NCliente}</td>
                <td className="cliente-td">{cliente.Nombre}</td>
                <td className="cliente-td">{cliente.Apellido}</td>
                <td className="cliente-td">
                {formatearTelefono(cliente.Telefono.trim()) === "" ? "Sin contacto" : formatearTelefono(cliente.Telefono)}
                </td>
                <td className="cliente-td">{formatearMoneda(cliente.Saldo_Deuda)}</td>
                <td className="cliente-td cliente-td-actions">

                  <button
                        className="cliente-abonar-btn"
                        onClick={() => {
                            setClienteSeleccionado(cliente);
                            setModalAbonarAbierto(true);
                       }}
                       disabled={cliente.Saldo_Deuda == 0}
                    >
                        <CreditCard size={24} /> Abonar
                  </button>

                  <button
                        className="cliente-editar-btn"
                        onClick={() => {
                            setClienteSeleccionado(cliente);
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
                <div className="cliente-footer">
                  <span className="cliente-count">
                    Mostrando {clientes.length} de {total} clientes
                  </span>
                  <div className="cliente-pagination">
                    <button className="cliente-page-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                      «
                    </button>
                    <button className="cliente-page-btn" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                      ‹
                    </button>
                    <button className="cliente-page-btn cliente-page-btn--active">{currentPage}</button>
                    <button className="cliente-page-btn" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === lastPage || lastPage == 0}>
                      ›
                    </button>
                    <button className="cliente-page-btn" onClick={() => setCurrentPage(lastPage)} disabled={currentPage === lastPage || lastPage == 0}>
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
        direccion, saldo_deuda, ncliente,
        setError) => {
    try {

        await crearCliente(
            nombre,apellido, telefono,
             direccion, saldo_deuda, ncliente
        );

        setModalAbierto(false);
        buscar();
        setNotif({ mensaje: "Cliente registrado correctamente", tipo: "exito" });
        return true;

    } catch (error: any) {
      setNotif({ mensaje: "Ocurrió un error", tipo: "error" });
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
    onEditar={
      async (id, nombre, apellido, telefono,
        direccion, saldo_deuda, ncliente,        
        setError) => {

      try{

        await actualizarCliente(Number(id), nombre, apellido,
            telefono, direccion, saldo_deuda, ncliente
        );

        setModalEditarAbierto(false);
        buscar();
        setNotif({ mensaje: "Cliente actualizado correctamente", tipo: "exito" });
        return true;
        } catch (error: any) {
            setNotif({ mensaje: "Ocurrió un error correctamente", tipo: "error" });
            setError(error.response.data.mensaje);
            return false;
        }
    }}
/>

<ModalAbonarCliente
abierto={modalAbonarAbierto}
cliente={clienteSeleccionado}
onClose={() => {
        setModalAbonarAbierto(false);
        setClienteSeleccionado(null);
    }}
onAbonar={ async (id_cliente:number, monto:number, notas:string, setError) => {
  try{

        await crearDetalleAbono(
          id_cliente,
          Number(monto),
          notas
        );

        setModalAbonarAbierto(false);
        buscar();
        setNotif({ mensaje: "Abono registrado correctamente", tipo: "exito" });
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

export default Cliente;
