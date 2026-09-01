import { useEffect, useState } from "react";
import "../Productos/ModalesSeleccion/ModalSeleccion.css";
import styles from "./ModalSeleccionarServicio.module.css";
import { buscarServicios } from "../../services/servicio.service";
import type { Servicio } from "../../models/Servicio";
import type { PaginatedResponse } from "../../models/PaginatedResponse";
import { formatearMoneda } from "../FuncionAuxiliar";

interface Props {
  abierto: boolean;
  onClose: () => void;
  onSeleccionar: (servicio: Servicio) => void;
}

function ModalSeleccionarServicio({ abierto, onClose, onSeleccionar }: Props) {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(6);
  const [lastPage, setLastPage] = useState(1);

  const buscar = async () => {
    try {
      const response: PaginatedResponse<Servicio> = await buscarServicios(
        searchTerm,
        currentPage,
        perPage
      );

      setServicios(response.data);
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
          <h2>Selección de Servicios</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="seleccion-body">
          <input
            className={styles.buscador}
            type="text"
            placeholder="Buscar por nombre de servicio..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />

          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Precio</th>
                <th className={styles.thAccion}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((servicio) => (
                <tr key={servicio.id}>
                  <td>
                    {servicio.Nombre_servicio}
                    {servicio.Descripcion && (
                      <span className={styles.descripcion}>
                        {servicio.Descripcion}
                      </span>
                    )}
                  </td>
                  <td>C${formatearMoneda(servicio.Precio)}</td>
                  <td className={styles.tdAccion}>
                    <button
                      className={styles.btn}
                      onClick={() => onSeleccionar(servicio)}
                    >
                      Seleccionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {servicios.length === 0 && (
            <div className={styles.vacio}>No se encontraron servicios.</div>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.count}>
            Mostrando {servicios.length} servicios
          </span>
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              «
            </button>
            <button
              className={styles.pageBtn}
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>
              {currentPage}
            </button>
            <button
              className={styles.pageBtn}
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === lastPage || lastPage === 0}
            >
              ›
            </button>
            <button
              className={styles.pageBtn}
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

export default ModalSeleccionarServicio;