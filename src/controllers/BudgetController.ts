import type { Request, Response } from 'express';
import Budget from '../models/Budget';
import Expense from '../models/Expense';
import User from '../models/User';

export class BudgetController {
  static getAll = async (req: Request, res: Response) => {
    try {
      const budgets = await Budget.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
      });
      res.status(200).json(budgets);
      return;
    } catch (error) {
      res.status(500).json({ error: 'Error en la respuesta' });
    }
  };

  static create = async (req: Request, res: Response) => {
    try {
      const budget = await Budget.create(req.body);
      budget.userId = req.user.id;
      await budget.save();
      res.status(201).json({ message: 'Presupuesto creado correctamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error en la respuesta' });
    }
  };

  static getById = async (req: Request, res: Response) => {
    const budget = await Budget.findByPk(req.budget.id, {
      include: [Expense],
    });

    res.status(200).json(budget);
  };

  static updateById = async (req: Request, res: Response) => {
    const budget = req.budget;
    await budget.update(req.body);
    res.status(200).json({ message: 'Presupuesto actualizado con éxito' });
  };

  static deleteById = async (req: Request, res: Response) => {
    const budget = req.budget;
    await budget.destroy();
    res.status(200).json({ message: 'Presupuesto eliminado con éxito' });
  };
}
