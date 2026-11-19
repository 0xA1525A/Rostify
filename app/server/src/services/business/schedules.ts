import { HTTPStatus } from "@lib:enums/http_status";
import { Response, type RFServerResponse } from "@lib:templates/response";
import { Result } from "@lib:templates/result";
import type { ServiceDependencies } from "@lib:templates/service_deps";
import type { Nullable } from "@lib:types/nullable";

import { validateAccessPermission } from "@service:permission/permission";

import {
    getAllRosterRecords,
    getRosterRecordByDateAndStaffID,
    getRosterRecordByID,
    getRosterRecordsByDate,
    getRosterRecordsByStaffID
} from "@data:rosters";
import {
    createSchedulePosition,
    createScheduleTask,
    deleteAllSchedules,
    deleteScheduleByDateAndStaffID,
    deleteSchedulePositionsByDate,
    deleteScheduleTasksByDate,
    deleteSchedulePositionsByStaffID,
    deleteScheduleTasksByStaffID,
    getAllSchedulePositions,
    getAllScheduleTasks,
    getSchedulePositionsByDate,
    getSchedulePositionsByDateAndStaffID,
    getSchedulePositionsByRosterRecordID,
    getScheduleTasksByDate,
    getScheduleTasksByDateAndStaffID,
    getScheduleTasksByRosterRecordID
} from "@data:schedules";

import type { RosterRecord } from "@model:rosters";
import {
    type Schedule,
    type SchedulePosition,
    type ScheduleTask,
    validateSchedulePosition,
    validateScheduleTask
} from "@model:schedules";

function getDateParam(d: ServiceDependencies): Nullable<string> {
    const date: string = d.params?.date ?? '';

    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
}

function getStaffIDParam(d: ServiceDependencies): Nullable<string> {
    const staffID: string = d.params?.staffID ?? '';

    return staffID.trim() === '' ? null : staffID;
}

function buildSchedules(
    records: Array<RosterRecord>,
    positions: Array<SchedulePosition>,
    tasks: Array<ScheduleTask>
): Array<Schedule> {
    return records.map((record: RosterRecord): Schedule => ({
        record  : record,
        positions: positions.filter((position: SchedulePosition): boolean => position.rosterRecordID === record.id),
        tasks   : tasks.filter((task: ScheduleTask): boolean => task.rosterRecordID === record.id)
    }));
}

async function getSchedulesForRecords(
    sql: ServiceDependencies["sql"],
    records: Array<RosterRecord>
): Promise<Result<Array<Schedule>>> {
    const positions: Array<SchedulePosition> = [];
    const tasks   : Array<ScheduleTask>     = [];

    for (const record of records) {
        const positionsResult: Result<Array<SchedulePosition>> = await getSchedulePositionsByRosterRecordID(sql, record.id);
        const tasksResult    : Result<Array<ScheduleTask>>     = await getScheduleTasksByRosterRecordID(sql, record.id);

        if (positionsResult.isSuccess()) {
            positions.push(...(positionsResult.getData() ?? []));
        }

        if (tasksResult.isSuccess()) {
            tasks.push(...(tasksResult.getData() ?? []));
        }
    }

    return new Result<Array<Schedule>>(true, buildSchedules(records, positions, tasks));
}

export async function handleGetAllSchedulePreviews(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const recordsResult  : Result<Array<RosterRecord>>     = await getAllRosterRecords(d.sql);
    const positionsResult: Result<Array<SchedulePosition>> = await getAllSchedulePositions(d.sql);
    const tasksResult    : Result<Array<ScheduleTask>>     = await getAllScheduleTasks(d.sql);

    if (!recordsResult.isSuccess() || !positionsResult.isSuccess() || !tasksResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Schedules not found.").unwrap(d.set);
    }

    const schedules: Array<Schedule> = buildSchedules(
        recordsResult.getData() ?? [],
        positionsResult.getData() ?? [],
        tasksResult.getData() ?? []
    );

    return new Response(true, HTTPStatus.OK, schedules).unwrap(d.set);
}

export async function handleGetAllSchedulesOnDate(d: ServiceDependencies): Promise<RFServerResponse> {
    const date: Nullable<string> = getDateParam(d);

    if (date === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid date.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const recordsResult  : Result<Array<RosterRecord>>     = await getRosterRecordsByDate(d.sql, date);
    const positionsResult: Result<Array<SchedulePosition>> = await getSchedulePositionsByDate(d.sql, date);
    const tasksResult    : Result<Array<ScheduleTask>>     = await getScheduleTasksByDate(d.sql, date);

    if (!recordsResult.isSuccess() || !positionsResult.isSuccess() || !tasksResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Schedules not found.").unwrap(d.set);
    }

    const schedules: Array<Schedule> = buildSchedules(
        recordsResult.getData() ?? [],
        positionsResult.getData() ?? [],
        tasksResult.getData() ?? []
    );

    return new Response(true, HTTPStatus.OK, schedules).unwrap(d.set);
}

export async function handleGetStaffScheduleOnDateByID(d: ServiceDependencies): Promise<RFServerResponse> {
    const date   : Nullable<string> = getDateParam(d);
    const staffID: Nullable<string> = getStaffIDParam(d);

    if (date === null || staffID === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid date or staff ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, staffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const recordResult: Result<RosterRecord>   = await getRosterRecordByDateAndStaffID(d.sql, date, staffID);
    const record      : Nullable<RosterRecord> = recordResult.getData();

    if (!recordResult.isSuccess() || record === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Roster not found.").unwrap(d.set);
    }

    const positionsResult = await getSchedulePositionsByDateAndStaffID(d.sql, date, staffID);
    const tasksResult     = await getScheduleTasksByDateAndStaffID(d.sql, date, staffID);

    const schedule: Schedule = {
        record  : record,
        positions: positionsResult.getData() ?? [],
        tasks   : tasksResult.getData() ?? []
    };

    return new Response(true, HTTPStatus.OK, schedule).unwrap(d.set);
}

export async function handleGetAllStaffSchedules(d: ServiceDependencies): Promise<RFServerResponse> {
    const staffID: Nullable<string> = getStaffIDParam(d);

    if (staffID === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, staffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const recordsResult: Result<Array<RosterRecord>> = await getRosterRecordsByStaffID(d.sql, staffID);
    const records      : Nullable<Array<RosterRecord>> = recordsResult.getData();

    if (!recordsResult.isSuccess() || records === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Schedules not found.").unwrap(d.set);
    }

    const schedulesResult: Result<Array<Schedule>> = await getSchedulesForRecords(d.sql, records);

    return new Response(true, HTTPStatus.OK, schedulesResult.getData() ?? []).unwrap(d.set);
}

async function resolveRosterRecord(d: ServiceDependencies): Promise<Result<RosterRecord>> {
    const rosterRecordID: number = Number(d.body?.rosterRecordID);

    if (!Number.isInteger(rosterRecordID) || rosterRecordID < 1) {
        return new Result<RosterRecord>(false, null);
    }

    return await getRosterRecordByID(d.sql, rosterRecordID);
}

export async function handleCreateSchedule(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const recordResult: Result<RosterRecord> = await resolveRosterRecord(d);
    const record      : Nullable<RosterRecord> = recordResult.getData();

    if (!recordResult.isSuccess() || record === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid roster record ID.").unwrap(d.set);
    }

    const hasPosition: boolean = d.body?.positionID !== undefined;
    const hasTask   : boolean = d.body?.taskID     !== undefined;

    if (!hasPosition && !hasTask) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing position or task information.").unwrap(d.set);
    }

    if (hasPosition) {
        const positionData: unknown = {
            rosterRecordID: record.id,
            dateTime      : d.body?.dateTime ?? '',
            positionID    : d.body?.positionID ?? null
        };

        if (!validateSchedulePosition(positionData)) {
            return new Response(false, HTTPStatus.BAD_REQUEST, "Invalid schedule position.").unwrap(d.set);
        }

        const createPositionResult: Result<null> = await createSchedulePosition(d.sql, positionData);

        if (!createPositionResult.isSuccess()) {
            return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to create schedule position.").unwrap(d.set);
        }
    }

    if (hasTask) {
        const taskData: unknown = {
            rosterRecordID: record.id,
            dateTime      : d.body?.dateTime ?? '',
            taskID        : Number(d.body?.taskID)
        };

        if (!validateScheduleTask(taskData)) {
            return new Response(false, HTTPStatus.BAD_REQUEST, "Invalid schedule task.").unwrap(d.set);
        }

        const createTaskResult: Result<null> = await createScheduleTask(d.sql, taskData);

        if (!createTaskResult.isSuccess()) {
            return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to create schedule task.").unwrap(d.set);
        }
    }

    return new Response(true, HTTPStatus.CREATED, "Successfully created schedule entry.").unwrap(d.set);
}

export async function handleUpdateStaffScheduleOnDateByID(d: ServiceDependencies): Promise<RFServerResponse> {
    const date   : Nullable<string> = getDateParam(d);
    const staffID: Nullable<string> = getStaffIDParam(d);

    if (date === null || staffID === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid date or staff ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const recordResult: Result<RosterRecord>   = await getRosterRecordByDateAndStaffID(d.sql, date, staffID);
    const record      : Nullable<RosterRecord> = recordResult.getData();

    if (!recordResult.isSuccess() || record === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Roster not found.").unwrap(d.set);
    }

    const dateTime: string = d.body?.dateTime ?? '';

    if (dateTime.trim() === '') {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing date and time.").unwrap(d.set);
    }

    if (d.body?.positionID !== undefined) {
        const positionData: unknown = {
            rosterRecordID: record.id,
            dateTime      : dateTime,
            positionID    : d.body.positionID ?? null
        };

        if (!validateSchedulePosition(positionData)) {
            return new Response(false, HTTPStatus.BAD_REQUEST, "Invalid schedule position.").unwrap(d.set);
        }

        const updatePositionResult: Result<null> = await createSchedulePosition(d.sql, positionData);

        if (!updatePositionResult.isSuccess()) {
            return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to update schedule position.").unwrap(d.set);
        }
    }

    if (d.body?.taskID !== undefined) {
        const taskData: unknown = {
            rosterRecordID: record.id,
            dateTime      : dateTime,
            taskID        : Number(d.body.taskID)
        };

        if (!validateScheduleTask(taskData)) {
            return new Response(false, HTTPStatus.BAD_REQUEST, "Invalid schedule task.").unwrap(d.set);
        }

        const updateTaskResult: Result<null> = await createScheduleTask(d.sql, taskData);

        if (!updateTaskResult.isSuccess()) {
            return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to update schedule task.").unwrap(d.set);
        }
    }

    return new Response(true, HTTPStatus.OK, "Successfully updated staff schedule.").unwrap(d.set);
}

export async function handleDeleteAllSchedules(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const deleteResult: Result<null> = await deleteAllSchedules(d.sql);

    if (!deleteResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete all schedules.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all schedules.").unwrap(d.set);
}

export async function handleDeleteAllSchedulesOnDate(d: ServiceDependencies): Promise<RFServerResponse> {
    const date: Nullable<string> = getDateParam(d);

    if (date === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid date.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    await deleteSchedulePositionsByDate(d.sql, date);
    await deleteScheduleTasksByDate(d.sql, date);

    return new Response(true, HTTPStatus.OK, "Successfully deleted all schedules on that date.").unwrap(d.set);
}

export async function handleDeleteStaffScheduleOnDateByID(d: ServiceDependencies): Promise<RFServerResponse> {
    const date   : Nullable<string> = getDateParam(d);
    const staffID: Nullable<string> = getStaffIDParam(d);

    if (date === null || staffID === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid date or staff ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const deleteResult: Result<null> = await deleteScheduleByDateAndStaffID(d.sql, date, staffID);

    if (!deleteResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete staff schedule.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted staff schedule.").unwrap(d.set);
}

export async function handleDeleteAllStaffSchedules(d: ServiceDependencies): Promise<RFServerResponse> {
    const staffID: Nullable<string> = getStaffIDParam(d);

    if (staffID === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    await deleteSchedulePositionsByStaffID(d.sql, staffID);
    await deleteScheduleTasksByStaffID(d.sql, staffID);

    return new Response(true, HTTPStatus.OK, "Successfully deleted all schedules for staff member.").unwrap(d.set);
}
