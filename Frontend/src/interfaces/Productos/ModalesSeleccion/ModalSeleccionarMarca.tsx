import { useEffect, useState } from "react";
import "./ModalSeleccion.css";
import IconoCubo from "./IconoCubo";
import { buscarMarcas } from "../../../services/marca.service";
import type { PaginatedResponse } from "../../../models/PaginatedResponse";

interface Marca {
  id: number;
  Nombre_marca: string;
}

interface Props {
  abierto: boolean;
  onClose: () => void;
  onSeleccionar: (marca: Marca) => void;
}

function ModalSeleccionarMarca({ abierto, onClose, onSeleccionar }: Props) {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(6);
  const [lastPage, setLastPage] = useState(1);

  const buscar = async () => {
    try {
      const response: PaginatedResponse<Marca> = await buscarMarcas(
        searchTerm,
        currentPage,
        perPage
      );

      setMarcas(response.data);
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
            Selección de marcas
          </h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="seleccion-body">
          <input
            className="seleccion-buscador"
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />

          <table className="seleccion-tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th className="seleccion-th-accion">Acción</th>
              </tr>
            </thead>
            <tbody>
              {marcas.map((marca) => (
                <tr key={marca.id}>
                  <td>{marca.Nombre_marca}</td>
                  <td className="seleccion-td-accion">
                    <button className="seleccion-btn" onClick={() => onSeleccionar(marca)}>
                      Seleccionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {marcas.length === 0 && (
            <div className="seleccion-vacio">No se encontraron marcas.</div>
          )}
        </div>

        <div className="seleccion-footer">
          <span className="seleccion-count">Mostrando {marcas.length} marcas</span>
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

export default ModalSeleccionarMarca;