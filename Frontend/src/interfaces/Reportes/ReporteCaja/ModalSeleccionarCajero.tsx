import { useEffect, useState } from "react";
import "../../Productos/ModalesSeleccion/ModalSeleccion.css";
import { UserCheck, Search, Users } from "lucide-react";
import { obtenerUsuarios } from "../../../services/usuario.service";

export interface CajeroOption {
  id: number;
  Nombre_Usuario: string;
  Correo?: string;
  Nombre_rol?: string;
}

interface Props {
  abierto: boolean;
  onClose: () => void;
  onSeleccionar: (cajero: CajeroOption) => void;
}

export default function ModalSeleccionarCajero({ abierto, onClose, onSeleccionar }: Props) {
  const [usuarios, setUsuarios] = useState<CajeroOption[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    cargarUsuarios();
  }, [abierto]);

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const data = await obtenerUsuarios();
      if (Array.isArray(data)) {
        setUsuarios(data);
      } else if (data && Array.isArray(data.usuarios)) {
        setUsuarios(data.usuarios);
      }
    } catch (error) {
      console.error("Error al cargar cajeros:", error);
    } finally {
      setCargando(false);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = busqueda.toLowerCase().trim();
    if (!texto) return true;
    return (
      (u.Nombre_Usuario && u.Nombre_Usuario.toLowerCase().includes(texto)) ||
      (u.Correo && u.Correo.toLowerCase().includes(texto)) ||
      (u.Nombre_rol && u.Nombre_rol.toLowerCase().includes(texto)) ||
      String(u.id).includes(texto)
    );
  });

  if (!abierto) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal seleccion-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Users size={22} style={{ marginRight: 8 }} />
            Selección de Cajero / Usuario
          </h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="seleccion-body">
          <div style={{ position: "relative", marginBottom: "1rem" }}>
            <input
              className="seleccion-buscador"
              type="text"
              placeholder="Buscar cajero por nombre, rol o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              autoFocus
            />
            <Search
              size={18}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                pointerEvents: "none",
              }}
            />
          </div>

          <table className="seleccion-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre de Usuario</th>
                <th>Rol</th>
                <th>Correo</th>
                <th className="seleccion-th-accion">Acción</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "1.5rem" }}>
                    Cargando lista de cajeros...
                  </td>
                </tr>
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "1.5rem" }}>
                    No se encontraron usuarios o cajeros con ese criterio.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td style={{ fontWeight: 600 }}>{u.Nombre_Usuario}</td>
                    <td>
                      <span
                        style={{
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                        }}
                      >
                        {u.Nombre_rol || "Usuario"}
                      </span>
                    </td>
                    <td style={{ color: "#64748b" }}>{u.Correo || "---"}</td>
                    <td className="seleccion-td-accion">
                      <button
                        className="seleccion-btn"
                        onClick={() => onSeleccionar(u)}
                        title="Seleccionar este cajero"
                      >
                        <UserCheck size={16} style={{ marginRight: 4, verticalAlign: "middle" }} />
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
