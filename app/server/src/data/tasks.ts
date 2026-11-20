import { SQL } from "bun";

import      { Result }           from "@lib:templates/result";
import type { WeekdayShortName } from "@lib:enums/datetime";

import type { Task } from "@model:tasks";
import      { validateTask } from "@model:tasks";

export async function getAllTasks(
    sql: SQL
): Promise<Result<Array<Task>>> {
    type R = Array<Task>;

    const result: R = await sql`
        SELECT  id,
                day,
                is_holiday  AS "isHoliday",
                name,
                description,
                responsible_unit_id     AS "responsibleUnitID",
                responsible_position_id AS "responsiblePositionID"

        FROM    tasks
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    if (!result.every(validateTask)) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getAllTasksByDay(
    sql: SQL,
    day: WeekdayShortName
): Promise<Result<Array<Task>>> {
    type R = Array<Task>;

    const result: R = await sql`
        SELECT  id,
                day,
                is_holiday  AS "isHoliday",
                name,
                description,
                responsible_unit_id     AS "responsibleUnitID",
                responsible_position_id AS "responsiblePositionID"

        FROM    tasks

        WHERE   day = ${ day }
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    if (!result.every(validateTask)) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function getTaskByTaskID(
    sql: SQL,
    taskID: number
): Promise<Result<Task>> {
    type R = Array<Task>;

    const result: R = await sql`
        SELECT  id,
                day,
                is_holiday  AS "isHoliday",
                name,
                description,
                responsible_unit_id     AS "responsibleUnitID",
                responsible_position_id AS "responsiblePositionID"

        FROM    tasks

        WHERE   id = ${ taskID }
    `;

    if (result.length === 0) {
        return new Result<Task>(false, null);
    }

    const first: unknown = result[0];

    if (!validateTask(first)) {
        return new Result<Task>(false, null);
    }

    return new Result<Task>(true, first);
}

export async function searchTasksByTaskName(
    sql: SQL,
    taskName: string
): Promise<Result<Array<Task>>> {
    type R = Array<Task>;

    const result: R = await sql`
        SELECT  id,
                day,
                is_holiday  AS "isHoliday",
                name,
                description,
                responsible_unit_id     AS "responsibleUnitID",
                responsible_position_id AS "responsiblePositionID"

        FROM    tasks

        WHERE   name ILIKE ${ taskName }

        ORDER BY
                day         ASC,
                is_holiday  ASC,
                name        ASC
    `;

    if (result.length === 0) {
        return new Result<R>(false, null);
    }

    if (!result.every(validateTask)) {
        return new Result<R>(false, null);
    }

    return new Result<R>(true, result);
}

export async function createTask(
    sql: SQL,
    taskInfo: Omit<Task, "id">
): Promise<Result<number>> {
    type R = Array<{ id: number }>;

    const result: R = await sql`
        INSERT INTO
                tasks
        (
                day,
                is_holiday,
                name,
                description,
                responsible_unit_id,
                responsible_position_id
        )
        VALUES
        (
                ${ taskInfo.day },
                ${ taskInfo.isHoliday },
                ${ taskInfo.name },
                ${ taskInfo.description },
                ${ taskInfo.responsibleUnitID },
                ${ taskInfo.responsiblePositionID }
        )
        RETURNING
                id
    `;

    if (result.length === 0) {
        return new Result<number>(false, null);
    }

    return new Result<number>(true, result[0].id);
}

export async function updateTaskByTaskID(
    sql: SQL,
    taskID: number,
    taskInfo: Omit<Task, "id">
): Promise<Result<Task>> {
    type R = Array<Task>;

    const result: R = await sql`
        UPDATE  tasks

        SET     day          = ${ taskInfo.day },
                is_holiday   = ${ taskInfo.isHoliday },
                name         = ${ taskInfo.name },
                description  = ${ taskInfo.description },
                responsible_unit_id     = ${ taskInfo.responsibleUnitID },
                responsible_position_id = ${ taskInfo.responsiblePositionID }

        WHERE   id = ${ taskID }

        RETURNING
                id,
                day,
                is_holiday  AS "isHoliday",
                name,
                description,
                responsible_unit_id     AS "responsibleUnitID",
                responsible_position_id AS "responsiblePositionID"
    `;

    if (result.length === 0) {
        return new Result<Task>(false, null);
    }

    const first: unknown = result[0];

    if (!validateTask(first)) {
        return new Result<Task>(false, null);
    }

    return new Result<Task>(true, first);
}

export async function deleteAllTasks(
    sql: SQL
): Promise<Result<null>> {
    type R = Array<{ _: number }>;

    const result: R = await sql`
        DELETE FROM
                tasks

        RETURNING
                1 AS "_"
    `;

    return new Result<null>(result.length !== 0, null);
}

export async function deleteTaskByTaskID(
    sql: SQL,
    taskID: number
): Promise<Result<string>> {
    type R = Array<{ name: string }>;

    const result: R = await sql`
        DELETE FROM
                tasks

        WHERE   id = ${ taskID }

        RETURNING
                name
    `;

    if (result.length === 0) {
        return new Result<string>(false, null);
    }

    return new Result<string>(true, result[0].name);
}