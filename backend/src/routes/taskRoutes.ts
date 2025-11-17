import { Router } from 'express'
import { 
  getTasks, 
  getTaskById,
  createTask, 
  updateTask,
  toggleTaskStatus,
  deleteTask,
  deleteCompletedTasks
} from '../controllers/taskController'
import { authMiddleware } from '../middlewares/auth'

const router = Router()

// Todas las rutas protegidas con authMiddleware
router.get('/', authMiddleware, getTasks)
router.get('/:id', authMiddleware, getTaskById)
router.post('/', authMiddleware, createTask)
router.put('/:id', authMiddleware, updateTask)
router.patch('/:id/toggle', authMiddleware, toggleTaskStatus)
router.delete('/:id', authMiddleware, deleteTask)
router.delete('/completed/all', authMiddleware, deleteCompletedTasks)

export default router