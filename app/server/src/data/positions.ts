import { SQL } from "bun";

import { Result } from "@lib:templates/result";

import type { Position, PositionPreview } from "@model:positions";

export async function getAllPositionPreviews(sql: SQL): Promise<Result<Array<PositionPreview>>> {
    type R = Array<PositionPreview>;

    const result: R = await sql`
        SELECT  p.id,
                p.unit_id   AS "unitID",
                u.name      AS "unitName",
                p.name,
                p.description

        FROM    positions   AS "p"
        JOIN    units       AS "u"
        ON      p.unit_id = u.id
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getPositionByID(
    sql       : SQL,
    positionID: number
): Promise<Result<Position>> {
    type R = Array<Position>;

    const result: R = await sql`
        SELECT  p.id,
                p.unit_id   AS "unitID",
                u.name      AS "unitName",
                p.name,
                p.description,
                p.physical_load AS "physicalLoad",
                p.mental_load   AS "mentalLoad",
                p.risk_level    AS "riskLevel",
                p.minimum_staff AS "minimumStaff",
                p.target_staff  AS "targetStaff",
                p.maximum_staff AS "maximumStaff",
                p.minimum_sum_proficiency   AS "minimumSumProficiency",
                p.target_sum_proficiency    AS "targetSumProficiency",
                p.maximum_sum_proficiency   AS "maximumSumProficiency",
                p.is_prioritising_staff_amount  AS "isPrioritisingStaffAmount"

        FROM    positions   AS "p"
        JOIN    units       AS "u"
        ON      p.unit_id = u.id

        WHERE   p.id = ${ positionID }
    `;

    if (result.length === 0) {
        return new Result<Position>(false, null);
    }

    return new Result<Position>(true, result[0]);
}

export async function createPosition(
    sql        : SQL,
    newPosition: Omit<Position, "id">
): Promise<Result<number>> {
    type R = Array<{ id: number }>;

     const result: R = await sql`
        INSERT INTO
                positions
        (
                unit_id,
                name,
                description,
                physical_load,
                mental_load,
                risk_level,
                minimum_staff,
                target_staff,
                maximum_staff,
                minimum_sum_proficiency,
                target_sum_proficiency,
                maximum_sum_proficiency,
                is_prioritising_staff_amount
        )
        VALUES
        (
                ${ newPosition.unitID },
                ${ newPosition.name },
                ${ newPosition.description },
                ${ newPosition.physicalLoad },
                ${ newPosition.mentalLoad },
                ${ newPosition.riskLevel },
                ${ newPosition.minimumStaff },
                ${ newPosition.targetStaff },
                ${ newPosition.maximumStaff },
                ${ newPosition.minimumSumProficiency },
                ${ newPosition.targetSumProficiency },
                ${ newPosition.maximumSumProficiency },
                ${ newPosition.isPrioritisingStaffAmount }
        )

        RETURNING
                id
    `;

    if (result.length === 0) {
        return new Result<number>(false, null);
    }

    return new Result<number>(true, result[0].id);
}

export async function getAllPositionPreviewsInUnitByID(
    sql   : SQL,
    unitID: number
): Promise<Result<Array<PositionPreview>>> {
    type R = Array<PositionPreview>;

    const result: R = await sql`
        SELECT  p.id,
                p.unit_id   AS "unitID",
                u.name      AS "unitName",
                p.name,
                p.description

        FROM    positions   AS "p"
        JOIN    units       AS "u"
        ON      p.unit_id = u.id

        WHERE   p.unit_id = ${ unitID }
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function searchPositionPreviewsBySimilarNames(
    sql: SQL,
    name: string
): Promise<Result<Array<PositionPreview>>> {
    type R = Array<PositionPreview>;

    const result: R = await sql`
        SELECT  p.id,
                p.unit_id   AS "unitID",
                u.name      AS "unitName",
                p.name,
                p.description

        FROM    positions   AS "p"
        JOIN    units       AS "u"
        ON      p.unit_id = u.id

        WHERE   p.name ILIKE ${ name }

        ORDER BY
                p.name  ASC,
                u.name  ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function updatePositionByID(
    sql        : SQL,
    positionID : number,
    newPosition: Omit<Position, "id">
): Promise<Result<Position>> {
    type R = Array<Position>;

    const result: R = await sql`
        WITH        p
        AS  (
            UPDATE  positions

            SET     unit_id       = ${ newPosition.unitID },
                    name          = ${ newPosition.name },
                    description   = ${ newPosition.description },
                    physical_load = ${ newPosition.physicalLoad },
                    mental_load   = ${ newPosition.mentalLoad },
                    risk_level    = ${ newPosition.riskLevel },
                    minimum_staff = ${ newPosition.minimumStaff },
                    target_staff  = ${ newPosition.targetStaff },
                    maximum_staff = ${ newPosition.maximumStaff },
                    minimum_sum_proficiency = ${ newPosition.minimumSumProficiency },
                    target_sum_proficiency  = ${ newPosition.targetSumProficiency },
                    maximum_sum_proficiency = ${ newPosition.maximumSumProficiency },
                    is_prioritising_staff_amount = ${ newPosition.isPrioritisingStaffAmount }

            WHERE   id = ${ positionID }

            RETURNING
                    id,
                    unit_id,
                    name,
                    description,
                    physical_load,
                    mental_load,
                    risk_level,
                    minimum_staff,
                    target_staff,
                    maximum_staff,
                    minimum_sum_proficiency,
                    target_sum_proficiency,
                    maximum_sum_proficiency,
                    is_prioritising_staff_amount
        )

        SELECT  p.id,
                p.unit_id   AS "unitID",
                u.name      AS "unitName",
                p.name,
                p.description,
                p.physical_load AS "physicalLoad",
                p.mental_load   AS "mentalLoad",
                p.risk_level    AS "riskLevel",
                p.minimum_staff AS "minimumStaff",
                p.target_staff  AS "targetStaff",
                p.maximum_staff AS "maximumStaff",
                p.minimum_sum_proficiency   AS "minimumSumProficiency",
                p.target_sum_proficiency    AS "targetSumProficiency",
                p.maximum_sum_proficiency   AS "maximumSumProficiency",
                p.is_prioritising_staff_amount  AS "isPrioritisingStaffAmount"

        FROM    p
        INNER JOIN
                units AS "u"
        ON      p.unit_id = u.id
    `;

    if (result.length === 0) {
        return new Result<Position>(false, null);
    }

    return new Result<Position>(true, result[0]);
}

export async function deleteAllPositions(
    sql: SQL
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                positions

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deletePositionByID(
    sql: SQL,
    positionID: number
): Promise<Result<string>> {
    type R = Array<{ name: string }>;

    const result: R = await sql`
        DELETE FROM
                positions

        WHERE   id = ${ positionID }

        RETURNING
                name
    `;

    if (result.length === 0) {
        return new Result<string>(false, null);
    }

    return new Result<string>(true, result[0].name);
}