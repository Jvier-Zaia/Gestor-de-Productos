import { z } from "zod"

const ProductSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  stock: z.number().int().max(10000),
  price: z.number().min(0.01).max(9999999),
  sku: z.string().min(3).max(50).optional(),
  // SKU = Stock Keeping Unit (Unidad de Mantenimiento de Inventario)
  userId: z.string().min(24).max(24), // ← ObjectId de MongoDB tiene 24 caracteres
  category: z.enum(['electronics', 'clothing', 'food', 'books', 'toys', 'other']), // ← Debe coincidir con el enum del modelo
  imageUrl: z.string().optional(),
  createdAt: z.date().optional(),
  // createdAt = fecha de creación del producto en la base de datos.
});

export const createProductsSchema = ProductSchema

// Schema para actualizaciones parciales - más flexible
export const updateProductSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(500).optional(),
  stock: z.number().int().min(0).max(10000).optional(),
  price: z.number().min(0).max(9999999).optional(), // Permitir 0 para precio
  sku: z.string().min(3).max(50).optional(),
  userId: z.string().min(24).max(24).optional(),
  category: z.enum(['electronics', 'clothing', 'food', 'books', 'toys', 'other']).optional(),
  imageUrl: z.string().optional(),
  createdAt: z.date().optional(),
})