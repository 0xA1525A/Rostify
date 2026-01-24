CREATE TABLE IF NOT EXISTS staff_roles (
    staff_id   INTEGER NOT NULL,
    role_id    INTEGER NOT NULL,
    efficiency INTEGER NOT NULL CHECK (efficiency >= 0 AND efficiency <= 5),

    PRIMARY KEY (staff_id, role_id),
    FOREIGN KEY (staff_id) REFERENCES staff(id),
    FOREIGN KEY (role_id)  REFERENCES roles(id)
);