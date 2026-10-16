import { pool } from "../config/database.js";

export interface RegistroBitacora {
  idUsuario?: number | null;
  usuario: string;
  rol: string;
  accion: string;
  modulo: string;
  detalles?: string | null;
  ip?: string | null;
}

export async function registrarBitacora({
  idUsuario,
  usuario,
  rol,
  accion,
  modulo,
  detalles,
  ip,
}: RegistroBitacora) {
  try {
    await pool.query(
      `INSERT INTO bitacora (id_usuario, usuario, rol, accion, modulo, detalles, ip, fecha_hora)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [idUsuario || null, usuario, rol, accion, modulo, detalles || null, ip || null]
    );
  } catch (error) {
    console.error("Error al registrar en bitácora:", error);
  }
}

export async function obtenerBitacora(
  search: string = "",
  modulo: string = "",
  fechaInicio: string = "",
  fechaFin: string = "",
  page: number = 1,
  perPage: number = 20
) {
  const params: any[] = [];
  let whereClauses = "WHERE 1=1";

  if (search.trim()) {
    whereClauses += " AND (usuario LIKE ? OR accion LIKE ? OR detalles LIKE ?)";
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  if (modulo.trim()) {
    whereClauses += " AND modulo = ?";
    params.push(modulo.trim());
  }

  if (fechaInicio.trim()) {
    whereClauses += " AND fecha_hora >= ?";
    params.push(`${fechaInicio.trim()} 00:00:00`);
  }

  if (fechaFin.trim()) {
    whereClauses += " AND fecha_hora <= ?";
    params.push(`${fechaFin.trim()} 23:59:59`);
  }

  const [totalRows]: any = await pool.query(
    `SELECT COUNT(*) as total FROM bitacora ${whereClauses}`,
    params
  );
  const total = Number(totalRows[0]?.total || 0);

  const offset = (Math.max(1, page) - 1) * perPage;
  const [rows]: any = await pool.query(
    `SELECT id, id_usuario, usuario, rol, accion, modulo, detalles, ip, fecha_hora
     FROM bitacora
     ${whereClauses}
     ORDER BY fecha_hora DESC, id DESC
     LIMIT ? OFFSET ?`,
    [...params, perPage, offset]
  );

  return {
    data: rows,
    total,
    current_page: page,
    per_page: perPage,
    last_page: Math.max(1, Math.ceil(total / perPage)),
  };
}
