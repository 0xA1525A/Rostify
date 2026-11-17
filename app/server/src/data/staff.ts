import { SQL } from "bun";

import { Result } from "@lib:templates/result";

import type { StaffPreview, Staff, StaffAvailability, StaffTel, StaffEmail } from "@model:staff";

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

    return new Result<R>(true, result);
}

export async function getStaffByID(
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

    return new Result<Staff>(true, result[0]);
}

export async function getStaffPreviewsBySimilarNames(
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

    return new Result<R>(true, result);
}

export async function createStaff(
    sql: SQL,
    staffInfo: Omit<Staff, "id">
): Promise<Result<string>> {
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

export async function updateStaffByID(
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

    return new Result<Staff>(true, result[0]);
}

export async function deleteStaffByID(
    sql: SQL,
    staffID: string
): Promise<Result<{ firstName: string, lastName: string }>> {
    type E = {
        firstName: string,
        lastName : string
    };
    type R = Array<E>;

    const result: R = await sql`
        DELETE FROM
                staff

        WHERE   id = ${ staffID }

        RETURNING
                first_name  AS "firstName",
                last_name   AS "lastName"
    `;

    if (result.length === 0) {
        return new Result<E>(false, null);
    }

    return new Result<E>(true, result[0]);
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

    if (result.length === 0) {
        return new Result<null>(false, null);
    }

    return new Result<null>(true, null);
}

export async function getEmailsByStaffID(
    sql: SQL,
    staffID: string
): Promise<Result<Array<StaffEmail>>> {
    type R = Array<StaffEmail>;

    const result: R = await sql`
        SELECT  id,
                staff_id AS "staffID"
                email

        FROM    staff_emails

        WHERE   staff_id = ${ staffID }
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function addEmailForID(
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

export async function getTelsByStaffID(
    sql: SQL,
    staffID: string
): Promise<Result<Array<StaffTel>>> {
    type R = Array<StaffTel>;

    const result: R = await sql`
        SELECT  id,
                staff_id AS "staffID"
                tel

        FROM    staff_tels

        WHERE   staff_id = ${ staffID }
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function addTelForID(
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

export async function updateEmailForIDByEmail(
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

export async function updateTelForIDByTel(
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

export async function deleteEmailFromIDByEmail(
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

    if (result.length === 0) {
        return new Result<null>(false, null);
    }

    return new Result<null>(true, null);
}

export async function deleteTelFromIDByTel(
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

    if (result.length === 0) {
        return new Result<null>(false, null);
    }

    return new Result<null>(true, null);
}

export async function createAvailabilityOnDateForID(
    sql: SQL,
    staffID: string,
    date: string,
    availability: StaffAvailability
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        INSERT INTO
                staff_availability
        (
                date,
                staff_id,
                from_time,
                to_time,
                to_date,
                is_flexible,
                ok_overtime,
                ok_multiple_break,
                ok_long_break,
                preferred_hour,
                preferred_break_hour,
                preferred_shift
        )
        VALUES
        (
                ${ date },
                ${ staffID },
                ${ availability.fromTime },
                ${ availability.toTime },
                ${ availability.toDate },
                ${ availability.isFlexible },
                ${ availability.okOvertime },
                ${ availability.okMultipleBreak },
                ${ availability.okLongBreak },
                ${ availability.preferredHour },
                ${ availability.preferredBreakHour },
                ${ availability.preferredShift }
        )
        RETURNING
                1 AS "_"
    `;

    if (result.length === 0) {
        return new Result<null>(false, null);
    }

    return new Result<null>(true, null);
}

export async function updateAvailabilityOnDateForID(
    sql: SQL,
    staffID: string,
    date: string,
    availability: StaffAvailability
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        UPDATE  staff_availability

        SET     from_time            = ${ availability.fromTime },
                to_time              = ${ availability.toTime },
                to_date              = ${ availability.toDate },
                is_flexible          = ${ availability.isFlexible },
                ok_overtime          = ${ availability.okOvertime },
                ok_multiple_break    = ${ availability.okMultipleBreak },
                ok_long_break        = ${ availability.okLongBreak },
                preferred_hour       = ${ availability.preferredHour },
                preferred_break_hour = ${ availability.preferredBreakHour },
                preferred_shift      = ${ availability.preferredShift }

        WHERE   staff_id = ${ staffID }
        AND     date     = ${ date }

        RETURNING
                1 AS "_"
    `;

    if (result.length === 0) {
        return new Result<null>(false, null);
    }

    return new Result<null>(true, null);
}

export async function deleteAvailabilityOnDateForID(
    sql: SQL,
    staffID: string,
    date: string
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                staff_availability

        WHERE   staff_id = ${ staffID }
        AND     date     = ${ date }

        RETURNING
                1 AS "_"
    `;

    if (result.length === 0) {
        return new Result<null>(false, null);
    }

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

    if (result.length === 0) {
        return new Result<null>(false, null);
    }

    return new Result<null>(true, null);
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

    if (result.length === 0) {
        return new Result<null>(false, null);
    }

    return new Result<null>(true, null);
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

    if (result.length === 0) {
        return new Result<null>(false, null);
    }

    return new Result<null>(true, null);
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

    if (result.length === 0) {
        return new Result<null>(false, null);
    }

    return new Result<null>(true, null);
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

    if (result.length === 0) {
        return new Result<null>(false, null);
    }

    return new Result<null>(true, null);
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

    if (result.length === 0) {
        return new Result<null>(false, null);
    }

    return new Result<null>(true, null);
}