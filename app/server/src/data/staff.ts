import { SQL } from "bun";

import { Result } from "@lib:templates/result";

import type { StaffPreview, Staff, StaffTel, StaffEmail } from "@model:staff";
import      { validateStaff, validateStaffPreview, validateStaffEmail, validateStaffTel } from "@model:staff";
import type { StaffWorkInfo, StaffName } from "@model:relations";
import      { validateStaffWorkInfo, validateStaffName } from "@model:relations";

export async function getAllStaffPreviews(
    sql: SQL
): Promise<Result<Array<StaffPreview>>> {
    type R = Array<StaffPreview>;

    const result: R = await sql`
        SELECT  id,
                nickname,
                first_name  AS "firstName",
                middle_name AS "middleName",
                last_name   AS "lastName"

        FROM    staff
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    if (!result.every(validateStaffPreview)) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getAllStaffWorkInfo(
    sql: SQL
): Promise<Result<Array<StaffWorkInfo>>> {
    type R = Array<StaffWorkInfo>;

    const result: R = await sql`
        SELECT  id,
                is_full_time AS "isFullTime"

        FROM    staff
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    if (!result.every(validateStaffWorkInfo)) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getStaffByStaffID(
    sql    : SQL,
    staffID: string
): Promise<Result<Staff>> {
    type R = Array<Staff>;

    const result: R = await sql`
        SELECT  id,
                nickname,
                first_name  AS "firstName",
                middle_name AS "middleName",
                last_name   AS "lastName",
                TO_CHAR(date_of_birth, 'YYYY-MM-DD') as "dateOfBirth",
                is_full_time    AS "isFullTime",
                privilege

        FROM    staff

        WHERE   id = ${ staffID }
    `;

    if (result.length === 0) {
        return new Result<Staff>(false, null);
    }

    const first: unknown = result[0];

    if (!validateStaff(first)) {
        return new Result<Staff>(false, null);
    }

    return new Result<Staff>(true, first);
}

export async function getStaffPreviewsByAnyName(
    sql: SQL,
    name: string
): Promise<Result<Array<StaffPreview>>> {
    type R = Array<StaffPreview>;

    const result: R = await sql`
        SELECT  id,
                nickname,
                first_name  AS "firstName",
                middle_name AS "middleName",
                last_name   AS "lastName"

        FROM    staff

        WHERE   nickname    ILIKE ${ name }
        OR      first_name  ILIKE ${ name }
        OR      middle_name ILIKE ${ name }
        OR      last_name   ILIKE ${ name }

        ORDER BY
                nickname    ASC,
                first_name  ASC,
                middle_name ASC,
                last_name   ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    if (!result.every(validateStaffPreview)) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function createStaff(sql: SQL, staffInfo: Omit<Staff, "id">): Promise<Result<string>> {
    type R = Array<{ id: string }>;

    const result: R = await sql`
        INSERT INTO
                staff
        (
                nickname,
                first_name,
                middle_name,
                last_name,
                date_of_birth,
                is_full_time,
                privilege
        )
        VALUES
        (
                ${ staffInfo.nickname },
                ${ staffInfo.firstName },
                ${ staffInfo.middleName },
                ${ staffInfo.lastName },
                ${ staffInfo.dateOfBirth },
                ${ staffInfo.isFullTime },
                ${ staffInfo.privilege }
        )
        RETURNING
                id
    `;

    if (result.length === 0) {
        return new Result<string>(false, null);
    }

    return new Result<string>(true, result[0].id);
}

export async function updateStaffByStaffID(
    sql: SQL,
    staffID: string,
    staffInfo: Omit<Staff, "id">
): Promise<Result<Staff>> {
    type R = Array<Staff>;

    const result: R = await sql`
        UPDATE  staff

        SET     nickname      = ${ staffInfo.nickname },
                first_name    = ${ staffInfo.firstName },
                middle_name   = ${ staffInfo.middleName },
                last_name     = ${ staffInfo.lastName },
                date_of_birth = ${ staffInfo.dateOfBirth },
                is_full_time  = ${ staffInfo.isFullTime },
                privilege     = ${ staffInfo.privilege }

        WHERE   id = ${ staffID }

        RETURNING
                id,
                nickname,
                first_name  AS "firstName",
                middle_name AS "middleName",
                last_name   AS "lastName",
                TO_CHAR(date_of_birth, 'YYYY-MM-DD') as "dateOfBirth",
                is_full_time    AS "isFullTime",
                privilege
    `;

    if (result.length === 0) {
        return new Result<Staff>(false, null);
    }

    const first: unknown = result[0];

    if (!validateStaff(first)) {
        return new Result<Staff>(false, null);
    }

    return new Result<Staff>(true, first);
}

export async function deleteStaffByStaffID(
    sql: SQL,
    staffID: string
): Promise<Result<StaffName>> {
    type R = Array<StaffName>;

    const result: R = await sql`
        DELETE FROM
                staff

        WHERE   id = ${ staffID }

        RETURNING
                first_name  AS "firstName",
                last_name   AS "lastName"
    `;

    if (result.length === 0) {
        return new Result<StaffName>(false, null);
    }

    const first: unknown = result[0];

    if (!validateStaffName(first)) {
        return new Result<StaffName>(false, null);
    }

    return new Result<StaffName>(true, first);
}

export async function deleteAllStaff(
    sql: SQL
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                staff

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function getAllEmails(sql: SQL): Promise<Result<Array<StaffEmail>>> {
    type R = Array<StaffEmail>;

    const result: R = await sql`
        SELECT  id,
                staff_id AS "staffID",
                email

        FROM    staff_emails

        ORDER BY
                email       ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    if (!result.every(validateStaffEmail)) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getEmailsByStaffID(
    sql: SQL,
    staffID: string
): Promise<Result<Array<StaffEmail>>> {
    type R = Array<StaffEmail>;

    const result: R = await sql`
        SELECT  id,
                staff_id AS "staffID",
                email

        FROM    staff_emails

        WHERE   staff_id = ${ staffID }
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    if (!result.every(validateStaffEmail)) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function addEmailByStaffID(
    sql: SQL,
    staffID: string,
    email: string
): Promise<Result<number>> {
    type R = Array<{ id: number }>;

    const result: R = await sql`
        INSERT INTO
                staff_emails
        (
                staff_id,
                email
        )
        VALUES
        (
                ${ staffID },
                ${ email }
        )
        RETURNING
                id
    `;

    if (result.length === 0) {
        return new Result<number>(false, null);
    }

    return new Result<number>(true, result[0].id);
}

export async function getAllTels(sql: SQL): Promise<Result<Array<StaffTel>>> {
    type R = Array<StaffTel>;

    const result: R = await sql`
        SELECT  id,
                staff_id AS "staffID",
                tel

        FROM    staff_tels

        ORDER BY
                tel         ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    if (!result.every(validateStaffTel)) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getTelsByStaffID(
    sql: SQL,
    staffID: string
): Promise<Result<Array<StaffTel>>> {
    type R = Array<StaffTel>;

    const result: R = await sql`
        SELECT  id,
                staff_id AS "staffID",
                tel

        FROM    staff_tels

        WHERE   staff_id = ${ staffID }
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    if (!result.every(validateStaffTel)) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function addTelByStaffID(
    sql: SQL,
    staffID: string,
    tel: string
): Promise<Result<number>> {
    type R = Array<{ id: number }>;

    const result: R = await sql`
        INSERT INTO
                staff_tels
        (
                staff_id,
                tel
        )
        VALUES
        (
                ${ staffID },
                ${ tel }
        )
        RETURNING
                id
    `;

    if (result.length === 0) {
        return new Result<number>(false, null);
    }

    return new Result<number>(true, result[0].id);
}

export async function updateEmailByEmailAndStaffID(
    sql: SQL,
    staffID: string,
    email: string,
    newEmail: string
): Promise<Result<number>> {
    type R = Array<{ id: number }>;

    const result: R = await sql`
        UPDATE  staff_emails

        SET     email = ${ newEmail }

        WHERE   staff_id = ${ staffID }
        AND     email    = ${ email }

        RETURNING
                id
    `;

    if (result.length === 0) {
        return new Result<number>(false, null);
    }

    return new Result<number>(true, result[0].id);
}

export async function updateTelByTelAndStaffID(
    sql: SQL,
    staffID: string,
    tel: string,
    newTel: string
): Promise<Result<number>> {
    type R = Array<{ id: number }>;

    const result: R = await sql`
        UPDATE  staff_tels

        SET     tel = ${ newTel }

        WHERE   staff_id = ${ staffID }
        AND     tel      = ${ tel }

        RETURNING
                id
    `;

    if (result.length === 0) {
        return new Result<number>(false, null);
    }

    return new Result<number>(true, result[0].id);
}

export async function deleteEmailByEmail(
    sql: SQL,
    staffID: string,
    email: string
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                staff_emails

        WHERE   staff_id = ${ staffID }
        AND     email    = ${ email }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteAllEmails(sql: SQL): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                staff_emails

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteTelByTel(
    sql: SQL,
    staffID: string,
    tel: string
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                staff_tels

        WHERE   staff_id = ${ staffID }
        AND     tel      = ${ tel }

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteAllTels(sql: SQL): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                staff_tels

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}