import { useEffect, useState } from "react";
import { UserPlus, Pencil, Trash2, X, Eye, EyeOff, Search } from "lucide-react";
import "./Usuario.css";

interface UsuarioRegistro {
  id: number;
  Nombre_Usuario: string;
  Correo: string;
}

interface UsuarioSesion {
  Nombre_Usuario: string;
  Correo: string;
}

type ModoModal = "crear" | "editar" | null;

export default function Usuario() {
  const [usuarioSesion, setUsuarioSesion] = useState<UsuarioSesion | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioRegistro[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);

  const [modalAbierto, setModalAbierto] = useState<ModoModal>(null);
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioRegistro | null>(null);
  const [nombreForm, setNombreForm] = useState("");
  const [correoForm, setCorreoForm] = useState("");
  const [passwordForm, setPasswordForm] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState("");

  const [usuarioAEliminar, setUsuarioAEliminar] = useState<UsuarioRegistro | null>(null);

  useEffect(() => {
    const guardado = localStorage.getItem("usuario");
    if (guardado) setUsuarioSesion(JSON.parse(guardado));
    cargarUsuarios();
  }, []);

  async function cargarUsuarios() {
    setCargando(true);
    try {
      // TODO: reemplazar con la llamada real al backend
      // const res = await fetch("/api/usuarios");
      // const data = await res.json();
      // setUsuarios(data);

      setUsuarios([
        { id: 1, Nombre_Usuario: "admin", Correo: "admin@elunico.com" },
        { id: 2, Nombre_Usuario: "horell", Correo: "horell@elunico.com" },
      ]);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    } finally {
      setCargando(false);
    }
  }

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.Nombre_Usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.Correo.toLowerCase().includes(busqueda.toLowerCase())
  );

  function abrirModalCrear() {
    setUsuarioEditando(null);
    setNombreForm("");
    setCorreoForm("");
    setPasswordForm("");
    setErrorForm("");
    setModalAbierto("crear");
  }

  function abrirModalEditar(usuario: UsuarioRegistro) {
    setUsuarioEditando(usuario);
    setNombreForm(usuario.Nombre_Usuario);
    setCorreoForm(usuario.Correo);
    setPasswordForm("");
    setErrorForm("");
    setModalAbierto("editar");
  }

  function cerrarModal() {
    setModalAbierto(null);
    setUsuarioEditando(null);
    setMostrarPassword(false);
  }

  async function handleGuardar() {
    setErrorForm("");

    if (!nombreForm || !correoForm) {
      setErrorForm("Usuario y correo son obligatorios.");
      return;
    }

    if (modalAbierto === "crear" && !passwordForm) {
      setErrorForm("La contraseña es obligatoria para un usuario nuevo.");
      return;
    }

    setGuardando(true);
    try {
      if (modalAbierto === "crear") {
        // TODO: reemplazar con la llamada real
        // await fetch("/api/usuarios", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({
        //     nombreUsuario: nombreForm,
        //     correo: correoForm,
        //     password: passwordForm,
        //   }),
        // });
        const nuevoId = Math.max(0, ...usuarios.map((u) => u.id)) + 1;
        setUsuarios((prev) => [
          ...prev,
          { id: nuevoId, Nombre_Usuario: nombreForm, Correo: correoForm },
        ]);
      } else if (modalAbierto === "editar" && usuarioEditando) {
        // TODO: reemplazar con la llamada real
        // await fetch(`/api/usuarios/${usuarioEditando.id}`, {
        //   method: "PUT",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({
        //     nombreUsuario: nombreForm,
        //     correo: correoForm,
        //     password: passwordForm || undefined,
        //   }),
        // });
        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === usuarioEditando.id
              ? { ...u, Nombre_Usuario: nombreForm, Correo: correoForm }
              : u
          )
        );
      }
      cerrarModal();
    } catch (err) {
      setErrorForm("No se pudo guardar el usuario. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarEliminar() {
    if (!usuarioAEliminar) return;
    try {
      // TODO: reemplazar con la llamada real
      // await fetch(`/api/usuarios/${usuarioAEliminar.id}`, { method: "DELETE" });
      setUsuarios((prev) => prev.filter((u) => u.id !== usuarioAEliminar.id));
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
    } finally {
      setUsuarioAEliminar(null);
    }
  }

  return (
    <div className="usuario-container">
      <div className="usuario-header">
        <div>
          <p className="usuario-breadcrumb">Sistema / Usuario</p>
          <h1 className="usuario-titulo">Gestión de Usuarios</h1>
          {usuarioSesion && (
            <p className="usuario-bienvenida">
              Sesión activa como <strong>{usuarioSesion.Nombre_Usuario}</strong>
            </p>
          )}
        </div>

        <button className="btn-agregar-usuario" onClick={abrirModalCrear}>
          <UserPlus size={18} />
          Agregar usuario
        </button>
      </div>

      <div className="usuario-card">
        <div className="usuario-filtros">
          <div className="usuario-busqueda">
            <Search size={17} color="#6b7280" />
            <input
              type="text"
              placeholder="Buscar por usuario o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <span className="usuario-total">
            {usuariosFiltrados.length} usuario{usuariosFiltrados.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Vista de tabla (escritorio) */}
        <div className="usuario-tabla-wrap">
          <table className="usuario-tabla">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th className="col-acciones">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={3} className="tabla-vacia">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={3} className="tabla-vacia">
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>
                      <div className="usuario-celda-nombre">
                        <div className="usuario-avatar-tabla">
                          {usuario.Nombre_Usuario.slice(0, 2).toUpperCase()}
                        </div>
                        {usuario.Nombre_Usuario}
                      </div>
                    </td>
                    <td>{usuario.Correo}</td>
                    <td className="col-acciones">
                      <button
                        className="btn-icono"
                        onClick={() => abrirModalEditar(usuario)}
                        aria-label="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="btn-icono btn-icono-eliminar"
                        onClick={() => setUsuarioAEliminar(usuario)}
                        aria-label="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Vista de tarjetas (móvil) */}
        <div className="usuario-tarjetas">
          {usuariosFiltrados.map((usuario) => (
            <div className="usuario-tarjeta" key={usuario.id}>
              <div className="usuario-celda-nombre">
                <div className="usuario-avatar-tabla">
                  {usuario.Nombre_Usuario.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="usuario-tarjeta-nombre">{usuario.Nombre_Usuario}</p>
                  <p className="usuario-tarjeta-correo">{usuario.Correo}</p>
                </div>
              </div>
              <div className="usuario-tarjeta-acciones">
                <button className="btn-icono" onClick={() => abrirModalEditar(usuario)}>
                  <Pencil size={16} />
                </button>
                <button
                  className="btn-icono btn-icono-eliminar"
                  onClick={() => setUsuarioAEliminar(usuario)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal crear/editar */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-cerrar" onClick={cerrarModal} aria-label="Cerrar">
              <X size={18} />
            </button>

            <h2 className="modal-titulo">
              {modalAbierto === "crear" ? "Agregar usuario" : "Editar usuario"}
            </h2>

            <div className="modal-campo">
              <label>Usuario</label>
              <input
                type="text"
                value={nombreForm}
                onChange={(e) => setNombreForm(e.target.value)}
                placeholder="Nombre de usuario"
              />
            </div>

            <div className="modal-campo">
              <label>Correo</label>
              <input
                type="email"
                value={correoForm}
                onChange={(e) => setCorreoForm(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="modal-campo">
              <label>
                {modalAbierto === "crear"
                  ? "Contraseña"
                  : "Nueva contraseña (opcional)"}
              </label>
              <div className="modal-password-wrap">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  value={passwordForm}
                  onChange={(e) => setPasswordForm(e.target.value)}
                  placeholder={
                    modalAbierto === "crear" ? "••••••••" : "Dejar en blanco para no cambiar"
                  }
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword((s) => !s)}
                  className="modal-password-toggle"
                >
                  {mostrarPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {errorForm && <div className="modal-error">{errorForm}</div>}

            <div className="modal-acciones">
              <button className="btn-modal-cancelar" onClick={cerrarModal}>
                Cancelar
              </button>
              <button
                className="btn-modal-guardar"
                onClick={handleGuardar}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminación */}
      {usuarioAEliminar && (
        <div className="modal-overlay" onClick={() => setUsuarioAEliminar(null)}>
          <div className="modal-card modal-card-confirmar" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-titulo">¿Eliminar usuario?</h2>
            <p className="modal-confirmar-texto">
              Vas a eliminar a <strong>{usuarioAEliminar.Nombre_Usuario}</strong>. Esta
              acción no se puede deshacer.
            </p>
            <div className="modal-acciones">
              <button
                className="btn-modal-cancelar"
                onClick={() => setUsuarioAEliminar(null)}
              >
                Cancelar
              </button>
              <button className="btn-modal-eliminar" onClick={confirmarEliminar}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}