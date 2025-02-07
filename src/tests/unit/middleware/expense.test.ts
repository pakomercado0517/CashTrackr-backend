import { createRequest, createResponse } from "node-mocks-http";
import { validateExpensetExists } from "../../../middlewares/expense";
import Expense from "../../../models/Expense";
import { expenses } from "../../mocks/expenses";
import { budgets } from "../../mocks/budgets";
import { hasAccess } from "../../../middlewares/budget";


jest.mock("../../../models/Expense", () => ({
  findByPk: jest.fn()
}))

describe("Expenses Middleware- validateExpenseExist", () => {
  beforeEach(() => {
    (Expense.findByPk as jest.Mock).mockImplementation((id) => {
      const expense = expenses.filter(e => e.id === id)[0] ?? null
      return Promise.resolve(expense)
    })
  })
  it("should handle a non-existent budget", async () => {
    const req = createRequest({
      params: {expenseId: 120}
    })
    const res = createResponse()
    const next = jest.fn()

    await validateExpensetExists(req, res, next)
    const data = res._getJSONData()
    
    expect(res.statusCode).toBe(404)
    expect(data).toEqual({error: "Gasto no encontrado"})
    expect(next).not.toHaveBeenCalled()
  })

  it("should call next middleware if expense exist", async () => {
    const req = createRequest({
      params: {expenseId: 1}
    })
    const res = createResponse()
    const next = jest.fn()

    await validateExpensetExists(req, res, next)
    
    expect(next).toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(req.expense).toEqual(expenses[0])
  })

  it("should handle internal server error", async () => {

    (Expense.findByPk as jest.Mock).mockRejectedValue(new Error)
    const req = createRequest({
      params: {expenseId: 120}
    })
    const res = createResponse()
    const next = jest.fn()

    await validateExpensetExists(req, res, next)
    const data = res._getJSONData()
    
    expect(res.statusCode).toBe(500)
    expect(data).toEqual({error: "Hubo un error"})
    expect(next).not.toHaveBeenCalled()
  })
  
  it("should prevent unauthorized users from adding expenses", () => {
    const req = createRequest({
      method: "POST",
      budget: budgets[0],
      user: {id:20},
      body: {name : "Test Expense", amount: 200}
    })
    const res = createResponse()
    const next= jest.fn()

    hasAccess(req, res, next)

    const data = res._getJSONData()
    expect(res.statusCode).toBe(401)
    expect(data).toEqual({error: "Acción no válida"})
    expect(next).not.toHaveBeenCalled()
  })
})