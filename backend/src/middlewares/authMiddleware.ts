import { error } from "console";
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { success } from "zod";

export interface AuthRequest extends Request {
    userId?: string
}

export const authMiddleware = (
req: AuthRequest,
res : Response,
next : NextFunction
): void => {
  try {
    const authHeader = req.header('Authorization')
    if (!authHeader) {
        res.status(401).json({
            success: false,
            message: 'Acceso denegado'
        })
        return
    }
    const token = authHeader.replace('Bearer ', '')

    if (!token || token === authHeader) {
        res.status(401).json({
            success: false,
            message: 'Formato de token invalido'
        })
        return
    }

    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
        console.error('❌ CRÍTICO: JWT_SECRET no está configurado en .env')
        res.status(500).json({
            success: false,
            message: 'Error de configuracion del servidor'
        })
        return
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string } | string
    if (typeof decoded !== 'string' && decoded && 'userId' in decoded) {
        req.userId = decoded.userId
    }

    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
            success:false,
            menssage: `Token invalido`
        })
        return
    }

    if (error instanceof jwt.JsonWebTokenError){
        res.status(401).json({
            success: false,
            menssage: `Token Expirado`
        })
        return
    }

  }
    console.error(`Error en aurthMiddleware`, error)
    res.status(500).json({
        success: false,
        menssage:`Error al verificar autenticacion`
    })
}
