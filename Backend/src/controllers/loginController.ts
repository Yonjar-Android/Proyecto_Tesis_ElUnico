import { Request,Response } from "express";

import { loginService } from "../services/auth.service.js";

export const login = async(req:Request,res:Response)=>{

    const {usuario,password}=req.body;

    const user=await loginService(usuario,password);

    if(!user){

        return res.status(401).json({

            success:false,

            message:"Credenciales incorrectas"

        });

    }

    return res.json({

        success:true,

        user

    });

}