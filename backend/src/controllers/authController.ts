import { Request, Response } from "express";
import jwt from 'jsonwebtoken'
import User from "../models/User";
import { AuthRequest } from "../middlewares/auth";
import { success } from "zod";
import bcrypt from "bcrypt"

const createToken = ( userId: string): string => {
  const jwtSecret = process.env.JWT_SECRET
 if (!jwtSecret) {
  throw new Error ('JWT_SECRET no está configurado')
 }
 return jwt.sign(
  { userId }, 
  jwtSecret,
 { expiresIn: `2d` }
)
}

export const register = async ( req: Request, res: Response):
Promise<void> => {
  try {
    const{ email, password, name} = req.body
    const existingUser= await   User.findOne({email})
    
    if (existingUser) {
      res.status(400).json({
        success: false,
        menssage: `El usuario ya existe`
      })
     return
    }
    const hashedPassword= await bcrypt.hash( password, 13)
    
    const user = new User ({
      email,
      password: hashedPassword,
      name: name || email.split(`@`)[0]
    })
  await user.save()
  
    const token = createToken(user.id)
   res.json({
    succsess: true,
    message: `Loguin exitoso`,
    token,
    user : {
      id: user._id,
      email: user.email,
      name: user.name
    }
  })

  } catch (error) {
    console.error('❌ Error en login:', error)
  res.status(500).json({
    success: false,
    message: `error al iniciar sesion`
  })
 }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body
    
    // Buscar usuario
    const user = await User.findOne({ email })
    
    if (!user) {
      res.status(401).json({ 
        success: false,
        message: 'Credenciales inválidas' 
      })
      return
    }
    
    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      res.status(401).json({ 
        success: false,
        message: 'Credenciales inválidas' 
      })
      return
    }
    
    // Crear token
    const token = createToken(user.id)
    
    // Responder
    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    })
    
  } catch (error) {
    console.error('❌ Error en login:', error)
    res.status(500).json({ 
      success: false,
      message: 'Error al iniciar sesión' 
    })
  }
}

export const getProfile = async ( req: AuthRequest, res: Response): Promise<void> => {
  try{
    const user = await User.findById(req.userId).select(`-password`)
     
     if (!user) {
      res.status(404).json({
       success: false,
       message: `Usuario no encontrado`

      })
      return
     }
       res.json({

        success: true,
        user: {
         id: user._id,
         email: user.email,
         name: user.email,
         createdAt: user.createdAt
         }
       })

  } catch (error) {
    console.error(`❌ Error en getProfile:`, error)
    res.status(500).json({
      succsess:false,
      menssage:`Error al obtener perfil`
    })
  }
}