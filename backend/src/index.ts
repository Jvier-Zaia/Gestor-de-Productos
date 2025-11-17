import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { connectDB } from './config/database'
import authRoutes from './routes/authRoutes'
import taskRoutes from './routes/taskRoutes'
import productRoutes from './routes/productRoutes'

// Cargar variables de entorno
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true, limit: '10mb' })) // Para parsear FormData

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Conectar a MongoDB
connectDB()

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/products', productRoutes)

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: '🔥 Backend funcionando correctamente' })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})