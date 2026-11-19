import { SQL } from "bun";

import { Result } from "@lib:templates/result";

import type { ClockEvent, DailyRosterEntry, RosterPunch, RosterRecord } from "@model:rosters";

export async function getAllRosterRecords(sql: SQL): Promise<Result<Array<RosterRecord>>> {
    type R = Array<RosterRecord>;

    const result: R = await sql`
        SELECT  id::int AS "id",
                date::text AS "date",
                staff_id AS "staffID",
                shift_id AS "shiftID"

        FROM    roster_records

        ORDER BY
                date        ASC,
                staff_id    ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getRosterRecordsByDate(sql: SQL, date: string): Promise<Result<Array<RosterRecord>>> {
    type R = Array<RosterRecord>;

    const result: R = await sql`
        SELECT  id::int AS "id",
                date::text AS "date",
                staff_id AS "staffID",
                shift_id AS "shiftID"

        FROM    roster_records

        WHERE   date = ${ date }

        ORDER BY
                staff_id    ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getRosterRecordsByStaffID(sql: SQL, staffID: string): Promise<Result<Array<RosterRecord>>> {
    type R = Array<RosterRecord>;

    const result: R = await sql`
        SELECT  id::int AS "id",
                date::text AS "date",
                staff_id AS "staffID",
                shift_id AS "shiftID"

        FROM    roster_records

        WHERE   staff_id = ${ staffID }

        ORDER BY
                date    ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getRosterRecordByDateAndStaffID(
    sql: SQL,
    date: string,
    staffID: string
): Promise<Result<RosterRecord>> {
    type R = Array<RosterRecord>;

    const result: R = await sql`
        SELECT  id::int AS "id",
                date::text AS "date",
                staff_id AS "staffID",
                shift_id AS "shiftID"

        FROM    roster_records

        WHERE   date     = ${ date }
        AND     staff_id = ${ staffID }
    `;

    if (result.length === 0) {
        return new Result<RosterRecord>(false, null);
    }

    return new Result<RosterRecord>(true, result[0]);
}

export async function getRosterRecordByID(sql: SQL, rosterRecordID: number): Promise<Result<RosterRecord>> {
    type R = Array<RosterRecord>;

    const result: R = await sql`
        SELECT  id::int AS "id",
                date::text AS "date",
                staff_id AS "staffID",
                shift_id AS "shiftID"

        FROM    roster_records

        WHERE   id = ${ rosterRecordID }
    `;

    if (result.length === 0) {
        return new Result<RosterRecord>(false, null);
    }

    return new Result<RosterRecord>(true, result[0]);
}

export async function getAllRosterPunches(sql: SQL): Promise<Result<Array<RosterPunch>>> {
    type R = Array<RosterPunch>;

    const result: R = await sql`
        SELECT  roster_record_id::int AS "rosterRecordID",
                to_char(date_time AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "dateTime",
                clock_event      AS "clockEvent"

        FROM    roster_punches

        ORDER BY
                date_time   ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getRosterPunchesByRosterRecordID(sql: SQL, rosterRecordID: number): Promise<Result<Array<RosterPunch>>> {
    type R = Array<RosterPunch>;

    const result: R = await sql`
        SELECT  roster_record_id::int AS "rosterRecordID",
                to_char(date_time AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "dateTime",
                clock_event      AS "clockEvent"

        FROM    roster_punches

        WHERE   roster_record_id = ${ rosterRecordID }

        ORDER BY
                date_time   ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getRosterPunchesByDate(sql: SQL, date: string): Promise<Result<Array<RosterPunch>>> {
    type R = Array<RosterPunch>;

    const result: R = await sql`
        SELECT  p.roster_record_id::int AS "rosterRecordID",
                to_char(p.date_time AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "dateTime",
                p.clock_event      AS "clockEvent"

        FROM    roster_punches  AS p

        JOIN    roster_records  AS r
        ON      p.roster_record_id = r.id

        WHERE   r.date = ${ date }

        ORDER BY
                p.date_time ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function createRosterRecord(
    sql: SQL,
    record: Omit<RosterRecord, "id">
): Promise<Result<number>> {
    type R = Array<{ id: number }>;

    const result: R = await sql`
        INSERT INTO
                roster_records
        (
                date,
                staff_id,
                shift_id
        )
        VALUES
        (
                ${ record.date },
                ${ record.staffID },
                ${ record.shiftID }
        )
        ON CONFLICT
        (
                date,
                staff_id
        )
        DO UPDATE
        SET     shift_id = EXCLUDED.shift_id

        RETURNING
                id::int AS "id"
    `;

    if (result.length === 0) {
        return new Result<number>(false, null);
    }

    return new Result<number>(true, result[0].id);
}

export async function updateRosterRecordByDateAndStaffID(
    sql: SQL,
    date: string,
    staffID: string,
    shiftID: number
): Promise<Result<RosterRecord>> {
    type R = Array<RosterRecord>;

    const result: R = await sql`
        UPDATE  roster_records

        SET     shift_id = ${ shiftID }

        WHERE   date     = ${ date }
        AND     staff_id = ${ staffID }

        RETURNING
                id::int AS "id",
                date::text AS "date",
                staff_id AS "staffID",
                shift_id AS "shiftID"
    `;

    if (result.length === 0) {
        return new Result<RosterRecord>(false, null);
    }

    return new Result<RosterRecord>(true, result[0]);
}

export async function createRosterPunch(
    sql: SQL,
    rosterRecordID: number,
    dateTime: string,
    clockEvent: ClockEvent
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        INSERT INTO
                roster_punches
        (
                roster_record_id,
                date_time,
                clock_event
        )
        VALUES
        (
                ${ rosterRecordID },
                ${ dateTime },
                ${ clockEvent }
        )
        ON CONFLICT
        (
                roster_record_id,
                date_time
        )
        DO UPDATE
        SET     clock_event = EXCLUDED.clock_event

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteAllRosterRecords(sql: SQL): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                roster_records

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteRosterRecordsByDate(sql: SQL, date: string): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                roster_records

        WHERE   date = ${ date }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteRosterRecordsByStaffID(sql: SQL, staffID: string): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                roster_records

        WHERE   staff_id = ${ staffID }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteRosterRecordByDateAndStaffID(
    sql: SQL,
    date: string,
    staffID: string
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                roster_records

        WHERE   date     = ${ date }
        AND     staff_id = ${ staffID }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function getDailyRosterByDate(
    sql: SQL,
    date: string
): Promise<Result<Array<DailyRosterEntry>>> {
    type R = Array<DailyRosterEntry>;

    const result: R = await sql`
        SELECT  r.id::int AS "id",
                r.date::text                                    AS "date",
                r.staff_id                                      AS "staff_id",
                s.name || '/' || COALESCE(u.name, 'unassigned')  AS "shift"

        FROM    roster_records  AS r

        JOIN    shifts          AS s
        ON      r.shift_id = s.id

        LEFT JOIN LATERAL
        (
                SELECT  p.unit_id

                FROM    staff_positions AS sp
                JOIN    positions       AS p
                ON      sp.position_id = p.id

                WHERE   sp.staff_id = r.staff_id

                ORDER BY
                        sp.preference   DESC,
                        sp.proficiency  DESC,
                        p.id            ASC

                LIMIT   1
        ) AS primary_position ON TRUE

        LEFT JOIN units AS u
        ON      primary_position.unit_id = u.id

        WHERE   r.date = ${ date }

        ORDER BY
                r.staff_id  ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getRosterPunchesByDateAndStaffID(
    sql: SQL,
    date: string,
    staffID: string
): Promise<Result<Array<RosterPunch>>> {
    type R = Array<RosterPunch>;

    const result: R = await sql`
        SELECT  p.roster_record_id::int  AS "rosterRecordID",
                to_char(p.date_time AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "dateTime",
                p.clock_event       AS "clockEvent"

        FROM    roster_punches  AS p

        JOIN    roster_records  AS r
        ON      p.roster_record_id = r.id

        WHERE   r.date     = ${ date }
        AND     r.staff_id = ${ staffID }

        ORDER BY
                p.date_time ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function deleteRosterPunchesByDate(sql: SQL, date: string): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                roster_punches  AS p

        USING   roster_records  AS r

        WHERE   p.roster_record_id = r.id
        AND     r.date = ${ date }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}
