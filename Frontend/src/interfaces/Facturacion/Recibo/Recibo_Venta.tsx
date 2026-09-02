import styles from "./Recibo_Venta.module.css";
import type { ArticuloRecibo, DatosRecibo } from "../../../models/Recibo";

// Datos fijos del negocio — ajusta esto a los datos reales de tu empresa
// (idealmente muévelo a un archivo de configuración compartido)
const NEGOCIO = {
  nombre: "EL UNICO",
  eslogan: '"Impulsando tu negocio un rollo a la vez"',
  sucursal: "Sucursal Central",
  direccion: "DE LA ROLTER 1C AL NORTE",
};

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

  const descuentoTotal = datos.articulos.reduce(
  (acc, a) => acc + descuentoLineaArticulo(a),
  0
);
const total = subtotal - descuentoTotal;

  function descuentoLineaArticulo(articulo: ArticuloRecibo): number {
  return articulo.tipoDescuento == "porcentaje"
    ? (articulo.precioUnitario * (articulo.descuento / 100)) * articulo.cantidad
    : articulo.descuento * articulo.cantidad;
}

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

      {datos.devoluciones.length > 0 && (
        <>
          <div className={styles.separador} />

          <div className={styles.tituloArticulos}>PRODUCTOS DEVUELTOS</div>
          <p className={styles.notaDevolucion}>
            Los montos ya incluyen el precio neto en caso de haberse aplicado un descuento en la venta original.
          </p>

          {datos.devoluciones.map((devolucion) => {
            const totalDevolucion = devolucion.detalles.reduce(
              (acc, d) => acc + d.subtotal,
              0
            );

            return (
              <div key={devolucion.idDevolucion} className={styles.bloqueDevolucion}>
                <div className={styles.filaDato}>
                  <span>DEVOLUCIÓN #{devolucion.idDevolucion}:</span>
                  <span>{devolucion.fecha}</span>
                </div>
                <div className={styles.filaDato}>
                  <span>MOTIVO:</span>
                  <span>{devolucion.motivo}</span>
                </div>
                {devolucion.observacion && (
                  <div className={styles.filaDato}>
                    <span>OBSERVACIÓN:</span>
                    <span>{devolucion.observacion}</span>
                  </div>
                )}

                <div className={styles.filaEncabezadoArticulos}>
                  <span>CANT.</span>
                  <span>P.UNIT.</span>
                  <span>SUBTOTAL</span>
                </div>

                {devolucion.detalles.map((detalle, index) => (
                  <div key={index} className={styles.articulo}>
                    <div className={styles.nombreArticulo}>{detalle.nombreProducto}</div>
                    <div className={styles.filaArticulo}>
                      <span>{detalle.cantidad.toFixed(2)}X</span>
                      <span>C${formatearMoneda(detalle.precioUnitario)}</span>
                      <span>C${formatearMoneda(detalle.subtotal)}</span>
                    </div>
                  </div>
                ))}

                <div className={styles.filaTotal}>
                  <span>TOTAL DEVUELTO:</span>
                  <span>-C${formatearMoneda(totalDevolucion)}</span>
                </div>

                <div className={styles.separador} />
              </div>
            );
          })}

          {datos.devoluciones.length > 0 && (
  <div className={`${styles.filaTotal} ${styles.filaTotalFinal}`}>
    <span>TOTAL DEVUELTO (GENERAL):</span>
    <span>
      -C${formatearMoneda(
        datos.devoluciones.reduce(
          (acc, dev) => acc + dev.detalles.reduce((s, d) => s + d.subtotal, 0),
          0
        )
      )}
    </span>
  </div>
)}
        </>
      )}
    </div>
  );
}