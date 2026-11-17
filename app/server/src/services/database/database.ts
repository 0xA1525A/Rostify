import { SQL } from "bun";

import type { Option }   from "@lib:types/option";
import type { Nullable } from "@lib:types/nullable";
import      { Result }   from "@lib:templates/result";

import { validateDatabaseURL } from "@service:database/validator";

let connection: Option<SQL>;

export async function connect(url: string): Promise<Result<SQL | string>> {
    if (connection !== undefined) {
        return new Result<SQL>(true, connection);
    }

    if (!validateDatabaseURL(url)) {
        return new Result<string>(false, "Invalid `DATABASE_URL`.");
    }

    const sql: SQL = new SQL(url);

    try {
        await sql`SELECT 1`;

        connection = sql;

        return new Result<SQL>(true, sql);
    }
    catch (error: unknown) {
        await sql.close();

        return new Result<string>(false, String(error));
    }
}

export async function disconnect(): Promise<Result<Nullable<string>>> {
    if (connection === undefined) {
        return new Result<null>(true, null);
    }

    const sql: SQL = connection;

    try {
        await sql.close();
        connection = undefined;

        return new Result<null>(true, null);
    }
    catch (error: unknown) {
        return new Result<string>(false, String(error));
    }
}

export async function isConnected(sql: SQL): Promise<Result<string>> {
    const result: Array<{ _: number }> = await sql`SELECT 1`;

    if (result.length === 0) {
        return new Result<string>(false, "Database connection does not exist.");
    }

    return new Result<string>(true, null);
}