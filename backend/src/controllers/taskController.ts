import { Response } from 'express'
import Task from '../models/Task'
import { AuthRequest } from '../middlewares/auth'

// Obtener todas las tareas del usuario
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { completed, limit = '50', page = '1' } = req.query

    // Construir filtro
    const filter: any = { userId: req.userId }
    
    // Filtrar por estado (completada o no)
    if (completed !== undefined) {
      filter.completed = completed === 'true'
    }

    // Paginación
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Obtener tareas
    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip)

    // Contar total
    const total = await Task.countDocuments(filter)

    res.json({
      tasks,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Error en getTasks:', error)
    res.status(500).json({ message: 'Error al obtener tareas' })
  }
}

// Obtener una tarea específica
export const getTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const task = await Task.findOne({ _id: id, userId: req.userId })

    if (!task) {
      res.status(404).json({ message: 'Tarea no encontrada' })
      return
    }

    res.json(task)
  } catch (error) {
    console.error('Error en getTaskById:', error)
    res.status(500).json({ message: 'Error al obtener tarea' })
  }
}

// Crear tarea
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body

    // Validar título
    if (!title || title.trim() === '') {
      res.status(400).json({ message: 'El título es requerido' })
      return
    }

    // Validar longitud
    if (title.length > 200) {
      res.status(400).json({ message: 'El título no puede exceder 200 caracteres' })
      return
    }

    if (description && description.length > 1000) {
      res.status(400).json({ message: 'La descripción no puede exceder 1000 caracteres' })
      return
    }

    const task = new Task({
      title: title.trim(),
      description: description?.trim() || '',
      userId: req.userId
    })

    await task.save()

    res.status(201).json({
      message: 'Tarea creada exitosamente',
      task
    })
  } catch (error) {
    console.error('Error en createTask:', error)
    res.status(500).json({ message: 'Error al crear tarea' })
  }
}

// Actualizar tarea
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { title, description, completed } = req.body

    // Validar que venga al menos un campo
    if (title === undefined && description === undefined && completed === undefined) {
      res.status(400).json({ message: 'Debes proporcionar al menos un campo para actualizar' })
      return
    }

    // Validaciones
    if (title !== undefined) {
      if (!title || title.trim() === '') {
        res.status(400).json({ message: 'El título no puede estar vacío' })
        return
      }
      if (title.length > 200) {
        res.status(400).json({ message: 'El título no puede exceder 200 caracteres' })
        return
      }
    }

    if (description !== undefined && description.length > 1000) {
      res.status(400).json({ message: 'La descripción no puede exceder 1000 caracteres' })
      return
    }

    // Construir objeto de actualización
    const updateData: any = {}
    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description.trim()
    if (completed !== undefined) updateData.completed = completed

    // Actualizar tarea
    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { $set: updateData },
      { new: true }
    )

    if (!task) {
      res.status(404).json({ message: 'Tarea no encontrada' })
      return
    }

    res.json({
      message: 'Tarea actualizada exitosamente',
      task
    })
  } catch (error) {
    console.error('Error en updateTask:', error)
    res.status(500).json({ message: 'Error al actualizar tarea' })
  }
}

// Marcar tarea como completada/no completada
export const toggleTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // Buscar tarea
    const task = await Task.findOne({ _id: id, userId: req.userId })

    if (!task) {
      res.status(404).json({ message: 'Tarea no encontrada' })
      return
    }

    // Alternar estado
    task.completed = !task.completed
    await task.save()

    res.json({
      message: `Tarea marcada como ${task.completed ? 'completada' : 'pendiente'}`,
      task
    })
  } catch (error) {
    console.error('Error en toggleTaskStatus:', error)
    res.status(500).json({ message: 'Error al actualizar estado de tarea' })
  }
}

// Eliminar tarea
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const task = await Task.findOneAndDelete({ _id: id, userId: req.userId })

    if (!task) {
      res.status(404).json({ message: 'Tarea no encontrada' })
      return
    }

    res.json({
      message: 'Tarea eliminada exitosamente',
      task
    })
  } catch (error) {
    console.error('Error en deleteTask:', error)
    res.status(500).json({ message: 'Error al eliminar tarea' })
  }
}

// Eliminar todas las tareas completadas
export const deleteCompletedTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await Task.deleteMany({ 
      userId: req.userId, 
      completed: true 
    })

    res.json({
      message: `${result.deletedCount} tarea(s) completada(s) eliminada(s)`,
      deletedCount: result.deletedCount
    })
  } catch (error) {
    console.error('Error en deleteCompletedTasks:', error)
    res.status(500).json({ message: 'Error al eliminar tareas completadas' })
  }
}