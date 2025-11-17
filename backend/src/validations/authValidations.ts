import { email, z } from "zod";

export const registerSchema = z.object({
 email: z
 .string()
 .min(1, `El email es requerido`)
 .email(`Formato de email invalido`)
 .toLowerCase()
 .trim(),
  
 password: z
 .string()
 .min(1, `la contraseña es requerida`)
 .min(7, `la contraseña debe teber al menos 7 caracteres`)
 .max(70, `la contraseña no puede exceder los 70 caracteres`),    
 
 name: z
 .string()
 .trim()
 .min(2, `el nombre debe tener al menos 2 caracteres`)
 .max(50,`el nombre no puede ecxeder los 50 caracteres`)

})

export const loginSchema= z.object({
email: z
.string()
.min(1, `el email es requerido`)
.email(`formato de email invalido`)
.toLowerCase()
.trim(),

password: z
.string()
.min(1, `la contraseña es requerida`)
})
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>