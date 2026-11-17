import { SQL } from "bun";

import type { AccountStatus, LoginCredentials } from "@model:logins";
import      { Result }                          from "@lib:templates/result";

export async function getAllLoginCredentials(sql: SQL): Promise<Result<Array<Omit<LoginCredentials, "passwordHash">>>> {
    type R = Array<Omit<LoginCredentials, "passwordHash">>;

    const result: R = await sql`
        SELECT  staff_id    AS "staffID",
                username,
                status

        FROM    logins
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

async function getLoginCredentialsBy(
    sql   : SQL,
    column: string,
    value : string
): Promise<Result<LoginCredentials>> {
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
        return new Result<LoginCredentials>(false, null);
    }

    return new Result<LoginCredentials>(true, result[0] as LoginCredentials);
}

export async function getLoginCredentialsByUsername(
    sql     : SQL,
    username: string
): Promise<Result<LoginCredentials>> {
    return await getLoginCredentialsBy(sql, "username", username);
}

export async function getLoginCredentialsByStaffID(
    sql    : SQL,
    staffID: string
): Promise<Result<LoginCredentials>> {
    return await getLoginCredentialsBy(sql, "staff_id", staffID);
}

export async function createLoginAccount(
    sql         : SQL,
    staffID     : string,
    username    : string,
    passwordHash: string
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
                ${ username },
                ${ passwordHash },
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

export async function updateLoginAccountByID(
    sql: SQL,
    staffID: string,
    newCredentials: Omit<LoginCredentials, "staffID">
): Promise<Result<LoginCredentials>> {
    type R = Array<LoginCredentials>;

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
        return new Result<LoginCredentials>(false, null);
    }

    return new Result<LoginCredentials>(true, result[0]);
}

export async function deleteLoginAccountByID(
    sql: SQL,
    staffID: string
): Promise<Result<string>> {
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

export async function deleteAllLoginAccounts(
    sql: SQL
): Promise<Result<null>> {
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