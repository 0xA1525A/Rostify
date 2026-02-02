CREATE TABLE IF NOT EXISTS roles (
    id      INTEGER     PRIMARY KEY,
    unit_id INTEGER     NOT NULL,
    name    VARCHAR(50) NOT NULL CHECK (length(name) <= 50),

    is_sub_unit INTEGER NOT NULL CHECK (is_sub_unit IN (0, 1)),

    mental_load   INTEGER NOT NULL CHECK (mental_load BETWEEN 1 AND 5),
    physical_load INTEGER NOT NULL CHECK (physical_load BETWEEN 1 AND 5),
    
    min_staff_amt INTEGER NOT NULL CHECK (min_staff_amt > 0),
    nor_staff_amt INTEGER NOT NULL CHECK (nor_staff_amt >= min_staff_amt),
    max_staff_amt INTEGER NOT NULL CHECK (max_staff_amt >= nor_staff_amt),

    FOREIGN KEY (unit_id) REFERENCES units(id)
)