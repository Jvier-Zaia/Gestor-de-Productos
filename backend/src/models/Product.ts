import mongoose, { Document, Schema } from 'mongoose'

export interface IProduct extends Document {
  name: string
  description: string
  price: number
  stock: number
  category: string
  imageUrl?: string
  userId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: ['electronics', 'clothing', 'food', 'books', 'toys', 'other']
    },
    imageUrl: {
      type: String,
      trim: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true // Agrega createdAt y updatedAt automáticamente
  }
)

export default mongoose.model<IProduct>('Product', productSchema)