import { useEffect, useState } from "react";
import { Database, Upload, CheckCircle2 } from "lucide-react";
import "./Mantenimiento.css";

interface Respaldo {
  id: number;
  fecha: string;
  tamano: string;
  estado: "Exitoso" | "Fallido";
}

export default function Mantenimiento() {
  const [respaldos, setRespaldos] = useState<Respaldo[]>([]);
  const [ultimoRespaldo, setUltimoRespaldo] = useState<string>("");
  const [creandoRespaldo, setCreandoRespaldo] = useState(false);
  const [restaurando, setRestaurando] = useState(false);

  useEffect(() => {
    cargarHistorial();
  }, []);

  async function cargarHistorial() {
    try {
      // TODO: reemplazar con la llamada real al backend
      // const res = await fetch("/api/mantenimiento/respaldos");
      // const data = await res.json();
      // setRespaldos(data.respaldos);
      // setUltimoRespaldo(data.ultimoRespaldo);

      // Datos de ejemplo mientras se conecta el backend
      setRespaldos([
        { id: 1, fecha: "05/05/2026 - 14:00", tamano: "42.5 MB", estado: "Exitoso" },
        { id: 2, fecha: "05/05/2026 - 08:00", tamano: "41.8 MB", estado: "Exitoso" },
      ]);
      setUltimoRespaldo("Hoy a las 08:00 AM");
    } catch (err) {
      console.error("Error al cargar el historial de respaldos:", err);
    }
  }

  async function handleCrearRespaldo() {
    setCreandoRespaldo(true);
    try {
      // TODO: reemplazar con la llamada real al backend
      // await fetch("/api/mantenimiento/respaldos", { method: "POST" });
      // await cargarHistorial();
      console.log("Creando respaldo...");
    } catch (err) {
      console.error("Error al crear el respaldo:", err);
    } finally {
      setCreandoRespaldo(false);
    }
  }

  async function handleRestaurar() {
    setRestaurando(true);
    try {
      // TODO: reemplazar con la llamada real al backend
      // await fetch("/api/mantenimiento/restaurar", { method: "POST" });
      console.log("Restaurando respaldo...");
    } catch (err) {
      console.error("Error al restaurar:", err);
    } finally {
      setRestaurando(false);
    }
  }

  function handleDescargar(id: number) {
    // TODO: reemplazar con la llamada real al backend
    // window.open(`/api/mantenimiento/respaldos/${id}/descargar`, "_blank");
    console.log("Descargando respaldo", id);
  }

  function handleEliminar(id: number) {
    // TODO: reemplazar con la llamada real al backend
    // await fetch(`/api/mantenimiento/respaldos/${id}`, { method: "DELETE" });
    setRespaldos((prev) => prev.filter((r) => r.id !== id));
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
            disabled={creandoRespaldo}
          >
            <Database size={18} />
            {creandoRespaldo ? "Creando..." : "Crear nuevo respaldo"}
          </button>

          <button
            className="btn-respaldo btn-restaurar"
            onClick={handleRestaurar}
            disabled={restaurando}
          >
            <Upload size={18} />
            {restaurando ? "Restaurando..." : "Restaurar"}
          </button>
        </div>

        {ultimoRespaldo && (
          <div className="ultimo-respaldo">
            <span className="punto-verde" />
            Último respaldo realizado: <strong>{ultimoRespaldo}</strong>
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
              {respaldos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="tabla-vacia">
                    No hay respaldos registrados aún.
                  </td>
                </tr>
              ) : (
                respaldos.map((respaldo) => (
                  <tr key={respaldo.id}>
                    <td>{respaldo.fecha}</td>
                    <td>{respaldo.tamano}</td>
                    <td>
                      <span
                        className={`estado-badge ${
                          respaldo.estado === "Exitoso" ? "estado-exitoso" : "estado-fallido"
                        }`}
                      >
                        <CheckCircle2 size={14} />
                        {respaldo.estado}
                      </span>
                    </td>
                    <td className="col-acciones">
                      <button
                        className="accion-link"
                        onClick={() => handleDescargar(respaldo.id)}
                      >
                        Descargar
                      </button>
                      <span className="accion-separador">|</span>
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