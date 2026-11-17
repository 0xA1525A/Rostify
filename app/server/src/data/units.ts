import { SQL } from "bun";

import { Result } from "@lib:templates/result";

import type { Unit } from "@model:units";

export async function getAllUnits(sql: SQL): Promise<Result<Array<Unit>>> {
    type R = Array<Unit>;

    const result: R = await sql`
        SELECT  id,
                name,
                description,
                working_area AS "workingArea"

        FROM    units
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getUnitByID(sql: SQL, unitID: number): Promise<Result<Unit>> {
    type R = Array<Unit>;

    const result: R = await sql`
        SELECT  id,
                name,
                description,
                working_area AS "workingArea"

        FROM    units

        WHERE   id = ${ unitID }
    `;

    if (result.length === 0) {
        return new Result<Unit>(false, null);
    }

    return new Result<Unit>(true, result[0]);
}

export async function searchUnitsBySimilarName(
    sql: SQL,
    unitName: string
): Promise<Result<Array<Unit>>> {
    type R = Array<Unit>;

    const result: R = await sql`
        SELECT  id,
                name,
                description,
                working_area AS "workingArea"

        FROM    units

        WHERE   name ILIKE ${ unitName }

        ORDER BY
                working_area    ASC,
                name            ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function createUnit(
    sql: SQL,
    newUnit: Omit<Unit, "id">
): Promise<Result<number>> {
    type R = Array<{ id: number }>;

    const result: R = await sql`
        INSERT INTO
                units
        (
                name,
                description,
                working_area
        )
        VALUES
        (
                ${ newUnit.name },
                ${ newUnit.description },
                ${ newUnit.workingArea }
        )
        RETURNING
                id
    `;

    if (result.length === 0) {
        return new Result<number>(false, null);
    }

    return new Result<number>(true, result[0].id);
}

export async function updateUnitByID(
    sql: SQL,
    unitID: number,
    newUnit: Omit<Unit, "id">
): Promise<Result<Unit>> {
    type R = Array<Unit>;

    const result: R = await sql`
        UPDATE  units

        SET     name         = ${ newUnit.name },
                description  = ${ newUnit.description },
                working_area = ${ newUnit.workingArea }

        WHERE   id = ${ unitID }

        RETURNING
                id,
                name,
                description,
                working_area AS "workingArea"
    `;

    if (result.length === 0) {
        return new Result<Unit>(false, null);
    }

    return new Result<Unit>(true, result[0]);
}

export async function deleteAllUnits(sql: SQL): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                units

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteUnitByID(sql: SQL, unitID: number): Promise<Result<string>> {
    type R = Array<{ name: string }>;

    const result: R = await sql`
        DELETE FROM
                units

        WHERE   id = ${ unitID }

        RETURNING
                name
    `;

    if (result.length === 0) {
        return new Result<string>(false, null);
    }

    return new Result<string>(true, result[0].name);
}