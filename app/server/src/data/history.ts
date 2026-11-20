import type { SQL } from "bun";

import { Result } from "@lib:templates/result";

import {
    type HistoricalLoadRow,
    type HistoricalPositionRow,
    validateHistoricalLoadRow,
    validateHistoricalPositionRow
} from "@model:relations";

export async function getHistoricalLoadRows(
    sql: SQL,
    startDate: string,
    endDate: string
): Promise<Result<Array<HistoricalLoadRow>>> {
    type R = Array<HistoricalLoadRow>;

    const result: R = await sql`
        SELECT  r.staff_id             AS "staffID",
                r.date::text           AS "date",
                p.physical_load        AS "physicalLoad",
                p.mental_load          AS "mentalLoad",
                p.risk_level           AS "riskLevel",
                (
                    (CASE WHEN s.is_overnight THEN 24 ELSE 0 END)
                    + EXTRACT(HOUR FROM s.to_time)
                    + EXTRACT(MINUTE FROM s.to_time) / 60.0
                    - EXTRACT(HOUR FROM s.from_time)
                    - EXTRACT(MINUTE FROM s.from_time) / 60.0
                )::double precision AS "hours"

        FROM    roster_records      AS r

        JOIN    shifts              AS s
        ON      r.shift_id = s.id

        JOIN    schedule_positions  AS sp
        ON      sp.roster_record_id = r.id
        AND     sp.position_id IS NOT NULL

        JOIN    positions           AS p
        ON      sp.position_id = p.id

        WHERE   r.date >= ${ startDate }
        AND     r.date <  ${ endDate }

        ORDER BY
                r.date      ASC,
                r.staff_id  ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    if (!result.every(validateHistoricalLoadRow)) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getHistoricalPositionRows(
    sql: SQL,
    startDate: string,
    endDate: string
): Promise<Result<Array<HistoricalPositionRow>>> {
    type R = Array<HistoricalPositionRow>;

    const result: R = await sql`
        SELECT  r.staff_id          AS "staffID",
                to_char(sp.date_time AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "dateTime",
                sp.position_id      AS "positionID"

        FROM    schedule_positions  AS sp

        JOIN    roster_records      AS r
        ON      sp.roster_record_id = r.id

        WHERE   sp.position_id IS NOT NULL
        AND     r.date >= ${ startDate }
        AND     r.date <  ${ endDate }

        ORDER BY
                sp.date_time    ASC,
                r.staff_id      ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    if (!result.every(validateHistoricalPositionRow)) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}
