import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      res.status(401).json({ message: 'No se proporcionó token de autenticación' })
      return
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: string }
    req.userId = decoded.userId
    
    next()
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' })
  }
}