CREATE TABLE IF NOT EXISTS staff (
    id        INTEGER      PRIMARY KEY AUTOINCREMENT,
    full_name VARCHAR(100) NOT NULL CHECK (length(full_name) >= 1 AND length(full_name) <= 100),
    alias     VARCHAR(20)  NOT NULL CHECK (length(alias) >= 1 AND length(alias) <= 20)
);