export interface CreateExpenseInput {
    categoryId: number;
    amount: number;
    description?: string;
    expenseDate?: string;
}

export interface UpdateExpenseInput {
    categoryId?: number;
    amount?: number;
    description?: string;
    expenseDate?: string;
}

export interface Expense {
    id: number;
    user_id: number;
    category_id: number;
    amount: string;
    description: string | null;
    expense_date: Date;
    created_at: Date;
}