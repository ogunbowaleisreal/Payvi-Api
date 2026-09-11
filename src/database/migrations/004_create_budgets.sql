CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    category_id INTEGER NOT NULL
        REFERENCES categories(id)
        ON DELETE RESTRICT,

    amount NUMERIC(12, 2) NOT NULL
        CHECK (amount > 0),

    month DATE NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT budgets_user_category_month_unique
        UNIQUE (user_id, category_id, month)
);