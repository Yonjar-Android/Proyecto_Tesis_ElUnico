import { useState, useEffect } from "react";
import "./Bitacora.css";
import { obtenerBitacora, type RegistroBitacoraDTO } from "../../services/bitacora.service";
import { Search, ShieldAlert, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

export default function Bitacora() {
  const [registros, setRegistros] = useState<RegistroBitacoraDTO[]>([]);
  const [cargando, setCargando] = useState(false);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [ultimaPagina, setUltimaPagina] = useState(1);

  const [search, setSearch] = useState("");
  const [modulo, setModulo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const cargarDatos = async (pag = pagina) => {
    setCargando(true);
    try {
      const resp = await obtenerBitacora(search, modulo, fechaInicio, fechaFin, pag, 20);
      setRegistros(resp.data || []);
      setTotal(resp.total || 0);
      setPagina(resp.current_page || 1);
      setUltimaPagina(resp.last_page || 1);
    } catch (error) {
      console.error("Error al cargar bitácora:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos(1);
  }, []);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    cargarDatos(1);
  };

  const formatearFechaHora = (iso: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleString("es-NI", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="bitacora-container">
      <div className="bitacora-titulo-wrap">
        <div>
          <h1 className="bitacora-titulo">Bitácora de Auditoría del Sistema</h1>
          <div className="bitacora-subtitulo">
            Registro inmutable de actividades y trazabilidad de acciones por usuario.
          </div>
        </div>
        <button
          className="bitacora-btn-buscar"
          onClick={() => cargarDatos(pagina)}
          disabled={cargando}
          title="Actualizar registros"
        >
          <RefreshCw size={16} className={cargando ? "spin" : ""} /> Actualizar
        </button>
      </div>

      <form className="bitacora-filtros" onSubmit={handleBuscar}>
        <input
          type="text"
          className="bitacora-input-search"
          placeholder="Buscar por usuario, acción o detalles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="bitacora-select"
          value={modulo}
          onChange={(e) => setModulo(e.target.value)}
        >
          <option value="">Todos los módulos</option>
          <option value="Seguridad">Seguridad / Autenticación</option>
          <option value="Caja">Caja</option>
          <option value="Ventas">Ventas</option>
          <option value="Usuarios">Usuarios</option>
          <option value="Mantenimiento">Mantenimiento</option>
        </select>

        <input
          type="date"
          className="bitacora-date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          title="Fecha de inicio"
        />

        <input
          type="date"
          className="bitacora-date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          title="Fecha de fin"
        />

        <button type="submit" className="bitacora-btn-buscar" disabled={cargando}>
          <Search size={16} /> Filtrar
        </button>
      </form>

      <div className="bitacora-table-wrap">
        <table className="bitacora-table">
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Módulo</th>
              <th>Acción Realizada</th>
              <th>Detalles</th>
              <th>Dirección IP</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                  Cargando registros de auditoría...
                </td>
              </tr>
            ) : registros.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                  <ShieldAlert size={28} style={{ marginBottom: "6px", display: "inline-block", color: "#94a3b8" }} />
                  <div>No se encontraron registros de auditoría con los filtros aplicados.</div>
                </td>
              </tr>
            ) : (
              registros.map((reg) => (
                <tr key={reg.id}>
                  <td style={{ whiteSpace: "nowrap", fontWeight: 600 }}>{formatearFechaHora(reg.fecha_hora)}</td>
                  <td>
                    <strong>{reg.usuario}</strong>
                  </td>
                  <td>
                    <span
                      className={`bitacora-badge-rol ${
                        reg.rol === "Administrador" ? "bitacora-badge-admin" : ""
                      }`}
                    >
                      {reg.rol}
                    </span>
                  </td>
                  <td>
                    <span className="bitacora-modulo-tag">{reg.modulo}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: "#1e293b" }}>{reg.accion}</span>
                  </td>
                  <td style={{ maxWidth: 360, wordBreak: "break-word" }}>{reg.detalles || "-"}</td>
                  <td style={{ color: "#64748b", fontFamily: "monospace", fontSize: 12 }}>
                    {reg.ip || "127.0.0.1"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bitacora-paginacion">
        <span style={{ fontSize: 13, color: "#64748b" }}>
          Total: <strong>{total}</strong> registros registrados en auditoría | Página <strong>{pagina}</strong> de <strong>{ultimaPagina}</strong>
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="bitacora-btn-pag"
            disabled={pagina <= 1 || cargando}
            onClick={() => cargarDatos(pagina - 1)}
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <button
            className="bitacora-btn-pag"
            disabled={pagina >= ultimaPagina || cargando}
            onClick={() => cargarDatos(pagina + 1)}
          >
            Siguiente <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
