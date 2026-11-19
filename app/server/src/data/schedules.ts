import { SQL } from "bun";

import { Result } from "@lib:templates/result";

import type { SchedulePosition, ScheduleTask } from "@model:schedules";

export async function getAllSchedulePositions(sql: SQL): Promise<Result<Array<SchedulePosition>>> {
    type R = Array<SchedulePosition>;

    const result: R = await sql`
        SELECT  roster_record_id::int AS "rosterRecordID",
                to_char(date_time AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "dateTime",
                position_id      AS "positionID"

        FROM    schedule_positions

        ORDER BY
                roster_record_id    ASC,
                date_time           ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getSchedulePositionsByRosterRecordID(
    sql: SQL,
    rosterRecordID: number
): Promise<Result<Array<SchedulePosition>>> {
    type R = Array<SchedulePosition>;

    const result: R = await sql`
        SELECT  roster_record_id::int AS "rosterRecordID",
                to_char(date_time AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "dateTime",
                position_id      AS "positionID"

        FROM    schedule_positions

        WHERE   roster_record_id = ${ rosterRecordID }

        ORDER BY
                date_time   ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getSchedulePositionsByDate(sql: SQL, date: string): Promise<Result<Array<SchedulePosition>>> {
    type R = Array<SchedulePosition>;

    const result: R = await sql`
        SELECT  s.roster_record_id AS "rosterRecordID",
                to_char(s.date_time AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "dateTime",
                s.position_id      AS "positionID"

        FROM    schedule_positions  AS s

        JOIN    roster_records      AS r
        ON      s.roster_record_id = r.id

        WHERE   r.date = ${ date }

        ORDER BY
                r.staff_id  ASC,
                s.date_time ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getSchedulePositionsByDateAndStaffID(
    sql: SQL,
    date: string,
    staffID: string
): Promise<Result<Array<SchedulePosition>>> {
    type R = Array<SchedulePosition>;

    const result: R = await sql`
        SELECT  s.roster_record_id AS "rosterRecordID",
                to_char(s.date_time AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "dateTime",
                s.position_id      AS "positionID"

        FROM    schedule_positions  AS s

        JOIN    roster_records      AS r
        ON      s.roster_record_id = r.id

        WHERE   r.date     = ${ date }
        AND     r.staff_id = ${ staffID }

        ORDER BY
                s.date_time ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getAllScheduleTasks(sql: SQL): Promise<Result<Array<ScheduleTask>>> {
    type R = Array<ScheduleTask>;

    const result: R = await sql`
        SELECT  roster_record_id::int AS "rosterRecordID",
                to_char(date_time AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "dateTime",
                task_id          AS "taskID"

        FROM    schedule_tasks

        ORDER BY
                roster_record_id    ASC,
                date_time           ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getScheduleTasksByRosterRecordID(
    sql: SQL,
    rosterRecordID: number
): Promise<Result<Array<ScheduleTask>>> {
    type R = Array<ScheduleTask>;

    const result: R = await sql`
        SELECT  roster_record_id::int AS "rosterRecordID",
                to_char(date_time AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "dateTime",
                task_id          AS "taskID"

        FROM    schedule_tasks

        WHERE   roster_record_id = ${ rosterRecordID }

        ORDER BY
                date_time   ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getScheduleTasksByDate(sql: SQL, date: string): Promise<Result<Array<ScheduleTask>>> {
    type R = Array<ScheduleTask>;

    const result: R = await sql`
        SELECT  s.roster_record_id AS "rosterRecordID",
                to_char(s.date_time AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "dateTime",
                s.task_id          AS "taskID"

        FROM    schedule_tasks      AS s

        JOIN    roster_records      AS r
        ON      s.roster_record_id = r.id

        WHERE   r.date = ${ date }

        ORDER BY
                r.staff_id  ASC,
                s.date_time ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getScheduleTasksByDateAndStaffID(
    sql: SQL,
    date: string,
    staffID: string
): Promise<Result<Array<ScheduleTask>>> {
    type R = Array<ScheduleTask>;

    const result: R = await sql`
        SELECT  s.roster_record_id AS "rosterRecordID",
                to_char(s.date_time AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "dateTime",
                s.task_id          AS "taskID"

        FROM    schedule_tasks      AS s

        JOIN    roster_records      AS r
        ON      s.roster_record_id = r.id

        WHERE   r.date     = ${ date }
        AND     r.staff_id = ${ staffID }

        ORDER BY
                s.date_time ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function createSchedulePosition(
    sql: SQL,
    position: SchedulePosition
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        INSERT INTO
                schedule_positions
        (
                roster_record_id,
                date_time,
                position_id
        )
        VALUES
        (
                ${ position.rosterRecordID },
                ${ position.dateTime },
                ${ position.positionID }
        )
        ON CONFLICT
        (
                roster_record_id,
                date_time
        )
        DO UPDATE
        SET     position_id = EXCLUDED.position_id

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function createScheduleTask(
    sql: SQL,
    task: ScheduleTask
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        INSERT INTO
                schedule_tasks
        (
                roster_record_id,
                date_time,
                task_id
        )
        VALUES
        (
                ${ task.rosterRecordID },
                ${ task.dateTime },
                ${ task.taskID }
        )
        ON CONFLICT
        (
                roster_record_id,
                date_time
        )
        DO UPDATE
        SET     task_id = EXCLUDED.task_id

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteAllSchedulePositions(sql: SQL): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                schedule_positions

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteAllScheduleTasks(sql: SQL): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                schedule_tasks

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteSchedulePositionsByDate(sql: SQL, date: string): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                schedule_positions  AS s

        USING   roster_records      AS r

        WHERE   s.roster_record_id = r.id
        AND     r.date             = ${ date }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteScheduleTasksByDate(sql: SQL, date: string): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                schedule_tasks      AS s

        USING   roster_records      AS r

        WHERE   s.roster_record_id = r.id
        AND     r.date             = ${ date }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteSchedulePositionsByStaffID(sql: SQL, staffID: string): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                schedule_positions  AS s

        USING   roster_records      AS r

        WHERE   s.roster_record_id = r.id
        AND     r.staff_id         = ${ staffID }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteScheduleTasksByStaffID(sql: SQL, staffID: string): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                schedule_tasks      AS s

        USING   roster_records      AS r

        WHERE   s.roster_record_id = r.id
        AND     r.staff_id         = ${ staffID }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteScheduleByDateAndStaffID(
    sql: SQL,
    date: string,
    staffID: string
): Promise<Result<null>> {
    await deleteSchedulePositionsByDateAndStaffID(sql, date, staffID);
    await deleteScheduleTasksByDateAndStaffID(sql, date, staffID);

    return new Result<null>(true, null);
}

export async function deleteSchedulePositionsByDateAndStaffID(
    sql: SQL,
    date: string,
    staffID: string
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                schedule_positions  AS s

        USING   roster_records      AS r

        WHERE   s.roster_record_id = r.id
        AND     r.date             = ${ date }
        AND     r.staff_id         = ${ staffID }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteScheduleTasksByDateAndStaffID(
    sql: SQL,
    date: string,
    staffID: string
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                schedule_tasks      AS s

        USING   roster_records      AS r

        WHERE   s.roster_record_id = r.id
        AND     r.date             = ${ date }
        AND     r.staff_id         = ${ staffID }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteAllSchedules(sql: SQL): Promise<Result<null>> {
    await deleteAllSchedulePositions(sql);
    await deleteAllScheduleTasks(sql);

    return new Result<null>(true, null);
}

export async function deleteSchedulePositionsByRosterRecordID(
    sql: SQL,
    rosterRecordID: number
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                schedule_positions

        WHERE   roster_record_id = ${ rosterRecordID }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteScheduleTasksByRosterRecordID(
    sql: SQL,
    rosterRecordID: number
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                schedule_tasks

        WHERE   roster_record_id = ${ rosterRecordID }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteScheduleByRosterRecordID(
    sql: SQL,
    rosterRecordID: number
): Promise<Result<null>> {
    await deleteSchedulePositionsByRosterRecordID(sql, rosterRecordID);
    await deleteScheduleTasksByRosterRecordID(sql, rosterRecordID);

    return new Result<null>(true, null);
}
