// import type {
//     Response,
// } from "express";

// import type {
//     AuthenticatedRequest,
// } from "../middleware/user.auth.middleware.js";

// import { ExpenseService } from "../services/shared/expense.service.js";

// export class ExpenseController {
//     private expenseService: ExpenseService;

//     constructor() {
//         this.expenseService = new ExpenseService();
//     }

//     async create(
//         req: AuthenticatedRequest,
//         res: Response
//     ) {
//         const expense =
//             await this.expenseService.createExpense(
//                 req.userId!,
//                 req.body
//             );

//         return res.status(201).json(expense);
//     }

//     async getAll(
//         req: AuthenticatedRequest,
//         res: Response
//     ) {
//         const expenses =
//             await this.expenseService.getExpenses(
//                 req.userId!
//             );

//         return res.status(200).json(expenses);
//     }

//     async getOne(
//         req: AuthenticatedRequest,
//         res: Response
//     ) {
//         const expense =
//             await this.expenseService.getExpense(
//                 req.userId!,
//                 Number(req.params.id)
//             );

//         return res.status(200).json(expense);
//     }

//     async update(
//         req: AuthenticatedRequest,
//         res: Response
//     ) {
//         const expense =
//             await this.expenseService.updateExpense(
//                 req.userId!,
//                 Number(req.params.id),
//                 req.body
//             );

//         return res.status(200).json(expense);
//     }

//     async delete(
//         req: AuthenticatedRequest,
//         res: Response
//     ) {
//         await this.expenseService.deleteExpense(
//             req.userId!,
//             Number(req.params.id)
//         );

//         return res.status(204).send();
//     }
// }