import { useState } from "react";
import { NavLink } from "react-router-dom";
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
} from "lucide-react";
import logo from "../assets/LogoTransparente1.png";
import "./Sidebar.css";

export default function Sidebar() {
  const [reportesAbierto, setReportesAbierto] = useState(false);

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

      <div className="sidebar-footer">
        <NavLink to="/usuario" className="sidebar-link">
          <User size={20} />
          <span>Usuario</span>
        </NavLink>
      </div>
    </aside>
  );
}