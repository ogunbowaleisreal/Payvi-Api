import pool from "../config/database.js";
import type {
    CreateExpenseInput,
    Expense,
    UpdateExpenseInput,
} from "../interfaces/expenes.interface.js";

export class ExpenseRepository {
    async createExpense(
        userId: number,
        payload: CreateExpenseInput
    ): Promise<Expense> {
        const query = `
      INSERT INTO expenses (
        user_id,
        category_id,
        amount,
        description,
        expense_date
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        user_id,
        category_id,
        amount,
        description,
        expense_date,
        created_at;
    `;

        const values = [
            userId,
            payload.categoryId,
            payload.amount,
            payload.description ?? null,
            payload.expenseDate ?? null,
        ];

        const result = await pool.query<Expense>(
            query,
            values
        );

        return result.rows[0] as Expense;
    }

    async findExpensesByUser(
        userId: number
    ): Promise<Expense[]> {
        const query = `
      SELECT
        id,
        user_id,
        category_id,
        amount,
        description,
        expense_date,
        created_at
      FROM expenses
      WHERE user_id = $1
      ORDER BY expense_date DESC, created_at DESC;
    `;

        const result = await pool.query<Expense>(
            query,
            [userId]
        );

        return result.rows;
    }

    async findExpenseById(
        userId: number,
        expenseId: number
    ): Promise<Expense | null> {
        const query = `
      SELECT
        id,
        user_id,
        category_id,
        amount,
        description,
        expense_date,
        created_at
      FROM expenses
      WHERE id = $1
        AND user_id = $2;
    `;

        const result = await pool.query<Expense>(
            query,
            [expenseId, userId]
        );

        return result.rows[0] ?? null;
    }

    async updateExpense(
        userId: number,
        expenseId: number,
        payload: UpdateExpenseInput
    ): Promise<Expense | null> {
        const query = `
      UPDATE expenses
      SET
        category_id = COALESCE($1, category_id),
        amount = COALESCE($2, amount),
        description = COALESCE($3, description),
        expense_date = COALESCE($4, expense_date)
      WHERE id = $5
        AND user_id = $6
      RETURNING
        id,
        user_id,
        category_id,
        amount,
        description,
        expense_date,
        created_at;
    `;

        const values = [
            payload.categoryId ?? null,
            payload.amount ?? null,
            payload.description ?? null,
            payload.expenseDate ?? null,
            expenseId,
            userId,
        ];

        const result = await pool.query<Expense>(
            query,
            values
        );

        return result.rows[0] ?? null;
    }

    async deleteExpense(
        userId: number,
        expenseId: number
    ): Promise<boolean> {
        const query = `
      DELETE FROM expenses
      WHERE id = $1
        AND user_id = $2;
    `;

        const result = await pool.query(query, [
            expenseId,
            userId,
        ]);

        return result.rowCount === 1;
    }
}