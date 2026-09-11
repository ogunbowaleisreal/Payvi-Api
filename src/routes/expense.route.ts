// import { Router } from "express";
// import { ExpenseController } from "../controller/expense.controller.js";
// import { ClientAuthMiddleware } from "../middleware/user.auth.middleware.js";

// const router = Router();

// const expenseController = new ExpenseController();

// router.use(ClientAuthMiddleware);

// router.post("/", (req, res) =>
//     expenseController.create(req, res)
// );

// router.get("/", (req, res) =>
//     expenseController.getAll(req, res)
// );

// router.get("/:id", (req, res) =>
//     expenseController.getOne(req, res)
// );

// router.patch("/:id", (req, res) =>
//     expenseController.update(req, res)
// );

// router.delete("/:id", (req, res) =>
//     expenseController.delete(req, res)
// );

// export default router;