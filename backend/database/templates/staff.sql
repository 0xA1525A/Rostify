CREATE TABLE IF NOT EXISTS staff (
    id    INTEGER      PRIMARY KEY,
    name  VARCHAR(100) NOT NULL CHECK (length(name) <= 100),
    alias VARCHAR(25)  UNIQUE NOT NULL CHECK (length(alias) <= 25),

    could_open  INTEGER NOT NULL CHECK (could_open IN (0, 1)),
    could_mid   INTEGER NOT NULL CHECK (could_mid IN (0, 1)),
    could_close INTEGER NOT NULL CHECK (could_close IN (0, 1)),

    pref_shift VARCHAR CHECK (
        pref_shift IS NULL
        OR (pref_shift = 'OPENING'   AND could_open = 1)
        OR (pref_shift = 'MID_SHIFT' AND could_mid = 1)
        OR (pref_shift = 'CLOSING'   AND could_close = 1)
    )
)