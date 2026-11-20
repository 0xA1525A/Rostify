import type { SQL } from "bun";

import { Result } from "@lib:templates/result";


import {
    type StaffPeerRelation,
    type StaffPositionRelation,
    type StaffShiftRelation,
    validateStaffPeerRelation,
    validateStaffPositionRelation,
    validateStaffShiftRelation
} from "@model:relations";

export type { StaffPeerRelation, StaffPositionRelation, StaffShiftRelation } from "@model:relations";

export async function getAllStaffRelationsToAllStaff(sql: SQL): Promise<Result<Array<StaffPeerRelation>>> {
    type R = Array<StaffPeerRelation>;

    const result: R = await sql`
        SELECT  staff_a_id   AS "staffAID",
                staff_b_id   AS "staffBID",
                preference

        FROM    staff_peer_preferences

        ORDER BY
                staff_a_id  ASC,
                staff_b_id  ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    if (!result.every(validateStaffPeerRelation)) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getStaffRelationsToAllStaffByStaffID(sql: SQL, staffID: string): Promise<Result<Array<StaffPeerRelation>>> {
    type R = Array<StaffPeerRelation>;

    const result: R = await sql`
        SELECT  staff_a_id   AS "staffAID",
                staff_b_id   AS "staffBID",
                preference

        FROM    staff_peer_preferences

        WHERE   staff_a_id = ${ staffID }
        OR      staff_b_id = ${ staffID }

        ORDER BY
                staff_a_id  ASC,
                staff_b_id  ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    if (!result.every(validateStaffPeerRelation)) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getAllStaffRelationsToAllShifts(sql: SQL): Promise<Result<Array<StaffShiftRelation>>> {
    type R = Array<StaffShiftRelation>;

    const result: R = await sql`
        SELECT  staff_id    AS "staffID",
                shift_id    AS "shiftID",
                preference,
                proficiency

        FROM    staff_shifts

        ORDER BY
                staff_id    ASC,
                shift_id    ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    if (!result.every(validateStaffShiftRelation)) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getStaffRelationsToAllShiftsByStaffID(sql: SQL, staffID: string): Promise<Result<Array<StaffShiftRelation>>> {
    type R = Array<StaffShiftRelation>;

    const result: R = await sql`
        SELECT  staff_id    AS "staffID",
                shift_id    AS "shiftID",
                preference,
                proficiency

        FROM    staff_shifts

        WHERE   staff_id = ${ staffID }

        ORDER BY
                shift_id    ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    if (!result.every(validateStaffShiftRelation)) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getAllStaffRelationsToAllPositions(sql: SQL): Promise<Result<Array<StaffPositionRelation>>> {
    type R = Array<StaffPositionRelation>;

    const result: R = await sql`
        SELECT  staff_id    AS "staffID",
                position_id AS "positionID",
                preference,
                proficiency

        FROM    staff_positions

        ORDER BY
                staff_id    ASC,
                position_id ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    if (!result.every(validateStaffPositionRelation)) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getStaffRelationsToAllPositionsByStaffID(sql: SQL, staffID: string): Promise<Result<Array<StaffPositionRelation>>> {
    type R = Array<StaffPositionRelation>;

    const result: R = await sql`
        SELECT  staff_id    AS "staffID",
                position_id AS "positionID",
                preference,
                proficiency

        FROM    staff_positions

        WHERE   staff_id = ${ staffID }

        ORDER BY
                position_id ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    if (!result.every(validateStaffPositionRelation)) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function deleteStaffRelationToAllStaffByStaffID(sql: SQL, staffID: string): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                staff_peer_preferences

        WHERE   staff_a_id = ${ staffID }
        OR      staff_b_id = ${ staffID }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteAllStaffRelationsToStaffByStaffID(sql: SQL, staffID: string): Promise<Result<null>> {
    return await deleteStaffRelationToAllStaffByStaffID(sql, staffID);
}

export async function deleteAllStaffRelationsToAllStaff(sql: SQL): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                staff_peer_preferences

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteStaffRelationToAllShiftsByStaffID(sql: SQL, staffID: string): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                staff_shifts

        WHERE   staff_id = ${ staffID }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteAllStaffRelationsToShiftByShiftID(sql: SQL, shiftID: number): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                staff_shifts

        WHERE   shift_id = ${ shiftID }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteAllStaffRelationsToAllShifts(sql: SQL): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                staff_shifts

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteStaffRelationToAllPositionsByStaffID(sql: SQL, staffID: string): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                staff_positions

        WHERE   staff_id = ${ staffID }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteAllStaffRelationsToPositionByPositionID(sql: SQL, positionID: number): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                staff_positions

        WHERE   position_id = ${ positionID }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteAllStaffRelationsToAllPositions(sql: SQL): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                staff_positions

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteStaffRelationToEverythingByStaffID(sql: SQL, staffID: string): Promise<Result<null>> {
    await deleteStaffRelationToAllShiftsByStaffID(sql, staffID);
    await deleteStaffRelationToAllPositionsByStaffID(sql, staffID);
    await deleteStaffRelationToAllStaffByStaffID(sql, staffID);

    return new Result<null>(true, null);
}

export async function deleteAllStaffRelationsToEverything(sql: SQL): Promise<Result<null>> {
    await deleteAllStaffRelationsToAllShifts(sql);
    await deleteAllStaffRelationsToAllPositions(sql);
    await deleteAllStaffRelationsToAllStaff(sql);

    return new Result<null>(true, null);
}

export async function setStaffRelationToShiftByShiftID(
    sql: SQL,
    staffID: string,
    shiftID: number,
    preference: number,
    proficiency: number
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        INSERT INTO
                staff_shifts
        (
                staff_id,
                shift_id,
                preference,
                proficiency
        )
        VALUES
        (
                ${ staffID },
                ${ shiftID },
                ${ preference },
                ${ proficiency }
        )
        ON CONFLICT
        (
                staff_id,
                shift_id
        )
        DO UPDATE
        SET     preference  = EXCLUDED.preference,
                proficiency = EXCLUDED.proficiency

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function unsetStaffRelationToShiftByShiftID(
    sql: SQL,
    staffID: string,
    shiftID: number
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                staff_shifts

        WHERE   staff_id = ${ staffID }
        AND     shift_id = ${ shiftID }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function setStaffRelationToPositionByPositionID(
    sql: SQL,
    staffID: string,
    positionID: number,
    preference: number,
    proficiency: number
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        INSERT INTO
                staff_positions
        (
                staff_id,
                position_id,
                preference,
                proficiency
        )
        VALUES
        (
                ${ staffID },
                ${ positionID },
                ${ preference },
                ${ proficiency }
        )
        ON CONFLICT
        (
                staff_id,
                position_id
        )
        DO UPDATE
        SET     preference  = EXCLUDED.preference,
                proficiency = EXCLUDED.proficiency

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function unsetStaffRelationToPositionByPositionID(
    sql: SQL,
    staffID: string,
    positionID: number
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                staff_positions

        WHERE   staff_id    = ${ staffID }
        AND     position_id = ${ positionID }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function setStaffRelationToStaffByStaffID(
    sql: SQL,
    staffID: string,
    relatedStaffID: string,
    preference: number
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        INSERT INTO
                staff_peer_preferences
        (
                staff_a_id,
                staff_b_id,
                preference
        )
        VALUES
        (
                Least(${ staffID }::UUID, ${ relatedStaffID }::UUID),
                Greatest(${ staffID }::UUID, ${ relatedStaffID }::UUID),
                ${ preference }
        )
        ON CONFLICT
        DO UPDATE
        SET     preference = EXCLUDED.preference

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function unsetStaffRelationToStaffByStaffID(
    sql: SQL,
    staffID: string,
    relatedStaffID: string
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                staff_peer_preferences

        WHERE   staff_a_id = Least(${ staffID }::UUID, ${ relatedStaffID }::UUID)
        AND     staff_b_id = Greatest(${ staffID }::UUID, ${ relatedStaffID }::UUID)

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}