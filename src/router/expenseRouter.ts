import { Router } from 'express';
import { ExpensesController } from '../controllers/ExpensesController';
import {
  belongsToBudget,
  validateExpenseBody,
  validateExpensetExists,
  validateExpensetId,
} from '../middlewares/expense';
import handleInputErrors from '../middlewares/validation';

const router = Router();

router.param('expenseId', validateExpensetId);
router.param('expenseId', validateExpensetExists);
router.param('expenseId', belongsToBudget);

//GET Methods
router.get('/', ExpensesController.getAll);
router.get('/:expenseId', ExpensesController.getById);

//POST Methods
router.post('/', validateExpenseBody, ExpensesController.create);

//PUT Methods
router.put('/:expenseId', validateExpenseBody, ExpensesController.updateById);

//DELETE Methods
router.delete('/:expenseId', ExpensesController.deleteById);

export default router;
