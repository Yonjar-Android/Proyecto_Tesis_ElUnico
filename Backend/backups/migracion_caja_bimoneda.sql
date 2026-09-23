-- Ejecutar una sola vez sobre la base de datos activa.
ALTER TABLE egresos_caja
  ADD COLUMN monto_dolares DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER monto_cordobas;

ALTER TABLE ventas
  ADD COLUMN RecibidoCordobas DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER Total,
  ADD COLUMN RecibidoDolares DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER RecibidoCordobas;