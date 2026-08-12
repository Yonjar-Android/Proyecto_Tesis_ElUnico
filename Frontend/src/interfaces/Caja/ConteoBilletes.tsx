import { useState, useEffect } from "react";
import "./ConteoBilletes.css";

interface ConteoBilletesProps {
  tasaCambio: number;
  onTotalChange: (totalCordobas: number, desglose: DesgloseItem[]) => void;
}

export interface DesgloseItem {
  moneda: "C$" | "USD";
  denominacion: number;
  cantidad: number;
  subtotal: number;
}

const DENOMINACIONES_CORDOBAS = [1000, 500, 200, 100, 50, 20, 10, 5, 1];
const DENOMINACIONES_DOLARES = [100, 50, 20, 10, 5, 1];

export default function ConteoBilletes({ tasaCambio, onTotalChange }: ConteoBilletesProps) {
  const [cantidadesCordobas, setCantidadesCordobas] = useState<Record<number, number>>({});
  const [cantidadesDolares, setCantidadesDolares] = useState<Record<number, number>>({});

  const subtotalCordobas = DENOMINACIONES_CORDOBAS.reduce(
    (acc, d) => acc + (cantidadesCordobas[d] || 0) * d,
    0
  );

  const subtotalDolares = DENOMINACIONES_DOLARES.reduce(
    (acc, d) => acc + (cantidadesDolares[d] || 0) * d,
    0
  );

  const subtotalDolaresEquivalente = subtotalDolares * tasaCambio;
  const granTotal = subtotalCordobas + subtotalDolaresEquivalente;

  useEffect(() => {
    const desglose: DesgloseItem[] = [
      ...DENOMINACIONES_CORDOBAS.filter((d) => cantidadesCordobas[d] > 0).map((d) => ({
        moneda: "C$" as const,
        denominacion: d,
        cantidad: cantidadesCordobas[d],
        subtotal: cantidadesCordobas[d] * d,
      })),
      ...DENOMINACIONES_DOLARES.filter((d) => cantidadesDolares[d] > 0).map((d) => ({
        moneda: "USD" as const,
        denominacion: d,
        cantidad: cantidadesDolares[d],
        subtotal: cantidadesDolares[d] * d * tasaCambio,
      })),
    ];
    onTotalChange(granTotal, desglose);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cantidadesCordobas, cantidadesDolares, tasaCambio]);

  function actualizarCantidad(
    setter: React.Dispatch<React.SetStateAction<Record<number, number>>>,
    denominacion: number,
    delta: number
  ) {
    setter((prev) => {
      const actual = prev[denominacion] || 0;
      const nuevo = Math.max(0, actual + delta);
      return { ...prev, [denominacion]: nuevo };
    });
  }

  function setCantidadDirecta(
    setter: React.Dispatch<React.SetStateAction<Record<number, number>>>,
    denominacion: number,
    valor: string
  ) {
    const num = Math.max(0, parseInt(valor) || 0);
    setter((prev) => ({ ...prev, [denominacion]: num }));
  }

  return (
    <div className="conteo-billetes">
      <div className="conteo-columna">
        <h4 className="conteo-titulo">
          <span className="punto-cordobas" /> Córdobas
          <span className="conteo-subtotal-mini">C${subtotalCordobas.toLocaleString()}</span>
        </h4>
        {DENOMINACIONES_CORDOBAS.map((d) => (
          <div className="conteo-fila" key={`cordoba-${d}`}>
            <span className="conteo-etiqueta">C$ {d.toLocaleString()}</span>
            <div className="conteo-controles">
              <button onClick={() => actualizarCantidad(setCantidadesCordobas, d, -1)}>−</button>
              <input
                type="number"
                min={0}
                value={cantidadesCordobas[d] || 0}
                onChange={(e) => setCantidadDirecta(setCantidadesCordobas, d, e.target.value)}
              />
              <button onClick={() => actualizarCantidad(setCantidadesCordobas, d, 1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      <div className="conteo-columna">
        <h4 className="conteo-titulo">
          <span className="punto-dolares" /> US Dólares
          <span className="conteo-tasa">Tasa de cambio: 1USD = C${tasaCambio.toFixed(2)}</span>
        </h4>
        {DENOMINACIONES_DOLARES.map((d) => (
          <div className="conteo-fila" key={`dolar-${d}`}>
            <span className="conteo-etiqueta">$ {d}</span>
            <div className="conteo-controles">
              <button onClick={() => actualizarCantidad(setCantidadesDolares, d, -1)}>−</button>
              <input
                type="number"
                min={0}
                value={cantidadesDolares[d] || 0}
                onChange={(e) => setCantidadDirecta(setCantidadesDolares, d, e.target.value)}
              />
              <button onClick={() => actualizarCantidad(setCantidadesDolares, d, 1)}>+</button>
            </div>
          </div>
        ))}
        <div className="conteo-subtotal-equiv">
          Subtotal equiv. <strong>C${subtotalDolaresEquivalente.toFixed(2)}</strong>
          <span>${subtotalDolares.toFixed(2)} USD</span>
        </div>
      </div>

      <div className="conteo-gran-total">
        <span>Gran total contado</span>
        <strong>C${granTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
        <span className="conteo-total-usd">
          ≈ ${(granTotal / tasaCambio).toFixed(2)} USD
        </span>
      </div>
    </div>
  );
}