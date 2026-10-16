import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { loginService, resetPasswordByEmail } from "../services/auth.service.js";
import { registrarBitacora } from "../services/bitacora.service.js";

export const login = async (req: Request, res: Response) => {
  const { usuario, password } = req.body;

  try {
    const user = await loginService(usuario, password);

    if (!user) {
      await registrarBitacora({
        idUsuario: null,
        usuario: String(usuario || "Desconocido"),
        rol: "N/A",
        accion: "Intento fallido de inicio de sesión",
        modulo: "Seguridad",
        detalles: `Credenciales incorrectas para el usuario: ${usuario || ""}`,
        ip: req.ip || req.socket.remoteAddress,
      });

      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
      });
    }

    const token = jwt.sign(
      { id: user.id, rol: user.Nombre_rol, usuario: user.Nombre_Usuario },
      process.env.JWT_SECRET as string,
      { expiresIn: "8h" }
    );

    await registrarBitacora({
      idUsuario: user.id,
      usuario: user.Nombre_Usuario,
      rol: user.Nombre_rol,
      accion: "Inicio de sesión",
      modulo: "Seguridad",
      detalles: "Inicio de sesión exitoso",
      ip: req.ip || req.socket.remoteAddress,
    });

    return res.json({ success: true, user, token });
  } catch (error: any) {
  
    if (error.code === "USUARIO_INACTIVO") {
      return res.status(403).json({
        success: false,
        message: "Tu usuario está inactivo. Contacta al administrador.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error al iniciar sesión. Intenta nuevamente más tarde.",
    });
  }
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || typeof email !== "string" || !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Ingresa un correo electrónico válido.",
    });
  }

  try {
    const success = await resetPasswordByEmail(email);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: "No existe ninguna cuenta registrada con ese correo.",
      });
    }

    return res.json({
      success: true,
      message: "Se envió una nueva contraseña temporal a tu correo.",
    });
  } catch (error: any) {
    if (error.code === "USUARIO_INACTIVO") {
      return res.status(403).json({
        success: false,
        message: "Este usuario está inactivo. Contacta al administrador.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error al enviar el correo de recuperación. Intenta nuevamente más tarde.",
    });
  }
};