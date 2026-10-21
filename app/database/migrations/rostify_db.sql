CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- FOR DEVELOPMENT ONLY DONT RUN THIS IN PROD!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

DROP TABLE IF EXISTS generated_staff_tasks CASCADE;
DROP TABLE IF EXISTS generated_staff_cio_splits CASCADE;
DROP TABLE IF EXISTS generated_staff_cio_records CASCADE;
DROP TABLE IF EXISTS staff_positions_preferences CASCADE;
DROP TABLE IF EXISTS staff_shifts_preferences CASCADE;
DROP TABLE IF EXISTS between_staff_preferences CASCADE;
DROP TABLE IF EXISTS staff_availability CASCADE;
DROP TABLE IF EXISTS logins CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS shifts CASCADE;
DROP TABLE IF EXISTS staff_tels CASCADE;
DROP TABLE IF EXISTS staff_emails CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS positions CASCADE;
DROP TABLE IF EXISTS units CASCADE;

DROP TYPE IF EXISTS e_weekdays CASCADE;
DROP TYPE IF EXISTS e_shifts CASCADE;
DROP TYPE IF EXISTS e_clock_events CASCADE;

DROP DOMAIN IF EXISTS d_range_0_to_5 CASCADE;

-- type aliases + enums

CREATE DOMAIN d_range_0_to_5
	AS SMALLINT
    CHECK (VALUE BETWEEN 0 AND 5);

CREATE TYPE e_shifts AS ENUM (
    'open',
    'early',
    'mid',
    'late',
    'close'
);

CREATE TYPE e_weekdays AS ENUM (
    'mon',
    'tue',
    'wed',
    'thu',
    'fri',
    'sat',
    'sun'
);

CREATE TYPE e_clock_events AS ENUM (
    'in',
    'out'
);

CREATE TABLE IF NOT EXISTS units (
    id              SMALLINT        NOT NULL
                                    GENERATED ALWAYS
                                    AS IDENTITY,
    name            VARCHAR(25)     NOT NULL,
    description     VARCHAR(200)    NOT NULL,

    CONSTRAINT pkey__units
        PRIMARY KEY (id),

    CONSTRAINT uniq__units__name
        UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS positions (
    id              SMALLINT        NOT NULL
                                    GENERATED ALWAYS
                                    AS IDENTITY,
    unit_id         SMALLINT        NOT NULL,
    name            VARCHAR(25)     NOT NULL,
    description     VARCHAR(200)    NOT NULL,

    physical_load   d_range_0_to_5  NOT NULL,
    mental_load     d_range_0_to_5  NOT NULL,
    risk_level      d_range_0_to_5  NOT NULL,

    minimum_staff       SMALLINT    NOT NULL,
    target_staff        SMALLINT    NOT NULL,
    maximum_staff       SMALLINT    NOT NULL,

    minimum_sum_proficiency SMALLINT,
    target_sum_proficiency  SMALLINT,
    maximum_sum_proficiency SMALLINT,

    is_prioritising_staff_amount    BOOLEAN NOT NULL,

    CONSTRAINT pkey__positions
        PRIMARY KEY (id),

    CONSTRAINT fkey__positions__unit_id
        FOREIGN KEY (unit_id)
            REFERENCES units(id)
            ON UPDATE RESTRICT
            ON DELETE CASCADE,

    CONSTRAINT cond__positions__valid_staff_count
        CHECK (
            minimum_staff >= 0
        AND target_staff  >= minimum_staff
        AND maximum_staff >= target_staff
        ),

    CONSTRAINT cond__positions__minimum_sum_prof_requires_maximum_sum_prof
        CHECK (
            minimum_sum_proficiency IS     NULL
        OR  maximum_sum_proficiency IS NOT NULL
        ),

    CONSTRAINT cond__positions__min_sum_prof_cannot_exceed_max_sum_prof
        CHECK (
            minimum_sum_proficiency IS NULL
        OR  minimum_sum_proficiency <= maximum_sum_proficiency
        ),

    CONSTRAINT cond__positions__targ_sum_prof_cannot_be_less_than_min_sum_prof
        CHECK (
            target_sum_proficiency  IS NULL
        OR  minimum_sum_proficiency IS NULL
        OR  target_sum_proficiency  >= minimum_sum_proficiency
        ),

    CONSTRAINT cond__positions__targ_sum_prof_cannot_exceed_max_sum_prof
        CHECK (
            target_sum_proficiency  IS NULL
        OR  maximum_sum_proficiency IS NULL
        OR  target_sum_proficiency  <= maximum_sum_proficiency
        ),

    CONSTRAINT cond__positions__min_sum_prof_cannot_be_negative
        CHECK (
            minimum_sum_proficiency IS NULL
        OR  minimum_sum_proficiency >= 0
        ),

    CONSTRAINT cond__positions__targ_sum_prof_cannot_be_negative
        CHECK (
            target_sum_proficiency  IS NULL
        OR  target_sum_proficiency  >= 0
        ),

    CONSTRAINT cond__positions__max_sum_prof_cannot_be_negative
        CHECK (
            maximum_sum_proficiency IS NULL
        OR  maximum_sum_proficiency >= 0
        )
);

CREATE TABLE IF NOT EXISTS shifts (
    id              SMALLINT        NOT NULL
                                    GENERATED ALWAYS
                                    AS IDENTITY,
    day             e_weekdays      NOT NULL,
    is_holiday      BOOLEAN         NOT NULL,

    name            e_shifts        NOT NULL,
    description     VARCHAR(200)    NOT NULL,

    from_time       TIME            NOT NULL,
    to_time         TIME            NOT NULL,
    is_overnight    BOOLEAN         NOT NULL,

    CONSTRAINT pkey__shifts
        PRIMARY KEY (id),

    CONSTRAINT cond__shifts__not_overnight_requires_forward_time
        CHECK (
            is_overnight = TRUE
        OR  to_time      > from_time
        ),

    CONSTRAINT uniq__shifts__1_day_1_holiday_1_name
        UNIQUE (day, is_holiday, name)
);

CREATE TABLE IF NOT EXISTS tasks (
    id              SMALLINT        NOT NULL
                                    GENERATED ALWAYS
                                    AS IDENTITY,
    day             e_weekdays      NOT NULL,
    is_holiday      BOOLEAN         NOT NULL,

    name            VARCHAR(50)     NOT NULL,
    description     VARCHAR(200)    NOT NULL,

    responsible_unit_id     SMALLINT,
    responsible_position_id SMALLINT,

    CONSTRAINT pkey__tasks
        PRIMARY KEY (id),

    CONSTRAINT fkey__tasks__responsible_unit_id
        FOREIGN KEY (responsible_unit_id)
            REFERENCES units(id)
            ON UPDATE RESTRICT
            ON DELETE CASCADE,

    CONSTRAINT fkey__tasks__responsible_position_id
        FOREIGN KEY (responsible_position_id)
            REFERENCES positions(id)
            ON UPDATE RESTRICT
            ON DELETE CASCADE,

    CONSTRAINT uniq__tasks__1_day_and_is_holiday_1_name
        UNIQUE (day, is_holiday, name),

    CONSTRAINT cond__tasks__either_none_1_position_or_unit_responsible_at_once
        CHECK (num_nonnulls(responsible_unit_id, responsible_position_id) < 2)
);

CREATE TABLE IF NOT EXISTS staff (
    id              UUID            NOT NULL
                                    DEFAULT gen_random_uuid(),
    badge_id        VARCHAR(10)     NOT NULL,
    first_name      VARCHAR(25)     NOT NULL,
    middle_name     VARCHAR(25)     ,
    last_name       VARCHAR(50)     NOT NULL,

    date_of_birth   DATE            NOT NULL,
    is_manager      BOOLEAN         NOT NULL,

    CONSTRAINT pkey__staff
        PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS staff_tels (
    id              INT             NOT NULL
                                    GENERATED ALWAYS
                                    AS IDENTITY,
    staff_id        UUID            NOT NULL,
    tel             VARCHAR(16)     NOT NULL,

    CONSTRAINT pkey__staff_tels
        PRIMARY KEY (id),

    CONSTRAINT fkey__staff_tels__staff_id
        FOREIGN KEY (staff_id)
            REFERENCES staff(id)
            ON UPDATE RESTRICT
            ON DELETE CASCADE,

    CONSTRAINT uniq__staff_tels__staff_id_tels
        UNIQUE (staff_id, tel),

    CONSTRAINT cond__staff_tels__only_allow_e164_format
        CHECK (tel ~ '^\+[1-9]\d{1,14}$')
);

CREATE TABLE IF NOT EXISTS staff_emails (
    id              INT             NOT NULL
                                    GENERATED ALWAYS
                                    AS IDENTITY,
    staff_id        UUID            NOT NULL,
    email           VARCHAR(255)    NOT NULL,

    CONSTRAINT pkey__staff_emails
        PRIMARY KEY (id),

    CONSTRAINT fkey__staff_emails__staff_id
        FOREIGN KEY (staff_id)
            REFERENCES staff(id)
            ON UPDATE RESTRICT
            ON DELETE CASCADE,

    CONSTRAINT uniq__staff_emails__email
        UNIQUE (email),

    CONSTRAINT cond__staff_emails__email_must_be_all_lower_case
        CHECK (email = lower(email))
);

CREATE TABLE IF NOT EXISTS logins (
    staff_id        UUID            NOT NULL,
    username        VARCHAR(20)     NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,

    CONSTRAINT pkey__logins
        PRIMARY KEY (staff_id),

    CONSTRAINT fkey__logins__staff_id
        FOREIGN KEY (staff_id)
            REFERENCES staff(id)
            ON UPDATE RESTRICT
            ON DELETE CASCADE,

    CONSTRAINT uniq__logins__username
        UNIQUE (username),

    CONSTRAINT cond__logins__username_must_be_all_lower_case
        CHECK (username = lower(username))
);

CREATE TABLE IF NOT EXISTS staff_availability (
    date            DATE            NOT NULL,
    staff_id        UUID            NOT NULL,

    from_time       TIME,
    to_time         TIME,
    to_date         DATE,

    is_flexible     BOOLEAN         NOT NULL,
    ok_overtime     BOOLEAN         NOT NULL,
    ok_multiple_break       BOOLEAN NOT NULL,
    ok_long_break           BOOLEAN NOT NULL,

    prefered_hour           SMALLINT    ,
    prefered_break_hour     SMALLINT    ,
    prefered_shift          e_shifts    ,

    CONSTRAINT pkey__staff_availability
        PRIMARY KEY (date, staff_id),

    CONSTRAINT fkey__staff_availability__staff_id
        FOREIGN KEY (staff_id)
            REFERENCES staff(id)
            ON UPDATE RESTRICT
            ON DELETE CASCADE,

    CONSTRAINT cond__staff_availability__not_flexible_then_specify_datetime
        CHECK (
            is_flexible = TRUE
        OR  (
                from_time IS NOT NULL
            OR  to_time   IS NOT NULL
            OR  to_date   IS NOT NULL
            )
        ),

    CONSTRAINT cond__staff_availability__flexible_then_datetime_must_be_null
        CHECK (
            is_flexible = FALSE
        OR  (
                from_time IS NULL
            AND to_time   IS NULL
            AND to_date   IS NULL
            )
        ),

    CONSTRAINT cond__staff_availability__to_date_requires_to_time
        CHECK (
            to_date IS     NULL
        OR  to_time IS NOT NULL
        ),

    CONSTRAINT cond__staff_availability__to_date_cannot_be_in_the_past
        CHECK (
            to_date IS NULL
        OR  to_date >= date
        ),

    CONSTRAINT cond__staff_availability__backward_time_requires_to_date
        CHECK (
            from_time IS NULL
        OR  to_time   IS NULL
        OR  to_time   >  from_time
        OR  (
                to_date  IS NOT NULL
            AND to_date  >      date
            )
        ),

    CONSTRAINT cond__staff_availability__to_date_only_allow_1_overnight
        CHECK (
            to_date IS NULL
        OR  to_date <= (date + 1)
        ),

    CONSTRAINT cond__staff_availability__specified_pref_hour_at_least_1
        CHECK (
            prefered_hour IS NULL
        OR  prefered_hour >= 1
        ),

    CONSTRAINT cond__staff_availability__specified_pref_break_hour_at_least_1
        CHECK (
            prefered_break_hour IS NULL
        OR  prefered_break_hour >= 1
        )
);

-- rostify generated result

CREATE TABLE IF NOT EXISTS generated_staff_cio_records (
    id              BIGINT          NOT NULL
                                    GENERATED ALWAYS
                                    AS IDENTITY,
    date            DATE            NOT NULL,
    staff_id        UUID            NOT NULL,

    CONSTRAINT pkey__generated_staff_cio_records
        PRIMARY KEY (id),

    CONSTRAINT fkey__generated_staff_cio_records__staff_id
        FOREIGN KEY (staff_id)
            REFERENCES staff(id)
            ON UPDATE RESTRICT
            ON DELETE CASCADE,

    CONSTRAINT uniq__generated_staff_cio_records__1_staff_1_date_1_record
        UNIQUE (date, staff_id)
);

CREATE TABLE IF NOT EXISTS generated_staff_cio_splits (
    cio_record_id   BIGINT          NOT NULL,
    date_time       TIMESTAMP       WITH TIME ZONE
                                    NOT NULL,
    clock_event     e_clock_events  NOT NULL,

    CONSTRAINT pkey__generated_staff_cio_splits
        PRIMARY KEY (cio_record_id, date_time),

    CONSTRAINT fkey__generated_staff_cio_splits__cio_record_id
        FOREIGN KEY (cio_record_id)
            REFERENCES generated_staff_cio_records(id)
            ON UPDATE RESTRICT
            ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS generated_staff_tasks (
    id              BIGINT          NOT NULL
                                    GENERATED ALWAYS
                                    AS IDENTITY,
    date            DATE            NOT NULL,
    staff_id        UUID            NOT NULL,
    task_id         SMALLINT        NOT NULL,

    CONSTRAINT pkey__generated_staff_tasks
        PRIMARY KEY (id),

    CONSTRAINT fkey__generated_staff_tasks__staff_id
        FOREIGN KEY (staff_id)
            REFERENCES staff(id)
            ON UPDATE RESTRICT
            ON DELETE CASCADE,

    CONSTRAINT fkey__generated_staff_tasks__task_id
        FOREIGN KEY (task_id)
            REFERENCES tasks(id)
            ON UPDATE RESTRICT
            ON DELETE CASCADE,

    CONSTRAINT uniq__generated_staff_tasks__1_staff_1_task
        UNIQUE (date, staff_id, task_id)
);

-- preferences and proficiencies

CREATE TABLE IF NOT EXISTS staff_shifts_preferences (
    staff_id        UUID            NOT NULL,
	shift_id        SMALLINT        NOT NULL,

    preference      d_range_0_to_5  NOT NULL,
    proficiency     d_range_0_to_5  NOT NULL,

    CONSTRAINT pkey__staff_shifts_preferences
        PRIMARY KEY (staff_id, shift_id),

    CONSTRAINT fkey__staff_shifts_preferences__staff_id
        FOREIGN KEY (staff_id)
            REFERENCES staff(id)
            ON UPDATE RESTRICT
            ON DELETE CASCADE,

    CONSTRAINT fkey__staff_shifts_preferences__shift_id
        FOREIGN KEY (shift_id)
            REFERENCES shifts(id)
            ON UPDATE RESTRICT
            ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS staff_positions_preferences (
    staff_id        UUID            NOT NULL,
    position_id     SMALLINT        NOT NULL,

    preference      d_range_0_to_5  NOT NULL,
    proficiency     d_range_0_to_5  NOT NULL,

    CONSTRAINT pkey__staff_positions_preferences
        PRIMARY KEY (staff_id, position_id),

    CONSTRAINT fkey__staff_positions_preferences__staff_id
        FOREIGN KEY (staff_id)
            REFERENCES staff(id)
            ON UPDATE RESTRICT
            ON DELETE CASCADE,

    CONSTRAINT fkey__staff_positions_preferences__position_id
        FOREIGN KEY (position_id)
            REFERENCES positions(id)
            ON UPDATE RESTRICT
            ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS between_staff_preferences (
    staff_a_id      UUID            NOT NULL,
    staff_b_id      UUID            NOT NULL,

    preference      d_range_0_to_5  NOT NULL,

    CONSTRAINT pkey__between_staff_preferences
        PRIMARY KEY (staff_a_id, staff_b_id),

    CONSTRAINT fkey__between_staff_preferences__staff_a_id
        FOREIGN KEY (staff_a_id)
            REFERENCES staff(id)
            ON UPDATE RESTRICT
            ON DELETE CASCADE,

    CONSTRAINT fkey__between_staff_preferences__staff_b_id
        FOREIGN KEY (staff_b_id)
            REFERENCES staff(id)
            ON UPDATE RESTRICT
            ON DELETE CASCADE,

    CONSTRAINT cond__between_staff_preferences__staff_ids_must_be_different
        CHECK (staff_a_id != staff_b_id)
);

-- indexes

CREATE UNIQUE INDEX uniqidx__between_staff_preferences__ab_ba_are_identical
    ON between_staff_preferences (
        LEAST(staff_a_id, staff_b_id),
        GREATEST(staff_a_id, staff_b_id)
    );

CREATE INDEX IF NOT EXISTS idx__positions__unit_id
    ON positions(unit_id);

CREATE INDEX IF NOT EXISTS idx__tasks__responsible_unit_id
    ON tasks(responsible_unit_id);

CREATE INDEX IF NOT EXISTS idx__tasks__responsible_position_id
    ON tasks(responsible_position_id);

CREATE INDEX IF NOT EXISTS idx__staff_shifts_preferences__shift_id
    ON staff_shifts_preferences(shift_id);

CREATE INDEX IF NOT EXISTS idx__staff_positions_preferences__position_id
    ON staff_positions_preferences(position_id);

CREATE INDEX IF NOT EXISTS idx__between_staff_preferences__staff_b_id
    ON between_staff_preferences(staff_b_id);

CREATE INDEX IF NOT EXISTS idx__generated_staff_tasks__staff_id
    ON generated_staff_tasks(staff_id);

CREATE INDEX IF NOT EXISTS idx__generated_staff_tasks__task_id
    ON generated_staff_tasks(task_id);