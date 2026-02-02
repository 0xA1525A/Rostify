CREATE TABLE IF NOT EXISTS shift_records (
    id            INTEGER PRIMARY KEY,
    arranged_date DATE    NOT NULL,
    arranged_time TIME    NOT NULL,
    staff_id      INTEGER NOT NULL,

    clocked_in  TIME,
    clocked_out TIME,

    late_minutes INTEGER CHECK (late_minutes IS NULL OR late_minutes > 0),

    notice VARCHAR CHECK (notice IN (
        'NO_SHOW',
        'ARRIVED_LATE',
        'LEFT_EARLY'
    )),
    reason VARCHAR CHECK (reason IN (
        'EMERGENCY',
        'MEDICAL',
        'PERSONAL',
        'MISCOMMUNICATION',
        'WEATHER',
        'TRAFFIC',
        'UNKNOWN',
        'MANAGEMENT_DECISION'
    )),

    FOREIGN KEY (staff_id) REFERENCES staff(id)
)