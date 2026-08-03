import { useEffect, useState } from "react";
import "./Home.css";

interface UsuarioSesion {
  Nombre_Usuario: string;
  Correo: string;
}

export default function Home() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);

  useEffect(() => {
    const guardado = localStorage.getItem("usuario");
    if (guardado) {
      setUsuario(JSON.parse(guardado));
    }
  }, []);

  return (
    <div className="home-container">
      <div className="home-overlay">
        <div className="home-welcome">
          <h1>
            {usuario ? `¡Bienvenido, ${usuario.Nombre_Usuario}!` : "¡Bienvenido!"}
          </h1>
          <p>Sistema de gestión de repuestos de moto</p>
        </div>

      </div>
    </div>
  );
}