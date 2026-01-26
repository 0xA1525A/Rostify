CREATE TABLE IF NOT EXISTS staff (
    id        INTEGER      PRIMARY KEY AUTOINCREMENT,
    full_name VARCHAR(100) NOT NULL CHECK (length(full_name) BETWEEN 1 AND 100),
    alias     VARCHAR(20)  NOT NULL CHECK (length(alias) BETWEEN 1 AND 20),

    preferred_shift INTEGER NOT NULL CHECK (preferred_shift BETWEEN 0 AND 3),
    biological_gender BOOLEAN NOT NULL,
    is_able_to_open BOOLEAN NOT NULL,
);