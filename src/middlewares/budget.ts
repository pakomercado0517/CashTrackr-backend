import { Request, Response, NextFunction } from "express"
import { validationResult } from "express-validator";
import { param, body } from "express-validator"
import Budget from "../models/Budget";

declare global {
  namespace Express {
    interface Request {
      budget: Budget
    }
  }
}

export const validateBudgetId = async (req: Request, res: Response, next: NextFunction) => {
  await param("budgetId")
    .isInt()
    .withMessage("ID no válido").bail()
    .custom((value) => value > 0)
    .withMessage("ID no válido").bail()
    .run(req)

    const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      } 
      next();
}

export const validateBudgetBody = async (req: Request, res: Response, next: NextFunction)=> {
  await body("name").notEmpty().withMessage("Nombre del presupuesto obligatorio").run(req),
  await body("amount")
      .isNumeric()
      .withMessage("Cantidad no válida")
      .custom((value) => value > 0)
      .withMessage("El presupuesto debe ser mayor a cero")
      .run(req)

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      } 
      next();
}

export const validateBudgetExists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {budgetId} = req.params
    const budget = await Budget.findByPk(budgetId)
    if(!budget) {
      const error = new Error("Presupuesto no encontrado")
      res.status(404).json({error: error.message})
      return 
    }
    req.budget = budget
    next()
  } catch (error) {
    res.status(500).json({error: "Hubo un error"})
  }
}

export const hasAccess = (req: Request, res: Response, next: NextFunction) => {
  if(req.budget.userId !== req.user.id) {
    const error = new Error("Acción no válida")
    res.status(401).json({error: error.message})
    return
  }

  next()
}