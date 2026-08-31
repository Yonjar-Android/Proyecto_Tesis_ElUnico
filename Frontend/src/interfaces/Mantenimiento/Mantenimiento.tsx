import { useEffect, useRef, useState } from "react";
import { Database, Upload, CheckCircle2, XCircle } from "lucide-react";
import {
  listarRespaldos,
  crearRespaldo,
  descargarRespaldo,
  eliminarRespaldo,
  restaurarDesdeArchivo,
  restaurarDesdeHistorial,
  type RespaldoBD,
} from "../../services/mantenimiento.service";
import "./Mantenimiento.css";

function formatearFecha(fechaIso: string) {
  const fecha = new Date(fechaIso);
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  const horas = String(fecha.getHours()).padStart(2, "0");
  const minutos = String(fecha.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${anio} - ${horas}:${minutos}`;
}

function formatearTamano(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function Mantenimiento() {
  const [respaldos, setRespaldos] = useState<RespaldoBD[]>([]);
  const [cargando, setCargando] = useState(true);
  const [creandoRespaldo, setCreandoRespaldo] = useState(false);
  const [restaurando, setRestaurando] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const inputArchivoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    cargarHistorial();
  }, []);

  async function cargarHistorial() {
    setCargando(true);
    try {
      const data = await listarRespaldos();
      setRespaldos(data);
    } catch (err) {
      console.error("Error al cargar el historial de respaldos:", err);
      setError("No se pudo cargar el historial de respaldos.");
    } finally {
      setCargando(false);
    }
  }

  const ultimoRespaldoExitoso = respaldos.find((r) => r.estado === "Exitoso");

  async function handleCrearRespaldo() {
    setError("");
    setMensajeExito("");
    setCreandoRespaldo(true);
    try {
      await crearRespaldo();
      setMensajeExito("Respaldo creado correctamente.");
      await cargarHistorial();
    } catch (err: any) {
      setError(err?.response?.data?.mensaje ?? "Error al crear el respaldo.");
    } finally {
      setCreandoRespaldo(false);
    }
  }

  function handleAbrirSelectorArchivo() {
    inputArchivoRef.current?.click();
  }

  async function handleArchivoSeleccionado(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;

    const confirmado = window.confirm(
      `¿Restaurar la base de datos desde "${archivo.name}"? Esto reemplazará los datos actuales y no se puede deshacer.`
    );
    if (!confirmado) return;

    setError("");
    setMensajeExito("");
    setRestaurando(true);
    try {
      await restaurarDesdeArchivo(archivo);
      setMensajeExito("Base de datos restaurada correctamente.");
    } catch (err: any) {
      setError(err?.response?.data?.mensaje ?? "Error al restaurar la base de datos.");
    } finally {
      setRestaurando(false);
    }
  }

  async function handleRestaurarDesdeHistorial(id: number, nombreArchivo: string) {
    const confirmado = window.confirm(
      `¿Restaurar la base de datos usando el respaldo "${nombreArchivo}"? Esto reemplazará los datos actuales y no se puede deshacer.`
    );
    if (!confirmado) return;

    setError("");
    setMensajeExito("");
    setRestaurando(true);
    try {
      await restaurarDesdeHistorial(id);
      setMensajeExito("Base de datos restaurada correctamente.");
    } catch (err: any) {
      setError(err?.response?.data?.mensaje ?? "Error al restaurar la base de datos.");
    } finally {
      setRestaurando(false);
    }
  }

  async function handleDescargar(id: number, nombreArchivo: string) {
    try {
      await descargarRespaldo(id, nombreArchivo);
    } catch (err) {
      console.error("Error al descargar el respaldo:", err);
      setError("No se pudo descargar el respaldo.");
    }
  }

  async function handleEliminar(id: number) {
    const confirmado = window.confirm("¿Eliminar este respaldo? Esta acción no se puede deshacer.");
    if (!confirmado) return;

    try {
      await eliminarRespaldo(id);
      setRespaldos((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error al eliminar el respaldo:", err);
      setError("No se pudo eliminar el respaldo.");
    }
  }

  return (
    <div className="mantenimiento-container">
      <h1 className="mantenimiento-titulo">Mantenimiento</h1>

      <div className="mantenimiento-card mantenimiento-acciones-card">
        <h2 className="mantenimiento-subtitulo">Respaldos de base de datos</h2>

        <div className="mantenimiento-botones">
          <button
            className="btn-respaldo btn-crear"
            onClick={handleCrearRespaldo}
            disabled={creandoRespaldo || restaurando}
          >
            <Database size={18} />
            {creandoRespaldo ? "Creando..." : "Crear nuevo respaldo"}
          </button>

          <button
            className="btn-respaldo btn-restaurar"
            onClick={handleAbrirSelectorArchivo}
            disabled={creandoRespaldo || restaurando}
          >
            <Upload size={18} />
            {restaurando ? "Restaurando..." : "Restaurar desde archivo"}
          </button>

          <input
            ref={inputArchivoRef}
            type="file"
            accept=".sql"
            style={{ display: "none" }}
            onChange={handleArchivoSeleccionado}
          />
        </div>

        {ultimoRespaldoExitoso && (
          <div className="ultimo-respaldo">
            <span className="punto-verde" />
            Último respaldo realizado: <strong>{formatearFecha(ultimoRespaldoExitoso.fecha_respaldo)}</strong>
          </div>
        )}

        {mensajeExito && (
          <div className="ultimo-respaldo" style={{ color: "#2e7d32" }}>
            <CheckCircle2 size={16} /> {mensajeExito}
          </div>
        )}

        {error && (
          <div className="ultimo-respaldo" style={{ color: "#e5484d" }}>
            <XCircle size={16} /> {error}
          </div>
        )}
      </div>

      <div className="mantenimiento-card">
        <div className="historial-header">
          <h3>Historial de respaldos</h3>
          <span className="historial-total">Total: {respaldos.length} registros</span>
        </div>

        <div className="mantenimiento-tabla-wrap">
          <table className="mantenimiento-tabla">
            <thead>
              <tr>
                <th>Fecha de respaldo</th>
                <th>Tamaño</th>
                <th>Estado</th>
                <th className="col-acciones">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={4} className="tabla-vacia">
                    Cargando historial...
                  </td>
                </tr>
              ) : respaldos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="tabla-vacia">
                    No hay respaldos registrados aún.
                  </td>
                </tr>
              ) : (
                respaldos.map((respaldo) => (
                  <tr key={respaldo.id}>
                    <td>{formatearFecha(respaldo.fecha_respaldo)}</td>
                    <td>{formatearTamano(respaldo.tamano_bytes)}</td>
                    <td>
                      <span
                        className={`estado-badge ${
                          respaldo.estado === "Exitoso" ? "estado-exitoso" : "estado-fallido"
                        }`}
                        title={respaldo.mensaje_error ?? undefined}
                      >
                        {respaldo.estado === "Exitoso" ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <XCircle size={14} />
                        )}
                        {respaldo.estado}
                      </span>
                    </td>
                    <td className="col-acciones">
                      {respaldo.estado === "Exitoso" ? (
                        <>
                          <button
                            className="accion-link"
                            onClick={() => handleDescargar(respaldo.id, respaldo.nombre_archivo)}
                          >
                            Descargar
                          </button>
                          <span className="accion-separador">|</span>
                          <button
                            className="accion-link"
                            onClick={() =>
                              handleRestaurarDesdeHistorial(respaldo.id, respaldo.nombre_archivo)
                            }
                            disabled={restaurando}
                          >
                            Restaurar
                          </button>
                          <span className="accion-separador">|</span>
                        </>
                      ) : null}
                      <button
                        className="accion-link accion-eliminar"
                        onClick={() => handleEliminar(respaldo.id)}
                      >
                        Eliminar
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