import type { SQL } from "bun";

import { Result } from "@lib:templates/result";

import type { PositionConflict } from "@model:position_conflicts";
import      { validatePositionConflict } from "@model:position_conflicts";

type Conflicts = Array<PositionConflict>;

export async function getAllPositionConflicts(sql: SQL): Promise<Result<Conflicts>> {
    const result: Conflicts = await sql`
        SELECT  position_a_id        AS "positionAID",
                position_b_id        AS "positionBID",
                conflict_duration_hr AS "conflictDurationHr",
                severity

        FROM    position_conflicts

        ORDER BY
                position_a_id   ASC,
                position_b_id   ASC
    `;

    if (result.length === 0) {
        return new Result<Conflicts>(false, null);
    }

    if (!result.every(validatePositionConflict)) {
        return new Result<Conflicts>(false, null);
    }

    return new Result<Conflicts>(true, result);
}

export async function getPositionConflictByIDs(
    sql        : SQL,
    positionAID: number,
    positionBID: number
): Promise<Result<PositionConflict>> {
    const result: Conflicts = await sql`
        SELECT  position_a_id        AS "positionAID",
                position_b_id        AS "positionBID",
                conflict_duration_hr AS "conflictDurationHr",
                severity

        FROM    position_conflicts

        WHERE   position_a_id = ${ positionAID }
        AND     position_b_id = ${ positionBID }
    `;

    if (result.length === 0) {
        return new Result<PositionConflict>(false, null);
    }

    const first: unknown = result[0];

    if (!validatePositionConflict(first)) {
        return new Result<PositionConflict>(false, null);
    }

    return new Result<PositionConflict>(true, first);
}

export async function getConflictsFromPosition(sql: SQL, positionAID: number): Promise<Result<Conflicts>> {
    const result: Conflicts = await sql`
        SELECT  position_a_id        AS "positionAID",
                position_b_id        AS "positionBID",
                conflict_duration_hr AS "conflictDurationHr",
                severity

        FROM    position_conflicts

        WHERE   position_a_id = ${ positionAID }

        ORDER BY severity DESC
    `;

    if (result.length === 0) {
        return new Result<Conflicts>(false, null);
    }

    if (!result.every(validatePositionConflict)) {
        return new Result<Conflicts>(false, null);
    }

    return new Result<Conflicts>(true, result);
}

export async function getConflictsToPosition(sql: SQL, positionBID: number): Promise<Result<Conflicts>> {
    const result: Conflicts = await sql`
        SELECT  position_a_id        AS "positionAID",
                position_b_id        AS "positionBID",
                conflict_duration_hr AS "conflictDurationHr",
                severity

        FROM    position_conflicts

        WHERE   position_b_id = ${ positionBID }

        ORDER BY severity DESC
    `;

    if (result.length === 0) {
        return new Result<Conflicts>(false, null);
    }

    if (!result.every(validatePositionConflict)) {
        return new Result<Conflicts>(false, null);
    }

    return new Result<Conflicts>(true, result);
}

export async function createPositionConflict(sql: SQL, conflict: PositionConflict): Promise<Result<null>> {
    type R = Array<{ position_a_id: number }>;

    const result: R = await sql`
        INSERT INTO position_conflicts
        (
                position_a_id,
                position_b_id,
                conflict_duration_hr,
                severity
        )
        VALUES
        (
                ${ conflict.positionAID },
                ${ conflict.positionBID },
                ${ conflict.conflictDurationHr },
                ${ conflict.severity }
        )
        ON CONFLICT
        (
                position_a_id,
                position_b_id
        )
        DO UPDATE
        SET     conflict_duration_hr = EXCLUDED.conflict_duration_hr,
                severity             = EXCLUDED.severity

        RETURNING position_a_id
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function updatePositionConflict(sql: SQL, conflict: PositionConflict): Promise<Result<PositionConflict>> {
    const result: Conflicts = await sql`
        UPDATE  position_conflicts

        SET     conflict_duration_hr = ${ conflict.conflictDurationHr },
                severity             = ${ conflict.severity }

        WHERE   position_a_id = ${ conflict.positionAID }
        AND     position_b_id = ${ conflict.positionBID }

        RETURNING
                position_a_id        AS "positionAID",
                position_b_id        AS "positionBID",
                conflict_duration_hr AS "conflictDurationHr",
                severity
    `;

    if (result.length === 0) {
        return new Result<PositionConflict>(false, null);
    }

    const first: unknown = result[0];

    if (!validatePositionConflict(first)) {
        return new Result<PositionConflict>(false, null);
    }

    return new Result<PositionConflict>(true, first);
}

export async function deleteAllPositionConflicts(sql: SQL): Promise<Result<null>> {
    type R = Array<{ position_a_id: number }>;

    const result: R = await sql`
        DELETE FROM position_conflicts

        RETURNING position_a_id
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deletePositionConflictByIDs(
    sql        : SQL,
    positionAID: number,
    positionBID: number
): Promise<Result<null>> {
    type R = Array<{ position_a_id: number }>;

    const result: R = await sql`
        DELETE FROM position_conflicts

        WHERE   position_a_id = ${ positionAID }
        AND     position_b_id = ${ positionBID }

        RETURNING position_a_id
    `;

    return new Result<null>(result.length !== 0, null);
}
