import { Router } from 'express';
import { BudgetController } from '../controllers/BudgetController';
import {
  validateBudgetId,
  validateBudgetBody,
  validateBudgetExists,
  hasAccess,
} from '../middlewares/budget';
import handleInputErrors from '../middlewares/validation';
import expenseRoutes from './expenseRouter';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.param('budgetId', validateBudgetId); //seteamos para que cuando utilicemos el param "ID" utilice el middleware validateBudgetId
router.param('budgetId', validateBudgetExists); //seteamos para que cuando utilicemos el param "ID" utilice el middleware validateBudgetExists
router.param('budgetId', hasAccess); //seteamos para que cuando utilicemos el param "ID" utilice el middleware validateBudgetExists

//GET Methods
router.get('/', BudgetController.getAll);
router.get('/:budgetId', handleInputErrors, BudgetController.getById);

//POST Methods
router.post(
  '/',
  validateBudgetBody,
  handleInputErrors,
  BudgetController.create
);

// PUT Methods
router.put(
  '/:budgetId',
  validateBudgetBody,
  handleInputErrors,
  BudgetController.updateById
);

//DELETE Methods
router.delete('/:budgetId', handleInputErrors, BudgetController.deleteById);

//*Routes for expenses
router.use('/:budgetId/expenses', expenseRoutes);

export default router;
