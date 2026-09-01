import styles from "./Recibo_Venta.module.css";

// Datos fijos del negocio — ajusta esto a los datos reales de tu empresa
// (idealmente muévelo a un archivo de configuración compartido)
const NEGOCIO = {
  nombre: "EL UNICO",
  eslogan: '"Impulsando tu negocio un rollo a la vez"',
  sucursal: "Sucursal Central",
  direccion: "DE LA ROLTER 1C AL NORTE",
};

export interface ArticuloRecibo {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number; // descuento individual guardado en el detalle_factura
}

export interface DatosRecibo {
  ticketNumero: string | number;
  cajero: string;
  fecha: string;
  hora: string;
  tipoPago: string;
  clienteNombre: string;
  clienteCedula?: string; // si el cliente no tiene cédula registrada, no se muestra la fila
  articulos: ArticuloRecibo[];
}

function formatearMoneda(valor: number): string {
  return valor.toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface Props {
  datos: DatosRecibo;
}

export default function ReciboVenta({ datos }: Props) {
  const subtotal = datos.articulos.reduce(
    (acc, a) => acc + a.cantidad * a.precioUnitario,
    0
  );
  const descuentoTotal = datos.articulos.reduce((acc, a) => acc + a.descuento, 0);
  const total = subtotal - descuentoTotal;

  return (
    <div className={styles.recibo}>
      <div className={styles.encabezado}>
        <h2>{NEGOCIO.nombre}</h2>
        <p>RUC: 441-120274-0000U</p>
        <p>{NEGOCIO.direccion}</p>
      </div>

      <div className={styles.separador} />

      <div className={styles.datosVenta}>
        <div className={styles.filaDato}>
          <span>TICKET #:</span>
          <span>{datos.ticketNumero}</span>
        </div>
        <div className={styles.filaDato}>
          <span>CAJERO:</span>
          <span>{datos.cajero}</span>
        </div>
        <div className={styles.filaDato}>
          <span>FECHA:</span>
          <span>{datos.fecha}</span>
        </div>
        <div className={styles.filaDato}>
          <span>HORA:</span>
          <span>{datos.hora}</span>
        </div>
<div className={styles.filaDato}>
  <span>PAGO:</span>
  <span>{datos.tipoPago === "Credito" ? "Crédito" : datos.tipoPago}</span>
</div>
        <div className={styles.filaDato}>
          <span>CLIENTE:</span>
          <span>{datos.clienteNombre}</span>
        </div>
        {datos.clienteCedula && (
          <div className={styles.filaDato}>
            <span>CÉDULA:</span>
            <span>{datos.clienteCedula}</span>
          </div>
        )}
      </div>

      <div className={styles.separador} />

      <div className={styles.tituloArticulos}>ARTÍCULO</div>
      <div className={styles.filaEncabezadoArticulos}>
        <span>CANT.</span>
        <span>P.UNIT.</span>
        <span>SUBTOTAL</span>
      </div>

      <div className={styles.separador} />

      {datos.articulos.map((articulo, index) => (
        <div key={index} className={styles.articulo}>
          <div className={styles.nombreArticulo}>{articulo.nombre}</div>
          <div className={styles.filaArticulo}>
            <span>{articulo.cantidad.toFixed(2)}X</span>
            <span>C${formatearMoneda(articulo.precioUnitario)}</span>
            <span>C${formatearMoneda(articulo.cantidad * articulo.precioUnitario)}</span>
          </div>
        </div>
      ))}

      <div className={styles.separador} />

      <div className={styles.filaTotal}>
        <span>SUBTOTAL:</span>
        <span>C${formatearMoneda(subtotal)}</span>
      </div>

        <div className={styles.filaTotal}>
          <span>DESCUENTO:</span>
          <span>-C${formatearMoneda(descuentoTotal)}</span>
        </div>

      <div className={`${styles.filaTotal} ${styles.filaTotalFinal}`}>
        <span>TOTAL:</span>
        <span>C${formatearMoneda(total)}</span>
      </div>
    </div>
  );
}