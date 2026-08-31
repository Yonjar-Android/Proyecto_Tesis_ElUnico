import { Request, Response, NextFunction } from "express";

export function requireRole(...rolesPermitidos: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const rol = (req as any).usuario?.rol; // ajustar según cómo guarde tu authMiddleware el usuario decodificado

    if (!rol || !rolesPermitidos.includes(rol)) {
      return res.status(403).json({ success: false, message: "No tienes permisos para esta acción." });
    }

    next();
  };
}