import { AppError } from "../../utils/app-error.js";
import { ExpenseRepository } from "../../repository/expense.repository.js";

import type {
    CreateExpenseInput,
    UpdateExpenseInput,
} from "../../interfaces/expenes.interface.js";

export class ExpenseService {
    private expenseRepository: ExpenseRepository;

    constructor() {
        this.expenseRepository = new ExpenseRepository();
    }

    async createExpense(
        userId: number,
        payload: CreateExpenseInput
    ) {
        if (!payload.categoryId) {
            throw new AppError("Category is required", 400);
        }

        if (!payload.amount || payload.amount <= 0) {
            throw new AppError(
                "Amount must be greater than zero",
                400
            );
        }

        return this.expenseRepository.createExpense(
            userId,
            payload
        );
    }

    async getExpenses(userId: number) {
        return this.expenseRepository.findExpensesByUser(
            userId
        );
    }

    async getExpense(
        userId: number,
        expenseId: number
    ) {
        const expense =
            await this.expenseRepository.findExpenseById(
                userId,
                expenseId
            );

        if (!expense) {
            throw new AppError("Expense not found", 404);
        }

        return expense;
    }

    async updateExpense(
        userId: number,
        expenseId: number,
        payload: UpdateExpenseInput
    ) {
        if (
            payload.amount !== undefined &&
            payload.amount <= 0
        ) {
            throw new AppError(
                "Amount must be greater than zero",
                400
            );
        }

        const expense =
            await this.expenseRepository.updateExpense(
                userId,
                expenseId,
                payload
            );

        if (!expense) {
            throw new AppError("Expense not found", 404);
        }

        return expense;
    }

    async deleteExpense(
        userId: number,
        expenseId: number
    ) {
        const deleted =
            await this.expenseRepository.deleteExpense(
                userId,
                expenseId
            );

        if (!deleted) {
            throw new AppError("Expense not found", 404);
        }
    }
}