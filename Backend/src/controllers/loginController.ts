import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { loginService, resetPasswordByEmail } from "../services/auth.service.js";


export const login = async (req: Request, res: Response) => {
  const { usuario, password } = req.body;

  const user = await loginService(usuario, password);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Credenciales incorrectas",
    });
  }

// ...
const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: "8h" });
return res.json({ success: true, user, token });
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al enviar el correo de recuperación. Intenta nuevamente más tarde.",
    });
  }
};