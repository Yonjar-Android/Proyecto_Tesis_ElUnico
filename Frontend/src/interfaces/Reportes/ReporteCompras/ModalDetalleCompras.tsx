import styles from "./ModalDetalleCompras.module.css";
import { formatearMoneda } from "../../FuncionAuxiliar"; // ajusta la ruta si es necesario

export interface ArticuloCompra {
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface DetalleCompraDTO {
  idCompra: number;
  fecha: string;
  nFactura: string;
  total: number;
  proveedorNombre: string;
  articulos: ArticuloCompra[];
}

interface Props {
  abierto: boolean;
  datos: DetalleCompraDTO | null;
  onClose: () => void;
}

export default function ModalDetalleCompra({ abierto, datos, onClose }: Props) {
  if (!abierto || !datos) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.caja} onClick={(e) => e.stopPropagation()}>
        <div className={styles.encabezado}>
          <h3>Detalle de compra</h3>
          <button className={styles.cerrarX} onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className={styles.datosCompra}>
          <div className={styles.filaDato}>
            <span>N° Factura:</span>
            <span>{datos.nFactura}</span>
          </div>
          <div className={styles.filaDato}>
            <span>Proveedor:</span>
            <span>{datos.proveedorNombre}</span>
          </div>
          <div className={styles.filaDato}>
            <span>Fecha:</span>
            <span>{datos.fecha}</span>
          </div>
        </div>

        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>Producto</th>
              <th className={styles.centro}>Cantidad</th>
              <th className={styles.derecha}>Precio</th>
              <th className={styles.derecha}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {datos.articulos.map((articulo, index) => (
              <tr key={index}>
                <td>{articulo.nombre}</td>
                <td className={styles.centro}>{articulo.cantidad}</td>
                <td className={styles.derecha}>C${formatearMoneda(articulo.precio)}</td>
                <td className={styles.derecha}>C${formatearMoneda(articulo.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.filaTotal}>
          <span>Total:</span>
          <span>C${formatearMoneda(datos.total)}</span>
        </div>

        <button className={styles.botonCerrar} onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}