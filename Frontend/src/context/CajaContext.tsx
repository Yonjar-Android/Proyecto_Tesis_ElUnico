import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { obtenerSesionActiva } from "../services/caja.service";

interface CajaContextType {
  cajaAbierta: boolean | null; // null = aún verificando
  refrescarCaja: () => Promise<void>;
}

const CajaContext = createContext<CajaContextType>({
  cajaAbierta: null,
  refrescarCaja: async () => {},
});

export function CajaProvider({ children }: { children: ReactNode }) {
  const [cajaAbierta, setCajaAbierta] = useState<boolean | null>(null);

  const refrescarCaja = useCallback(async () => {
    try {
      const data = await obtenerSesionActiva();
      setCajaAbierta(Boolean(data.sesion && data.sesion.estado === "Abierta"));
    } catch {
      setCajaAbierta(false);
    }
  }, []);

  useEffect(() => {
    refrescarCaja();
  }, [refrescarCaja]);

  return (
    <CajaContext.Provider value={{ cajaAbierta, refrescarCaja }}>
      {children}
    </CajaContext.Provider>
  );
}

export function useCajaAbierta() {
  return useContext(CajaContext);
}