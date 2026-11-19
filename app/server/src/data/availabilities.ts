import { SQL } from "bun";

import { Result } from "@lib:templates/result";

import type { StaffAvailability } from "@model:staff";

export async function getAllAvailabilities(sql: SQL): Promise<Result<Array<StaffAvailability>>> {
    type R = Array<StaffAvailability>;

    const result: R = await sql`
        SELECT  date,
                staff_id            AS "staffID",
                from_time           AS "fromTime",
                to_time             AS "toTime",
                to_date             AS "toDate",
                is_flexible         AS "isFlexible",
                ok_overtime         AS "okOvertime",
                ok_multiple_break   AS "okMultipleBreak",
                ok_long_break       AS "okLongBreak",
                preferred_hour      AS "preferredHour",
                preferred_break_hour AS "preferredBreakHour",
                preferred_shift     AS "preferredShift"

        FROM    staff_availability

        ORDER BY
                date        ASC,
                staff_id    ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getAvailabilitiesByStaffID(sql: SQL, staffID: string): Promise<Result<Array<StaffAvailability>>> {
    type R = Array<StaffAvailability>;

    const result: R = await sql`
        SELECT  date,
                staff_id            AS "staffID",
                from_time           AS "fromTime",
                to_time             AS "toTime",
                to_date             AS "toDate",
                is_flexible         AS "isFlexible",
                ok_overtime         AS "okOvertime",
                ok_multiple_break   AS "okMultipleBreak",
                ok_long_break       AS "okLongBreak",
                preferred_hour      AS "preferredHour",
                preferred_break_hour AS "preferredBreakHour",
                preferred_shift     AS "preferredShift"

        FROM    staff_availability

        WHERE   staff_id = ${ staffID }

        ORDER BY
                date    ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getAvailabilitiesByDate(sql: SQL, date: string): Promise<Result<Array<StaffAvailability>>> {
    type R = Array<StaffAvailability>;

    const result: R = await sql`
        SELECT  date,
                staff_id            AS "staffID",
                from_time           AS "fromTime",
                to_time             AS "toTime",
                to_date             AS "toDate",
                is_flexible         AS "isFlexible",
                ok_overtime         AS "okOvertime",
                ok_multiple_break   AS "okMultipleBreak",
                ok_long_break       AS "okLongBreak",
                preferred_hour      AS "preferredHour",
                preferred_break_hour AS "preferredBreakHour",
                preferred_shift     AS "preferredShift"

        FROM    staff_availability

        WHERE   date = ${ date }

        ORDER BY
                staff_id    ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getAvailabilityByDateAndStaffID(sql: SQL, staffID: string, date: string): Promise<Result<StaffAvailability>> {
    type R = Array<StaffAvailability>;

    const result: R = await sql`
        SELECT  date,
                staff_id            AS "staffID",
                from_time           AS "fromTime",
                to_time             AS "toTime",
                to_date             AS "toDate",
                is_flexible         AS "isFlexible",
                ok_overtime         AS "okOvertime",
                ok_multiple_break   AS "okMultipleBreak",
                ok_long_break       AS "okLongBreak",
                preferred_hour      AS "preferredHour",
                preferred_break_hour AS "preferredBreakHour",
                preferred_shift     AS "preferredShift"

        FROM    staff_availability

        WHERE   staff_id = ${ staffID }
        AND     date     = ${ date }
    `;

    if (result.length === 0) {
        return new Result<StaffAvailability>(false, null);
    }

    return new Result<StaffAvailability>(true, result[0]);
}

export async function createAvailabilityByDateAndStaffID(
    sql: SQL,
    staffID: string,
    date: string,
    availability: Omit<StaffAvailability, "staffID" | "date">
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        INSERT INTO
                staff_availability
        (
                date,
                staff_id,
                from_time,
                to_time,
                to_date,
                is_flexible,
                ok_overtime,
                ok_multiple_break,
                ok_long_break,
                preferred_hour,
                preferred_break_hour,
                preferred_shift
        )
        VALUES
        (
                ${ date },
                ${ staffID },
                ${ availability.fromTime },
                ${ availability.toTime },
                ${ availability.toDate },
                ${ availability.isFlexible },
                ${ availability.okOvertime },
                ${ availability.okMultipleBreak },
                ${ availability.okLongBreak },
                ${ availability.preferredHour },
                ${ availability.preferredBreakHour },
                ${ availability.preferredShift }
        )
        ON CONFLICT
        (
                date,
                staff_id
        )
        DO UPDATE
        SET     from_time            = EXCLUDED.from_time,
                to_time              = EXCLUDED.to_time,
                to_date              = EXCLUDED.to_date,
                is_flexible          = EXCLUDED.is_flexible,
                ok_overtime          = EXCLUDED.ok_overtime,
                ok_multiple_break    = EXCLUDED.ok_multiple_break,
                ok_long_break        = EXCLUDED.ok_long_break,
                preferred_hour       = EXCLUDED.preferred_hour,
                preferred_break_hour = EXCLUDED.preferred_break_hour,
                preferred_shift      = EXCLUDED.preferred_shift

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function updateAvailabilityByDateAndStaffID(
    sql: SQL,
    staffID: string,
    date: string,
    availability: Omit<StaffAvailability, "staffID" | "date">
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        UPDATE  staff_availability

        SET     from_time            = ${ availability.fromTime },
                to_time              = ${ availability.toTime },
                to_date              = ${ availability.toDate },
                is_flexible          = ${ availability.isFlexible },
                ok_overtime          = ${ availability.okOvertime },
                ok_multiple_break    = ${ availability.okMultipleBreak },
                ok_long_break        = ${ availability.okLongBreak },
                preferred_hour       = ${ availability.preferredHour },
                preferred_break_hour = ${ availability.preferredBreakHour },
                preferred_shift      = ${ availability.preferredShift }

        WHERE   staff_id = ${ staffID }
        AND     date     = ${ date }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteAvailabilityByDateAndStaffID(sql: SQL, staffID: string, date: string): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                staff_availability

        WHERE   staff_id = ${ staffID }
        AND     date     = ${ date }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteAvailabilitiesByStaffID(sql: SQL, staffID: string): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                staff_availability

        WHERE   staff_id = ${ staffID }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteAvailabilitiesByDate(sql: SQL, date: string): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                staff_availability

        WHERE   date = ${ date }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteAllAvailabilities(sql: SQL): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                staff_availability

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}
