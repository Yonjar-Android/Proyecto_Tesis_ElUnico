import { useState } from "react";
import logo from "../../assets/LogoAzulNaranja-transparente.png";
import fotoJuan from "../../assets/Integrantes/Juan.jpeg";
import fotoHorell from "../../assets/Integrantes/Horell.jpeg";
 import fotoJared from "../../assets/Integrantes/Jared.jpeg";
import "./AcercaDe.css";

interface Integrante {
  nombre: string;
  cargo: string;
  correo: string;
  telefono: string;
  foto?: string; // opcional: si no hay foto se muestran las iniciales
}

const EQUIPO: Integrante[] = [
  {
    nombre: "Br. Juan Antonio Centeno Castellón",
    cargo: "Líder de proyecto / Desarrollador",
    correo: "juancenteno132777@gmail.com",
    telefono: "+505 8338 4873",
    foto: fotoJuan,
  },
  {
    nombre: "Br. Horell Israel Altamirano Rizo",
    cargo: "Diseñador UX/UI / Desarrollador",
    correo: "horellaltamirano@gmail.com",
    telefono: "+505 8745 2107",
    foto: fotoHorell,
  },
  {
    nombre: "Br. Jared Noe Leiva Mendez",
    cargo: "Analista / Documentación",
    correo: "leivahared@gmail.com",
    telefono: "+505 8540 0668",
    foto: fotoJared,
  },
  
];

// Ignora el "Br." para que las iniciales sean de los nombres reales
const iniciales = (nombre: string): string =>
  nombre
    .replace(/^Br\.?\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

const IconoCorreo = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
  </svg>
);

const IconoTelefono = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.6 3.6a1 1 0 0 1-.25 1l-2.25 2.2Z" />
  </svg>
);

function Foto({ nombre, src }: { nombre: string; src?: string }) {
  const [error, setError] = useState<boolean>(false);
  return (
    <div className="acerca-foto">
      {iniciales(nombre)}
      {src && !error && (
        <img src={src} alt={`Foto de ${nombre}`} onError={() => setError(true)} />
      )}
    </div>
  );
}

export default function AcercaDe() {
  return (
    <section className="acerca">
      {/* HERO */}
      <header className="acerca-hero">
        <img src={logo} alt="Logo El Único Moto Repuestos" />
        <div>
          <span className="acerca-badge">Proyecto de graduación</span>
          <h1>Sistema de Gestión El Único Moto Repuestos</h1>
          <p>
            Sistema desarrollado para la administración de ventas, compras,
            inventario, clientes, créditos y arqueos de caja del negocio. Es el
            proyecto de graduación de estudiantes de la carrera de Ingeniería en Sistemas de
            Información de la UNAN Managua / CUR - Matagalpa.
          </p>
        </div>
      </header>

      {/* DATOS DEL PROYECTO */}
      <div className="acerca-info-grid">
        <div className="acerca-info-card">
          <span>Universidad</span>
          <strong>UNAN Managua / CUR - Matagalpa</strong>
        </div>
        <div className="acerca-info-card">
          <span>Carrera</span>
          <strong>Ingeniería en Sistemas de Información</strong>
        </div>
        <div className="acerca-info-card">
          <span>Versión</span>
          <strong>1.0.0 · 2026</strong>
        </div>
      </div>

      {/* EQUIPO */}
      <h2 className="acerca-titulo">Equipo de desarrollo</h2>
      <div className="acerca-equipo">
        {EQUIPO.map((m) => (
          <article className="acerca-miembro" key={m.correo}>
            <Foto nombre={m.nombre} src={m.foto} />
            <h3>{m.nombre}</h3>
            <p className="acerca-cargo">{m.cargo}</p>
            <div className="acerca-contacto">
              <a href={`mailto:${m.correo}`}>
                <IconoCorreo />
                {m.correo}
              </a>
              <a href={`tel:${m.telefono.replace(/\s/g, "")}`}>
                <IconoTelefono />
                {m.telefono}
              </a>
            </div>
          </article>
        ))}
      </div>

      {/* COPYRIGHT */}
      <footer className="acerca-copyright">
        © {new Date().getFullYear()} <strong>UNAN Managua / CUR - Matagalpa</strong>.
        Todos los derechos reservados.
        <br />
        Universidad Nacional Autónoma de Nicaragua · Ingeniería en Sistemas de
        Información
      </footer>
    </section>
  );
}