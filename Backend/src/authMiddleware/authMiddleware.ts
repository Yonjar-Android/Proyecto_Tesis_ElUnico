import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  usuario?: { id: number; rol: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number; rol: string };
    req.usuario = { id: decoded.id, rol: decoded.rol };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

export function requireRole(...rolesPermitidos: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const rol = req.usuario?.rol;

    if (!rol || !rolesPermitidos.includes(rol)) {
      return res.status(403).json({ success: false, message: "No tienes permisos para esta acción." });
    }

    next();
  };
}