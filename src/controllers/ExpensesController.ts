import type { Request, Response } from 'express'
import Expense from '../models/Expense'

export class ExpensesController {
    static getAll = async (req: Request, res: Response) => {
      console.log("desde getAll")
    }
  
    static create = async (req: Request, res: Response) => {
      try {
        const expense = await Expense.create(req.body)
        expense.budgetId = req.budget.id
        await expense.save()
        res.status(201).json({message: "Gasto creado con éxito"})
      } catch (error) {
        res.status(500).json({error: "Hubo un error"})
      }
    }
  
    static getById = async (req: Request, res: Response) => {
      res.status(202).json(req.expense)
    }

    static updateById = async (req: Request, res: Response) => {
      await req.expense.update(req.body)
      res.status(201).json({message: "Gasto actualizado con éxito"})
    }
  
    static deleteById = async (req: Request, res: Response) => {
      const expense = req.expense
      await expense.destroy()
      res.status(200).json({message: "Gasto eliminado con éxito"})
    }
}