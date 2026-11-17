import { SQL } from "bun";

import { Result } from "@lib:templates/result";

import type { Session }    from "@model:sessions";
import type { StaffPrivilege } from "@model:staff";

export async function getSessionByStaffID(
    sql    : SQL,
    staffID: string
): Promise<Result<Session>> {
    type R = Array<Session>;

    const result: R = await sql`
        SELECT  token,
                staff_id    AS "staffID",
                created_at  AS "createdAt"

        FROM    active_sessions

        WHERE   staff_id = ${ staffID }
    `;

    if (result.length === 0) {
        return new Result<Session>(false, null);
    }

    return new Result<Session>(true, result[0]);
}

export async function getSessionTokenPrincipal(
    sql  : SQL,
    token: string
): Promise<Result<{ id: string, privilege: StaffPrivilege }>> {
    type E = {
        id: string,
        privilege: StaffPrivilege
    };
    type R = Array<E>;

    const result: R = await sql`
        SELECT  s.id,
                s.privilege

        FROM    active_sessions AS "a"
        JOIN    staff           AS "s"
        ON      a.staff_id = s.id

        WHERE   a.token = ${ token }
    `;

    if (result.length === 0) {
        return new Result<E>(false, null);
    }

    return new Result<E>(true, result[0]);
}

export async function createSessionForStaffID(
    sql    : SQL,
    staffID: string
): Promise<Result<string>> {
    type R = Array<{ token: string }>;

    const result: R = await sql`
        INSERT INTO
                active_sessions
        (
                staff_id
        )
        VALUES
        (
                ${ staffID }
        )
        RETURNING
                token
    `;

    if (result.length === 0) {
        return new Result<string>(false, null);
    }

    return new Result<string>(true, result[0].token);
}

export async function isSessionTokenExist(
    sql  : SQL,
    token: string
): Promise<Result<boolean>> {
    type R = Array<{ staffID: string }>;

    const result: R = await sql`
        SELECT  staff_id AS "staffID"

        FROM    active_sessions

        WHERE   token = ${ token }
    `;

    return new Result<boolean>(true, result.length !== 0);
}

export async function deleteSessionByToken(
    sql  : SQL,
    token: string
): Promise<Result<string>> {
    type R = Array<{
        staffID: string
    }>;

    const deleteResult: R = await sql`
        DELETE FROM
                active_sessions

        WHERE   token = ${ token }

        RETURNING
                staff_id AS "staffID"
    `;

    if (!deleteResult || deleteResult.length === 0) {
        return new Result<string>(false, null);
    }

    return new Result<string>(true, deleteResult[0].staffID);
}