CREATE TABLE IF NOT EXISTS units (
    id   INTEGER     PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL CHECK (length(name) >= 1 AND length(name) <= 50)
);