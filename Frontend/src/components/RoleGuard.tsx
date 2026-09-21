import { Navigate, Outlet } from "react-router-dom";

interface RoleGuardProps {
  rolesPermitidos: string[];
}

export default function RoleGuard({ rolesPermitidos }: RoleGuardProps) {
  const usuarioRaw = localStorage.getItem("usuario");
  const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;

  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  if (!rolesPermitidos.includes(usuario.Nombre_rol)) {
    return <Navigate to="/home" replace />; // o a una página de "sin permisos"
  }

  return <Outlet />;
}