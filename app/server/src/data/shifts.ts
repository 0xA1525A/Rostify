import { SQL } from "bun";

import { Result } from "@lib:templates/result";

import type { Shift } from "@model:shifts";

export async function getAllShifts(sql: SQL): Promise<Result<Array<Shift>>> {
    type R = Array<Shift>;

    const result: R = await sql`
        SELECT  id,
                day,
                is_holiday  AS "isHoliday",
                name,
                description,
                from_time   AS "fromTime",
                to_time     AS "toTime",
                is_overnight    AS "isOvernight"

        FROM    shifts
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getShiftByID(sql: SQL, shiftID: number): Promise<Result<Shift>> {
    type R = Array<Shift>;

    const result: R = await sql`
        SELECT  id,
                day,
                is_holiday  AS "isHoliday",
                name,
                description,
                from_time   AS "fromTime",
                to_time     AS "toTime",
                is_overnight    AS "isOvernight"

        FROM    shifts

        WHERE   id = ${ shiftID }
    `;

    if (result.length === 0) {
        return new Result<Shift>(false, null);
    }

    return new Result<Shift>(true, result[0]);
}

export async function searchShiftsBySimilarName(
    sql: SQL,
    shiftName: string
): Promise<Result<Array<Shift>>> {
    type R = Array<Shift>;

    const result: R = await sql`
        SELECT  id,
                day,
                is_holiday  AS "isHoliday",
                name,
                description,
                from_time   AS "fromTime",
                to_time     AS "toTime",
                is_overnight    AS "isOvernight"

        FROM    shifts

        WHERE   name ILIKE ${ shiftName }
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function createShift(sql: SQL, newShift: Omit<Shift, "id">): Promise<Result<number>> {
    type R = Array<{ id: number }>;

    const result: R = await sql`
        INSERT INTO
                shifts
        (
                day,
                is_holiday,
                name,
                description,
                from_time,
                to_time,
                is_overnight
        )
        VALUES
        (
                ${ newShift.day },
                ${ newShift.isHoliday },
                ${ newShift.name },
                ${ newShift.description },
                ${ newShift.fromTime },
                ${ newShift.toTime },
                ${ newShift.isOvernight }
        )
        RETURNING
                id
    `;

    if (result.length === 0) {
        return new Result<number>(false, null);
    }

    return new Result<number>(true, result[0].id);
}

export async function updateShiftByID(sql: SQL, shiftID: number, newShift: Omit<Shift, "id">): Promise<Result<Shift>> {
    type R = Array<Shift>;

    const result: R = await sql`
        UPDATE  shifts

        SET     day          = ${ newShift.day },
                is_holiday   = ${ newShift.isHoliday },
                name         = ${ newShift.name },
                description  = ${ newShift.description },
                from_time    = ${ newShift.fromTime },
                to_time      = ${ newShift.toTime },
                is_overnight = ${ newShift.isOvernight }

        WHERE   id = ${ shiftID }

        RETURNING
                id,
                day,
                is_holiday  AS "isHoliday",
                name,
                description,
                from_time   AS "fromTime",
                to_time     AS "toTime",
                is_overnight    AS "isOvernight"
    `;

    if (result.length === 0) {
        return new Result<Shift>(false, null);
    }

    return new Result<Shift>(true, result[0]);
}

export async function deleteAllShifts(sql: SQL): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                shifts

        RETURNING
                1 AS "_"
    `;

    if (result.length === 0) {
        return new Result<null>(false, null);
    }

    return new Result<null>(true, null);
}

export async function deleteShiftByID(sql: SQL, shiftID: number): Promise<Result<string>> {
    type R = Array<{ name: string }>;

    const result: R = await sql`
        DELETE FROM
                shifts

        WHERE   id = ${ shiftID }

        RETURNING
                name
    `;

    if (result.length === 0) {
        return new Result<string>(false, null);
    }

    return new Result<string>(true, result[0].name);
}