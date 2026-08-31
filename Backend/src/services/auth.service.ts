import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { login, findUserByEmail, updateUserPassword } from "../models/Usuario.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function generarContrasenaTemporal(length = 8) {
  const characters = "0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += characters[Math.floor(Math.random() * characters.length)];
  }
  return password;
}

async function enviarCorreoRecuperacion(email: string, usuario: string, contrasena: string) {
  if (!process.env.SMTP_USER) {
    throw new Error("El correo SMTP no está configurado en .env");
  }

  await transporter.sendMail({
    from: `El Único <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Recuperación de contraseña - El Único",
    text: `Hola ${usuario},\n\nSe ha generado una nueva contraseña temporal para tu cuenta.\n\nUsuario: ${usuario}\nContraseña temporal: ${contrasena}\n\nPor favor ingresa y cambia tu contraseña lo antes posible.\n\nSaludos,\nEl Único`,
    html: `<p>Hola ${usuario},</p><p>Se ha generado una nueva contraseña temporal para tu cuenta.</p><p><strong>Usuario:</strong> ${usuario}<br/><strong>Contraseña temporal:</strong> <code>${contrasena}</code></p><p>Por favor ingresa y cambia tu contraseña lo antes posible.</p><p>Saludos,<br/>El Único</p>`,
  });
}

export async function loginService(usuario: string, password: string) {
  const user: any = await login(usuario);

  if (!user) {
    return null;
  }

  // Bloqueo por usuario inactivo — antes de revisar la contraseña
  if (!user.Activo) {
    const error: any = new Error("USUARIO_INACTIVO");
    error.code = "USUARIO_INACTIVO";
    throw error;
  }

  const storedPassword = user.Contrasena;

  if (typeof storedPassword === "string" && storedPassword.startsWith("$2")) {
    const valid = await bcrypt.compare(password, storedPassword);
    if (!valid) {
      return null;
    }
  } else if (storedPassword !== password) {
    return null;
  }

  const { Contrasena, ...safeUser } = user;
  return safeUser;
}

export async function resetPasswordByEmail(email: string) {
  const user: any = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  // Bloqueo por usuario inactivo — antes de generar/enviar la contraseña nueva
  if (!user.Activo) {
    const error: any = new Error("USUARIO_INACTIVO");
    error.code = "USUARIO_INACTIVO";
    throw error;
  }

  const originalPassword = user.Contrasena;
  const nuevaContrasena = generarContrasenaTemporal(8);
  const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

  await updateUserPassword(user.id, hashedPassword);

  try {
    await enviarCorreoRecuperacion(email, user.Nombre_Usuario, nuevaContrasena);
  } catch (error) {
    await updateUserPassword(user.id, originalPassword);
    throw error;
  }

  return true;
}