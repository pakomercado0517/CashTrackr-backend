import { Request, Response, NextFunction } from "express";
import { body, validationResult, param } from "express-validator";
import Expense from "../models/Expense";

declare global  {
  namespace Express {
    interface Request {
      expense: Expense
    }
  }
}


export const validateExpenseBody = async (req: Request, res: Response, next: NextFunction) => {
  await body("name").notEmpty().withMessage("Nombre del gasto obligatorio").run(req),
    await body("amount")
        .isNumeric()
        .withMessage("Cantidad no válida")
        .custom((value) => value > 0)
        .withMessage("El gasto debe ser mayor a cero")
        .run(req)
  
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ errors: errors.array() });
          return;
        } 
        next();
}

export const validateExpensetId = async (req: Request, res: Response, next: NextFunction) => {
  await param("expenseId")
    .isInt()
    .withMessage("ID no válido")
    .custom((value) => value > 0)
    .withMessage("ID no válido").run(req)

    const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      } 
      next();
}

export const validateExpensetExists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {expenseId} = req.params
    const expense = await Expense.findByPk(expenseId)
    if(!expense) {
      const error = new Error("Gasto no encontrado")
      res.status(404).json({error: error.message})
      return 
    }
    req.expense = expense
    next()
  } catch (error) {
    res.status(500).json({error: "Hubo un error"})
  }
}