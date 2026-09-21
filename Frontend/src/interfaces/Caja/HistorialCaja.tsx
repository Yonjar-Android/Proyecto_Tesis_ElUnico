import { useEffect, useState, useMemo } from "react";
import { History, FileSpreadsheet, FileText, Search, RefreshCw, AlertCircle, HelpCircle } from "lucide-react";
import { Joyride, type Step } from "react-joyride";
import { obtenerHistorialCajas, type SesionHistorial } from "../../services/caja.service";
import { formatearMoneda } from "../FuncionAuxiliar";
import "./HistorialCaja.css";

export default function HistorialCaja() {
  const [historial, setHistorial] = useState<SesionHistorial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "Abierta" | "Cerrada">("todos");

  const [tourActivo, setTourActivo] = useState(false);
  const pasosTour: Step[] = [
    {
      target: '[data-tour="exportar-cajas"]',
      content: "Permite exportar a Excel o generar un documento PDF formal de las sesiones de caja listadas.",
    },
    {
      target: '[data-tour="filtros-caja"]',
      content: "Busca por número de sesión, cajero u observaciones, o filtra por estado (Abierta / Cerrada).",
    },
    {
      target: '[data-tour="tabla-historial-cajas"]',
      content: "Tabla histórica con fechas de apertura y cierre, cajero responsable, fondos y diferencias calculadas.",
    },
  ];

  useEffect(() => {
    cargarHistorial();
  }, []);

  async function cargarHistorial() {
    setCargando(true);
    setError("");
    try {
      const data = await obtenerHistorialCajas();
      if (data.success && Array.isArray(data.historial)) {
        setHistorial(data.historial);
      } else {
        setHistorial([]);
      }
    } catch (err: any) {
      console.error("Error al cargar historial:", err);
      setError("No se pudo cargar el historial de cajas.");
    } finally {
      setCargando(false);
    }
  }

  function formatearFecha(fechaStr: string | null) {
    if (!fechaStr) return "---";
    try {
      const d = new Date(fechaStr);
      if (isNaN(d.getTime())) return fechaStr;
      return d.toLocaleDateString("es-NI", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return fechaStr;
    }
  }

  const sesionesFiltradas = useMemo(() => {
    return historial.filter((s) => {
      const coincideEstado = filtroEstado === "todos" || s.estado === filtroEstado;
      const texto = busqueda.toLowerCase().trim();
      const coincideTexto =
        !texto ||
        String(s.id_sesion).includes(texto) ||
        (s.usuario_nombre && s.usuario_nombre.toLowerCase().includes(texto)) ||
        (s.observaciones && s.observaciones.toLowerCase().includes(texto));
      return coincideEstado && coincideTexto;
    });
  }, [historial, busqueda, filtroEstado]);

  // Exportar a Excel
  function exportarExcel() {
    if (sesionesFiltradas.length === 0) return;

    const fechaHoy = new Date().toLocaleDateString("es-NI").replace(/\//g, "-");

    const filasHtml = sesionesFiltradas
      .map(
        (s) => `
        <tr>
          <td style="text-align: center;">#${s.id_sesion}</td>
          <td>${s.usuario_nombre || "Desconocido"}</td>
          <td>${formatearFecha(s.fecha_apertura)}</td>
          <td>${formatearFecha(s.fecha_cierre)}</td>
          <td style="text-align: right;">C$ ${formatearMoneda(Number(s.monto_apertura_cordobas) || 0)}</td>
          <td style="text-align: right;">$ ${formatearMoneda(Number(s.monto_apertura_dolares) || 0)}</td>
          <td style="text-align: right;">C$ ${formatearMoneda(Number(s.total_efectivo_contado) || 0)}</td>
          <td style="text-align: right;">C$ ${formatearMoneda(Number(s.total_tarjeta_transferencia) || 0)}</td>
          <td style="text-align: right; color: ${Number(s.diferencia) < 0 ? '#dc2626' : '#16a34a'}; font-weight: bold;">
            C$ ${formatearMoneda(Number(s.diferencia) || 0)}
          </td>
          <td style="text-align: center; font-weight: bold;">${s.estado}</td>
          <td>${s.observaciones || ""}</td>
        </tr>`
      )
      .join("");

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; font-size: 10.5pt; }
          .empresa { font-size: 16pt; font-weight: bold; color: #0047ab; }
          .th-col { background-color: #0047ab; color: #ffffff; font-weight: bold; padding: 7px 10px; }
          td { border: 1px solid #e2e8f0; padding: 6px 9px; }
        </style>
      </head>
      <body>
        <table>
          <tr><td colspan="11" class="empresa">EL ÚNICO MOTO REPUESTOS</td></tr>
          <tr><td colspan="11">REPORTE DE HISTORIAL DE CAJAS</td></tr>
          <tr><td colspan="11">Generado: ${new Date().toLocaleString("es-NI")} | Registros: ${sesionesFiltradas.length}</td></tr>
          <tr><td colspan="11"></td></tr>
          <tr>
            <th class="th-col"># Sesión</th>
            <th class="th-col">Cajero / Usuario</th>
            <th class="th-col">Fecha Apertura</th>
            <th class="th-col">Fecha Cierre</th>
            <th class="th-col">Apertura C$</th>
            <th class="th-col">Apertura USD</th>
            <th class="th-col">Cierre Contado</th>
            <th class="th-col">Transferencias</th>
            <th class="th-col">Diferencia</th>
            <th class="th-col">Estado</th>
            <th class="th-col">Observaciones</th>
          </tr>
          ${filasHtml}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Historial_Cajas_${fechaHoy}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Exportar a PDF / Impresión profesional
  function exportarPDF() {
    if (sesionesFiltradas.length === 0) return;

    const fechaHoy = new Date().toLocaleDateString("es-NI", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const ventanaImpresion = window.open("", "_blank");
    if (!ventanaImpresion) {
      alert("Por favor permite las ventanas emergentes para generar el reporte en PDF.");
      return;
    }

    const filas = sesionesFiltradas
      .map(
        (s) => `
        <tr>
          <td style="text-align: center; font-weight: bold;">#${s.id_sesion}</td>
          <td>${s.usuario_nombre || "Desconocido"}</td>
          <td>${formatearFecha(s.fecha_apertura)}</td>
          <td>${formatearFecha(s.fecha_cierre)}</td>
          <td style="text-align: right;">C$ ${formatearMoneda(Number(s.monto_apertura_cordobas) || 0)}</td>
          <td style="text-align: right;">C$ ${formatearMoneda(Number(s.total_efectivo_contado) || 0)}</td>
          <td style="text-align: right; font-weight: bold; color: ${Number(s.diferencia) < 0 ? '#dc2626' : '#16a34a'};">
            C$ ${formatearMoneda(Number(s.diferencia) || 0)}
          </td>
          <td style="text-align: center;">${s.estado}</td>
        </tr>`
      )
      .join("");

    ventanaImpresion.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Historial de Cajas - El Único Moto Repuestos</title>
        <style>
          @page { size: letter landscape; margin: 15mm; }
          body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; margin: 0; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #0047ab; padding-bottom: 10px; margin-bottom: 15px; }
          .header h1 { font-size: 18px; margin: 0; color: #0047ab; }
          .header h2 { font-size: 13px; margin: 4px 0; color: #475569; }
          .header p { font-size: 10.5px; margin: 0; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10.5px; }
          th { background-color: #0047ab; color: #ffffff; padding: 6px 8px; text-align: left; font-size: 10.5px; }
          td { border-bottom: 1px solid #e2e8f0; padding: 6px 8px; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .footer { margin-top: 20px; font-size: 10px; text-align: right; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MOTOREPUESTOS EL ÚNICO</h1>
          <h2>REPORTE GENERAL DE HISTORIAL DE CAJAS</h2>
          <p>Fecha de emisión: ${fechaHoy} | Total de registros: ${sesionesFiltradas.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th style="text-align: center;"># Sesión</th>
              <th>Cajero / Usuario</th>
              <th>Fecha Apertura</th>
              <th>Fecha Cierre</th>
              <th style="text-align: right;">Apertura C$</th>
              <th style="text-align: right;">Cierre Contado</th>
              <th style="text-align: right;">Diferencia</th>
              <th style="text-align: center;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${filas}
          </tbody>
        </table>
        <div class="footer">
          <p>Documento generado desde el Sistema de Facturación e Inventario - El Único Moto Repuestos</p>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);

    ventanaImpresion.document.close();
  }

  return (
    <div className="historial-caja-container">
      <div className="historial-caja-header">
        <div>
          <h1 className="historial-caja-titulo">
            <History size={24} style={{ display: "inline", verticalAlign: "middle", marginRight: 8, color: "#0047ab" }} />
            Historial de Cajas
          </h1>
          <p className="historial-caja-subtitulo">
            Consulta los registros de apertura, cierre, responsables y diferencias de sesiones de caja anteriores.
          </p>
        </div>

        <div className="historial-caja-acciones-top">
          <button
            type="button"
            className="btn-help-historial"
            onClick={() => setTourActivo(true)}
            title="Guía de ayuda"
          >
            <HelpCircle size={16} />
          </button>
          <div data-tour="exportar-cajas" style={{ display: "flex", gap: "8px" }}>
            <button
              className="btn-exportar-excel"
              onClick={exportarExcel}
              disabled={sesionesFiltradas.length === 0}
              title="Exportar a Excel (.xls)"
            >
              <FileSpreadsheet size={16} />
              Exportar Excel
            </button>
            <button
              className="btn-exportar-pdf"
              onClick={exportarPDF}
              disabled={sesionesFiltradas.length === 0}
              title="Exportar o imprimir en PDF"
            >
              <FileText size={16} />
              Exportar PDF
            </button>
          </div>
          <button
            className="btn-recargar-historial"
            onClick={cargarHistorial}
            title="Actualizar listado"
          >
            <RefreshCw size={16} className={cargando ? "spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "12px 16px", borderRadius: 8, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="historial-caja-filtros" data-tour="filtros-caja">
        <div className="historial-caja-search-box">
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Buscar por # sesión, cajero u observación..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <select
          className="historial-caja-estado-select"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as any)}
        >
          <option value="todos">Todos los estados</option>
          <option value="Abierta">Solo Abiertas</option>
          <option value="Cerrada">Solo Cerradas</option>
        </select>
      </div>

      <div className="historial-tabla-card" data-tour="tabla-historial-cajas">
        <table className="historial-tabla">
          <thead>
            <tr>
              <th style={{ width: 80 }}>Sesión</th>
              <th>Cajero</th>
              <th>Fecha Apertura</th>
              <th>Fecha Cierre</th>
              <th style={{ textAlign: "right" }}>Apertura</th>
              <th style={{ textAlign: "right" }}>Cierre Contado</th>
              <th style={{ textAlign: "right" }}>Diferencia</th>
              <th style={{ textAlign: "center" }}>Estado</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={9} className="historial-tabla-cargando">
                  Cargando historial de cajas...
                </td>
              </tr>
            ) : sesionesFiltradas.length === 0 ? (
              <tr>
                <td colSpan={9} className="historial-tabla-vacia">
                  No se encontraron sesiones de caja que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              sesionesFiltradas.map((s) => {
                const dif = Number(s.diferencia) || 0;
                const aperturaCordobas = Number(s.monto_apertura_cordobas) || 0;
                const aperturaDolares = Number(s.monto_apertura_dolares) || 0;
                const totalContado = Number(s.total_efectivo_contado) || 0;

                return (
                  <tr key={s.id_sesion}>
                    <td>
                      <span className="historial-sesion-badge">#{s.id_sesion}</span>
                    </td>
                    <td>
                      <span className="historial-usuario">{s.usuario_nombre || "Usuario"}</span>
                    </td>
                    <td>
                      <div className="historial-fecha-principal">{formatearFecha(s.fecha_apertura)}</div>
                    </td>
                    <td>
                      <div className="historial-fecha-secundaria">{formatearFecha(s.fecha_cierre)}</div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span style={{ fontWeight: 600 }}>C${formatearMoneda(aperturaCordobas)}</span>
                      {aperturaDolares > 0 && (
                        <div style={{ fontSize: 11, color: "#0047ab" }}>
                          + ${formatearMoneda(aperturaDolares)} USD
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {s.estado === "Cerrada" ? (
                        <span style={{ fontWeight: 600 }}>C${formatearMoneda(totalContado)}</span>
                      ) : (
                        <span style={{ color: "#94a3b8", fontStyle: "italic" }}>En curso</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {s.estado === "Cerrada" ? (
                        <span className={dif < 0 ? "monto-negativo" : dif > 0 ? "monto-positivo" : "monto-neutro"}>
                          {dif > 0 ? "+" : ""}C${formatearMoneda(dif)}
                        </span>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>---</span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        className={`badge-estado ${
                          s.estado === "Abierta" ? "badge-estado-abierta" : "badge-estado-cerrada"
                        }`}
                      >
                        {s.estado}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "#64748b", fontSize: 12.5 }} title={s.observaciones || ""}>
                        {s.observaciones
                          ? s.observaciones.length > 35
                            ? `${s.observaciones.substring(0, 35)}...`
                            : s.observaciones
                          : "---"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="historial-resumen-footer">
          <span>Mostrando {sesionesFiltradas.length} de {historial.length} sesiones</span>
          <span>Motorepuestos El Único</span>
        </div>
      </div>

      <Joyride
        steps={pasosTour}
        run={tourActivo}
        continuous
        locale={{
          back: "Atrás",
          close: "Cerrar",
          last: "Finalizar",
          next: "Siguiente",
          skip: "Omitir",
        }}
        onEvent={(data) => {
          if (data.type === "tour:end") {
            setTourActivo(false);
          }
        }}
      />
    </div>
  );
}
