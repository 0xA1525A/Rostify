import { SQL } from "bun";

import type { AccountStatus, Login } from "@model:logins";
import type { LoginPreview } from "@model:relations";
import { validateLoginPreview } from "@model:relations";
import      { validateLoginCredentials } from "@model:logins";
import      { Result }               from "@lib:templates/result";

export async function getAllLogins(sql: SQL): Promise<Result<Array<LoginPreview>>> {
    type R = Array<LoginPreview>;

    const result: R = await sql`
        SELECT  staff_id    AS "staffID",
                username,
                status

        FROM    logins
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    if (!result.every(validateLoginPreview)) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

async function getLoginBy(sql: SQL, column: string, value: string): Promise<Result<Login>> {
    type R = Array<{
        staffID     : string,
        username    : string,
        passwordHash: string,
        status      : AccountStatus
    }>;

    const result: R = await sql`
        SELECT  staff_id        AS "staffID",
                username,
                password_hash   AS "passwordHash",
                status

        FROM    logins

        WHERE   ${ sql(column) } = ${ value }
    `;

    if (result.length === 0) {
        return new Result<Login>(false, null);
    }

    const first: unknown = result[0];

    if (!validateLoginCredentials(first)) {
        return new Result<Login>(false, null);
    }

    return new Result<Login>(true, first);
}

export async function getLoginByUsername(sql: SQL, username: string): Promise<Result<Login>> {
    return await getLoginBy(sql, "username", username);
}

export async function getLoginByStaffID(sql: SQL, staffID: string): Promise<Result<Login>> {
    return await getLoginBy(sql, "staff_id", staffID);
}

export async function createLogin(
    sql     : SQL,
    staffID : string,
    newLogin: Pick<Login, "username" | "passwordHash">
): Promise<Result<string>> {
    type R = Array<{ username: string }>;

    const result: R = await sql`
        INSERT INTO
                logins
        (
                staff_id,
                username,
                password_hash,
                status
        )
        VALUES  (
                ${ staffID },
                ${ newLogin.username },
                ${ newLogin.passwordHash },
                'pending'
        )
        RETURNING
                username
    `;

    if (result.length === 0) {
        return new Result<string>(false, null);
    }

    return new Result<string>(true, result[0].username);
}

export async function updateLoginByID(
    sql: SQL,
    staffID: string,
    newCredentials: Omit<Login, "staffID">
): Promise<Result<Login>> {
    type R = Array<Login>;

    const result: R = await sql`
        UPDATE  logins

        SET     username      = ${ newCredentials.username },
                password_hash = ${ newCredentials.passwordHash },
                status        = ${ newCredentials.status }

        WHERE   staff_id = ${ staffID }

        RETURNING
            staff_id        AS "staffID",
            username,
            password_hash   AS "passwordHash",
            status
    `;

    if (result.length === 0) {
        return new Result<Login>(false, null);
    }

    const first: unknown = result[0];

    if (!validateLoginCredentials(first)) {
        return new Result<Login>(false, null);
    }

    return new Result<Login>(true, first);
}

export async function deleteLoginByStaffID(sql: SQL, staffID: string): Promise<Result<string>> {
    type R = Array<{ username: string }>;

    const result: R = await sql`
        DELETE FROM
                logins

        WHERE
                staff_id = ${ staffID }

        RETURNING
                username
    `;

    if (result.length === 0) {
        return new Result<string>(false, null);
    }

    return new Result<string>(true, result[0].username);
}

export async function deleteAllLogins(sql: SQL): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                logins

        RETURNING
                1 AS "_"
    `;

    if (result.length === 0) {
        return new Result<null>(false, null);
    }

    return new Result<null>(true, null);
}