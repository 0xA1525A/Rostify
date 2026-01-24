CREATE TABLE IF NOT EXISTS roles (
    id      INTEGER     PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER     FOREIGN KEY REFERENCES units(id) NOT NULL,
    name    VARCHAR(50) NOT NULL CHECK (length(name) >= 1 AND length(name) <= 50),

    UNIQUE (unit_id, name)
);