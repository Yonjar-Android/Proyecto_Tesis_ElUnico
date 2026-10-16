import { Request, Response } from "express";
import { listarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario, listarRoles } from "../services/usuario.service.js";
import { registrarBitacora } from "../services/bitacora.service.js";

export const getUsuarios = async (req: Request, res: Response) => {
  try {
    const usuarios = await listarUsuarios();
    res.status(200).json({ success: true, usuarios });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const postUsuario = async (req: Request, res: Response) => {
  try {
    const { nombreUsuario, correo, password, idRol } = req.body;
    const id = await crearUsuario(nombreUsuario, correo, password, Number(idRol));

    await registrarBitacora({
      idUsuario: (req as any).usuario?.id,
      usuario: (req as any).usuario?.usuario || "Administrador",
      rol: (req as any).usuario?.rol || "Administrador",
      accion: "Creación de Usuario",
      modulo: "Usuarios",
      detalles: `Usuario creado: ${nombreUsuario} (${correo})`,
      ip: req.ip,
    });

    res.status(201).json({ success: true, id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await listarRoles();
    res.status(200).json({ success: true, roles });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const putUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombreUsuario, correo, idRol } = req.body;
    await actualizarUsuario(Number(id), nombreUsuario, correo, Number(idRol));

    await registrarBitacora({
      idUsuario: (req as any).usuario?.id,
      usuario: (req as any).usuario?.usuario || "Administrador",
      rol: (req as any).usuario?.rol || "Administrador",
      accion: "Actualización de Usuario",
      modulo: "Usuarios",
      detalles: `Usuario #${id} actualizado: ${nombreUsuario} (${correo})`,
      ip: req.ip,
    });

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await eliminarUsuario(Number(id));

    await registrarBitacora({
      idUsuario: (req as any).usuario?.id,
      usuario: (req as any).usuario?.usuario || "Administrador",
      rol: (req as any).usuario?.rol || "Administrador",
      accion: "Eliminación de Usuario",
      modulo: "Usuarios",
      detalles: `Usuario #${id} eliminado`,
      ip: req.ip,
    });

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
