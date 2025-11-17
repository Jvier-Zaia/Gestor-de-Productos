import { Router } from 'express'
import ProductController from '../controllers/productController'
import { authMiddleware } from '../middlewares/auth'
import { upload, handleMulterError } from '../middlewares/upload'

const router = Router()

// Todas las rutas protegidas con authMiddleware
router.get("/", authMiddleware, ProductController.getAllProducts)
router.get("/:id", authMiddleware, ProductController.getProduct)
router.post("/", authMiddleware, upload.single('image'), handleMulterError, ProductController.addProduct)
router.patch("/:id", authMiddleware, upload.single('image'), handleMulterError, ProductController.updateProduct)
router.delete("/:id", authMiddleware, ProductController.deleteProduct)
export default router
