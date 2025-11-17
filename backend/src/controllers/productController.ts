

import { Request, Response } from "express"
import Product from "../models/Product"
import { Types } from "mongoose"
import { createProductsSchema, updateProductSchema } from "../validations/productValidation"

class ProductController {
  static getAllProducts = async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const products = await Product.find()
      res.json({ success: true, data: products })
    } catch (e) {
      const error = e as Error
      res.status(500).json({ success: false, error: error.message })
    }
  }

  static getProduct = async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id } = req.params

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: "ID Inválido" })
      }

      const product = await Product.findById(id)

      if (!product) {
        return res.status(404).json({ success: false, error: "Producto no encontrado" })
      }

      res.status(200).json({ success: true, data: product })
    } catch (e) {
      const error = e as Error
      console.error('Error en getProduct:', error)
      res.status(500).json({ success: false, error: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined })
    }
  }

  static addProduct = async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { body } = req
      const file = (req as any).file

      // Debug: Log del body recibido
      console.log('Body recibido:', body)
      console.log('Body type:', typeof body)
      console.log('Body keys:', Object.keys(body || {}))
      console.log('File recibido:', file ? file.filename : 'No hay archivo')

      // Construir datos del producto (FormData puede venir como strings)
      const productData: any = {
        name: body?.name,
        description: body?.description,
        category: body?.category,
        userId: body?.userId,
        price: body?.price ? (typeof body.price === 'string' ? parseFloat(body.price) : Number(body.price)) : undefined,
        stock: body?.stock ? (typeof body.stock === 'string' ? parseInt(body.stock) : Number(body.stock)) : undefined,
        sku: body?.sku || undefined
      }
      
      console.log('ProductData construido:', productData)

      // Validar que los campos requeridos estén presentes
      if (!productData.name || !productData.description || productData.price === undefined || productData.stock === undefined || !productData.category || !productData.userId) {
        return res.status(400).json({ 
          success: false, 
          error: "Todos los campos requeridos deben estar presentes",
          received: productData
        });
      }

      // Validar userId (debe ser ObjectId válido de 24 caracteres)
      if (productData.userId.length !== 24) {
        return res.status(400).json({ 
          success: false, 
          error: "userId inválido. Debe ser un ObjectId de MongoDB (24 caracteres)" 
        });
      }

      // Si hay imagen, agregar la URL
      if (file) {
        productData.imageUrl = `/uploads/${file.filename}`
      }

      const validator = createProductsSchema.safeParse(productData)

      if (!validator.success) {
        console.log('Error de validación:', validator.error.flatten().fieldErrors)
        return res.status(400).json({ 
          success: false, 
          error: validator.error.flatten().fieldErrors,
          data: productData
        });
      }

      const newProduct = new Product(validator.data)

      await newProduct.save()
      res.status(201).json({ success: true, data: newProduct })
    } catch (e) {
      const error = e as Error
      console.error('Error en addProduct:', error)
      res.status(500).json({ success: false, error: error.message, stack: error.stack })
    }
  }

  static updateProduct = async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id } = req.params
      const { body } = req
      const file = (req as any).file

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: "ID Inválido" })
      }

      // Construir datos de actualización (FormData puede venir como strings)
      const updateData: any = {}
      
      if (body?.name !== undefined && body?.name !== null && body?.name !== '') {
        updateData.name = String(body.name).trim()
      }
      if (body?.description !== undefined && body?.description !== null && body?.description !== '') {
        updateData.description = String(body.description).trim()
      }
      if (body?.category !== undefined && body?.category !== null && body?.category !== '') {
        updateData.category = body.category
      }
      if (body?.sku !== undefined && body?.sku !== null && body?.sku !== '') {
        updateData.sku = String(body.sku).trim()
      }
      
      // Convertir números si existen (importante: permitir 0 como valor válido)
      if (body?.price !== undefined && body?.price !== null && body?.price !== '') {
        const priceValue = typeof body.price === 'string' ? parseFloat(body.price) : Number(body.price)
        if (!isNaN(priceValue)) {
          updateData.price = priceValue
        }
      }
      if (body?.stock !== undefined && body?.stock !== null && body?.stock !== '') {
        const stockValue = typeof body.stock === 'string' ? parseInt(body.stock) : Number(body.stock)
        if (!isNaN(stockValue)) {
          updateData.stock = stockValue
        }
      }
      
      // Si hay imagen nueva, agregar la URL
      if (file) {
        updateData.imageUrl = `/uploads/${file.filename}`
      }

      // Si no hay datos para actualizar, retornar error
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ success: false, error: "No se proporcionaron datos para actualizar" })
      }

      console.log('Datos a actualizar:', updateData)

      const validator = updateProductSchema.safeParse(updateData)

      if (!validator.success) {
        console.log('Error de validación en updateProduct:', validator.error.flatten().fieldErrors)
        return res.status(400).json({ 
          success: false, 
          error: "Error de validación",
          details: validator.error.flatten().fieldErrors 
        });
      }

      const updatedProduct = await Product.findByIdAndUpdate(id, validator.data, { new: true })

      if (!updatedProduct) {
        return res.status(404).json({ success: false, error: "Producto no encontrado" })
      }

      res.json({ success: true, data: updatedProduct })
    } catch (e) {
      const error = e as Error
      console.error('Error en updateProduct:', error)
      res.status(500).json({ success: false, error: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined })
    }
  }

  static deleteProduct = async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const id = req.params.id

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: "ID Inválido" });
      }

      const deletedProduct = await Product.findByIdAndDelete(id)

      if (!deletedProduct) {
        return res.status(404).json({ success: false, error: "Producto no encontrado" })
      }

      res.json({ success: true, data: deletedProduct })
    } catch (e) {
      const error = e as Error
      console.error('Error en deleteProduct:', error)
      res.status(500).json({ success: false, error: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined })
    }
  }
}

export default ProductController