CREATE TABLE IF NOT EXISTS staff_roles (
    staff_id   INTEGER NOT NULL,
    role_id    INTEGER NOT NULL,
    efficiency INTEGER NOT NULL CHECK (efficiency >= 1 AND efficiency <= 5),
    preference INTEGER NOT NULL CHECK (preference >= 1 AND preference <= 5),

    PRIMARY KEY (staff_id, role_id),
    FOREIGN KEY (staff_id) REFERENCES staff(id),
    FOREIGN KEY (role_id)  REFERENCES roles(id)
);