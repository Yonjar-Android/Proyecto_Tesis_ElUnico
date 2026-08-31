import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCajaAbierta } from "../context/CajaContext";

export default function RutaProtegidaCaja({ children }: { children: ReactNode }) {
  const { cajaAbierta } = useCajaAbierta();

  if (cajaAbierta === null) {
    return null; // aún verificando, evita parpadeo de redirect
  }

  if (cajaAbierta === false) {
    return (
      <Navigate
        to="/caja/apertura"
        replace
        state={{ mensajeCaja: "Debe abrir una sesión de caja antes de continuar." }}
      />
    );
  }

  return <>{children}</>;
}