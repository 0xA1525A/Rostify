CREATE TABLE IF NOT EXISTS staff_roles (
    id       INTEGER PRIMARY KEY,
    staff_id INTEGER NOT NULL,
    role_id  INTEGER NOT NULL,

    efficiency INTEGER NOT NULL CHECK (efficiency BETWEEN 1 AND 5),
    preference INTEGER NOT NULL CHECK (preference BETWEEN 1 AND 5),

    FOREIGN KEY (staff_id) REFERENCES staff(id),
    FOREIGN KEY (role_id)  REFERENCES roles(id),

    UNIQUE (staff_id, role_id)
)