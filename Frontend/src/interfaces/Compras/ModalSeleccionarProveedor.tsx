import { useEffect, useState } from "react";
import "../Productos/ModalesSeleccion/ModalSeleccion.css";
import IconoCubo from "../Productos/ModalesSeleccion/IconoCubo";
import { buscarProveedores } from "../../services/proveedor.service";
import type { Proveedor } from "../../models/Proveedor";
import type { PaginatedResponse } from "../../models/PaginatedResponse";

interface Props {
  abierto: boolean;
  onClose: () => void;
  onSeleccionar: (proveedor: Proveedor) => void;
}

function ModalSeleccionarProveedor({ abierto, onClose, onSeleccionar }: Props) {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(6);
  const [lastPage, setLastPage] = useState(1);

  const buscar = async () => {
    try {
      const response: PaginatedResponse<Proveedor> = await buscarProveedores(
        searchTerm,
        currentPage,
        perPage
      );

      setProveedores(response.data);
      setLastPage(response.last_page);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!abierto) return;

    const timer = setTimeout(() => {
      buscar();
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, currentPage, abierto]);

  // Reinicia la búsqueda cada vez que se abre el modal.
  useEffect(() => {
    if (abierto) {
      setSearchTerm("");
      setCurrentPage(1);
    }
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div className="modal-overlay">
      <div className="modal seleccion-modal">
        <div className="modal-header">
          <h2>
            <IconoCubo />
            Selección de proveedor
          </h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="seleccion-body">
          <input
            className="seleccion-buscador"
            type="text"
            placeholder="Buscar por nombre, código..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />

          <table className="seleccion-tabla">
            <thead>
              <tr>
                <th>Razón Social</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th className="seleccion-th-accion">Acción</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((proveedor) => (
                <tr key={proveedor.id}>
                  <td>{proveedor.Nombre_Empresa}</td>
                  <td>{proveedor.Direccion}</td>
                  <td>{proveedor.Telefono}</td>
                  <td className="seleccion-td-accion">
                    <button
                      className="seleccion-btn"
                      onClick={() => onSeleccionar(proveedor)}
                    >
                      Seleccionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {proveedores.length === 0 && (
            <div className="seleccion-vacio">No se encontraron proveedores.</div>
          )}
        </div>

        <div className="seleccion-footer">
          <span className="seleccion-count">Mostrando {proveedores.length} proveedores</span>
          <div className="seleccion-pagination">
            <button
              className="seleccion-page-btn"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              «
            </button>
            <button
              className="seleccion-page-btn"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            <button className="seleccion-page-btn seleccion-page-btn--active">
              {currentPage}
            </button>
            <button
              className="seleccion-page-btn"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === lastPage || lastPage === 0}
            >
              ›
            </button>
            <button
              className="seleccion-page-btn"
              onClick={() => setCurrentPage(lastPage)}
              disabled={currentPage === lastPage || lastPage === 0}
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalSeleccionarProveedor;