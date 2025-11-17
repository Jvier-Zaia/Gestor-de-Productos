import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || ''
    
    await mongoose.connect(mongoURI)
    
    console.log('✅ MongoDB conectado correctamente')
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error)
    process.exit(1)
  }
}  