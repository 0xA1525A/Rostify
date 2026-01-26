CREATE TABLE IF NOT EXISTS roles (
    id      INTEGER     PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER     NOT NULL,
    name    VARCHAR(50) NOT NULL CHECK (length(name) BETWEEN 1 AND 50),
    
    workload_intensity    INTEGER NOT NULL CHECK (workload_intensity BETWEEN 1 AND 5),
    min_staff_operational INTEGER NOT NULL CHECK (min_staff_operational >= 1),

    FOREIGN KEY (unit_id) REFERENCES units(id)
);