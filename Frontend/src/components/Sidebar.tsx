import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FileText,
  ShoppingCart,
  Users,
  Truck,
  Archive,
  PieChart,
  Wrench,
  User,
  ChevronDown,
  LogOut,
  UserCog,
  Wallet,
} from "lucide-react";
import logo from "../assets/LogoTransparente1.png";
import "./Sidebar.css";

interface UsuarioSesion {
  Nombre_Usuario: string;
  Correo: string;
}

export default function Sidebar() {
  const [reportesAbierto, setReportesAbierto] = useState(false);
  const [usuarioMenuAbierto, setUsuarioMenuAbierto] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [cajaAbierto, setCajaAbierto] = useState(false);

  useEffect(() => {
    const guardado = localStorage.getItem("usuario");
    if (guardado) {
      setUsuario(JSON.parse(guardado));
    }
  }, []);

  useEffect(() => {
    function handleClickFuera(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUsuarioMenuAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  function handleLogout() {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    navigate("/");
  }

  const iniciales = usuario?.Nombre_Usuario
    ? usuario.Nombre_Usuario.slice(0, 2).toUpperCase()
    : "??";

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="El Único" />
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/facturacion" className="sidebar-link">
          <FileText size={20} />
          <span>Facturación</span>
        </NavLink>

        <NavLink to="/compras" className="sidebar-link">
          <ShoppingCart size={20} />
          <span>Compras</span>
        </NavLink>

        <NavLink to="/clientes" className="sidebar-link">
          <Users size={20} />
          <span>Clientes</span>
        </NavLink>

        <NavLink to="/proveedores" className="sidebar-link">
          <Truck size={20} />
          <span>Proveedores</span>
        </NavLink>

        <NavLink to="/inventario" className="sidebar-link">
          <Archive size={20} />
          <span>Inventario</span>
        </NavLink>
        <button
  type="button"
  className="sidebar-link sidebar-dropdown-toggle"
  onClick={() => setCajaAbierto((abierto) => !abierto)}
>
  <Wallet size={20} />
  <span>Caja</span>
  <ChevronDown size={16} className={`chevron ${cajaAbierto ? "chevron-abierto" : ""}`} />
</button>

{cajaAbierto && (
  <div className="sidebar-submenu">
    <NavLink to="/caja" className="sidebar-sublink">
      Arqueo del día
    </NavLink>
    <NavLink to="/caja/apertura" className="sidebar-sublink">
      Apertura de caja
    </NavLink>
    <NavLink to="/caja/cierre" className="sidebar-sublink">
      Cierre de caja
    </NavLink>
  </div>
)}

        {/* Reportes con submenú desplegable */}
        <button
          type="button"
          className="sidebar-link sidebar-dropdown-toggle"
          onClick={() => setReportesAbierto((abierto) => !abierto)}
        >
          <PieChart size={20} />
          <span>Reportes</span>
          <ChevronDown
            size={16}
            className={`chevron ${reportesAbierto ? "chevron-abierto" : ""}`}
          />
        </button>

        {reportesAbierto && (
          <div className="sidebar-submenu">
            <NavLink to="/reportes/cuentas-por-cobrar" className="sidebar-sublink">
              Cuentas por Cobrar
            </NavLink>
            <NavLink to="/reportes/stock-proximo-agotarse" className="sidebar-sublink">
              Stock Próximo a Agotarse
            </NavLink>
            <NavLink to="/reportes/ventas" className="sidebar-sublink">
              Ventas por Período
            </NavLink>
            <NavLink to="/reportes/compras" className="sidebar-sublink">
              Compras por Período
            </NavLink>
          </div>
        )}

        <NavLink to="/mantenimiento" className="sidebar-link">
          <Wrench size={20} />
          <span>Mantenimiento</span>
        </NavLink>
      </nav>

      {/* Usuario con menú desplegable */}
      <div className="sidebar-footer" ref={menuRef}>
        <button
          type="button"
          className="sidebar-link sidebar-usuario-toggle"
          onClick={() => setUsuarioMenuAbierto((abierto) => !abierto)}
        >
          <div className="usuario-avatar">{iniciales}</div>
          <span className="usuario-nombre-footer">
            {usuario?.Nombre_Usuario || "Usuario"}
          </span>
          <ChevronDown
            size={16}
            className={`chevron ${usuarioMenuAbierto ? "chevron-abierto" : ""}`}
          />
        </button>

        {usuarioMenuAbierto && (
          <div className="usuario-dropdown">
            <div className="usuario-dropdown-info">
              <div className="usuario-avatar usuario-avatar-grande">{iniciales}</div>
              <div>
                <p className="usuario-dropdown-nombre">
                  {usuario?.Nombre_Usuario || "Usuario"}
                </p>
                <p className="usuario-dropdown-correo">{usuario?.Correo || ""}</p>
              </div>
            </div>

            <NavLink
              to="/usuario"
              className="usuario-dropdown-item"
              onClick={() => setUsuarioMenuAbierto(false)}
            >
              <UserCog size={17} />
              Gestionar usuarios
            </NavLink>

            <button
              type="button"
              className="usuario-dropdown-item usuario-dropdown-logout"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}