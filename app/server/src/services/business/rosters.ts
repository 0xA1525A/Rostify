import { HTTPStatus } from "@lib:enums/http_status";
import { Response, type RFServerResponse } from "@lib:templates/response";
import { Result } from "@lib:templates/result";
import type { ServiceDependencies } from "@lib:templates/service_deps";
import { readString, toRecord } from "@lib:templates/request_values";
import type { Nullable } from "@lib:types/nullable";

import {
    getAccessPrincipal,
    validateAccessPermission,
    type AccessPrincipal
} from "@service:permission/permission";
import {
    addDaysUTC,
    checkDateAccess,
    requiresPriorDay,
    type RosterDateAction
} from "@service:permission/date_access";

import {
    deleteRosterPunchesByDate,
    deleteRosterPunchesByRosterRecordID,
    deleteRosterRecordByDateAndStaffID,
    deleteRosterRecordsByDate,
    getAllRosterRecords,
    getDailyRosterByDate,
    getRosterPunchesByDateAndStaffID,
    getRosterRecordByDateAndStaffID,
    getRosterRecordsByDate
} from "@data:rosters";
import {
    deleteScheduleByRosterRecordID,
    deleteSchedulePositionsByDate,
    deleteScheduleTasksByDate
} from "@data:schedules";

import { generateDailyRosterAndSchedule } from "@service:business/generation";
import { moveStaffShift } from "@service:business/roster_moves";

import type { DailyRosterEntry, RosterPunch, RosterRecord } from "@model:rosters";

type DateGuard = {
    allowed  : boolean,
    message  : string,
    principal: Nullable<AccessPrincipal>
};

function getDateParam(d: ServiceDependencies): Nullable<string> {
    const params: Record<string, unknown> = toRecord(d.params);
    const date  : string                  = readString(params, "date") ?? '';

    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
}

function getStaffIDParam(d: ServiceDependencies): Nullable<string> {
    const params : Record<string, unknown> = toRecord(d.params);
    const staffID: string                  = readString(params, "staffID") ?? '';

    return staffID.trim() === '' ? null : staffID;
}

async function guardDateAction(
    d     : ServiceDependencies,
    date  : string,
    action: RosterDateAction
): Promise<DateGuard> {
    const principalResult: Result<AccessPrincipal> = await getAccessPrincipal(d.sql, d.headers, "manager", false);
    const principal: Nullable<AccessPrincipal> = principalResult.getData();

    if (!principalResult.isSuccess() || principal === null) {
        return { allowed: false, message: "Insufficient permission.", principal: null };
    }

    const decision = checkDateAccess(principal.privilege, date, action);

    return {
        allowed  : decision.allowed,
        message  : decision.message,
        principal: decision.allowed ? principal : null
    };
}

export async function handleGetAllRosters(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const rostersResult: Result<Array<RosterRecord>>    = await getAllRosterRecords(d.sql);
    const rosters     : Nullable<Array<RosterRecord>>  = rostersResult.getData();

    if (!rostersResult.isSuccess() || rosters === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Rosters not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, rosters).unwrap(d.set);
}

export async function handleGetAllRostersOnDate(d: ServiceDependencies): Promise<RFServerResponse> {
    const date: Nullable<string> = getDateParam(d);

    if (date === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid date.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const rostersResult: Result<Array<DailyRosterEntry>>    = await getDailyRosterByDate(d.sql, date);
    const rosters     : Nullable<Array<DailyRosterEntry>>  = rostersResult.getData();

    if (!rostersResult.isSuccess() || rosters === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Rosters not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, rosters).unwrap(d.set);
}

export async function handleGetStaffRosterOnDateByID(d: ServiceDependencies): Promise<RFServerResponse> {
    const date   : Nullable<string> = getDateParam(d);
    const staffID: Nullable<string> = getStaffIDParam(d);

    if (date === null || staffID === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid date or staff ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, staffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const punchesResult: Result<Array<RosterPunch>>    = await getRosterPunchesByDateAndStaffID(d.sql, date, staffID);
    const punches     : Nullable<Array<RosterPunch>>  = punchesResult.getData();

    if (!punchesResult.isSuccess() || punches === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Roster punches not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, punches).unwrap(d.set);
}

export async function handleGenerateRoster(d: ServiceDependencies): Promise<RFServerResponse> {
    const date: Nullable<string> = getDateParam(d);

    if (date === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid date.").unwrap(d.set);
    }

    const guard: DateGuard = await guardDateAction(d, date, "generate");

    if (!guard.allowed) {
        return new Response(false, HTTPStatus.FORBIDDEN, guard.message).unwrap(d.set);
    }

    if (requiresPriorDay(date)) {
        const previousDate: string = addDaysUTC(date, -1);
        const priorResult: Result<Array<RosterRecord>> = await getRosterRecordsByDate(d.sql, previousDate);

        if (!priorResult.isSuccess() || (priorResult.getData() ?? []).length === 0) {
            return new Response(
                false,
                HTTPStatus.CONFLICT,
                "The previous day's roster must be generated first."
            ).unwrap(d.set);
        }
    }

    const generated: Result<Array<DailyRosterEntry>>   = await generateDailyRosterAndSchedule(d.sql, date);
    const roster  : Nullable<Array<DailyRosterEntry>> = generated.getData();

    if (!generated.isSuccess() || roster === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to generate roster.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.CREATED, roster).unwrap(d.set);
}

export async function handleMoveStaffRoster(d: ServiceDependencies): Promise<RFServerResponse> {
    const date   : Nullable<string> = getDateParam(d);
    const staffID: Nullable<string> = getStaffIDParam(d);

    if (date === null || staffID === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid date or staff ID.").unwrap(d.set);
    }

    const guard: DateGuard = await guardDateAction(d, date, "move");

    if (!guard.allowed) {
        return new Response(false, HTTPStatus.FORBIDDEN, guard.message).unwrap(d.set);
    }

    const body   : Record<string, unknown> = toRecord(d.body);
    const shiftID: number                  = Number(body.shiftID);

    if (!Number.isInteger(shiftID) || shiftID < 1) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid shift ID.").unwrap(d.set);
    }

    const moved: Result<DailyRosterEntry> = await moveStaffShift(d.sql, date, staffID, shiftID);
    const entry: Nullable<DailyRosterEntry> = moved.getData();

    if (!moved.isSuccess() || entry === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Roster record or shift not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, entry).unwrap(d.set);
}

export async function handleDeleteRosterByDate(d: ServiceDependencies): Promise<RFServerResponse> {
    const date: Nullable<string> = getDateParam(d);

    if (date === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid date.").unwrap(d.set);
    }

    const guard: DateGuard = await guardDateAction(d, date, "delete");

    if (!guard.allowed) {
        return new Response(false, HTTPStatus.FORBIDDEN, guard.message).unwrap(d.set);
    }

    await deleteRosterPunchesByDate(d.sql, date);
    await deleteSchedulePositionsByDate(d.sql, date);
    await deleteScheduleTasksByDate(d.sql, date);
    await deleteRosterRecordsByDate(d.sql, date);

    return new Response(true, HTTPStatus.OK, "Successfully deleted the roster for that date.").unwrap(d.set);
}

export async function handleDeleteStaffRosterByDate(d: ServiceDependencies): Promise<RFServerResponse> {
    const date   : Nullable<string> = getDateParam(d);
    const staffID: Nullable<string> = getStaffIDParam(d);

    if (date === null || staffID === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid date or staff ID.").unwrap(d.set);
    }

    const guard: DateGuard = await guardDateAction(d, date, "delete");

    if (!guard.allowed) {
        return new Response(false, HTTPStatus.FORBIDDEN, guard.message).unwrap(d.set);
    }

    const recordResult: Result<RosterRecord> = await getRosterRecordByDateAndStaffID(d.sql, date, staffID);
    const record: Nullable<RosterRecord> = recordResult.getData();

    if (!recordResult.isSuccess() || record === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Roster record not found.").unwrap(d.set);
    }

    await deleteRosterPunchesByRosterRecordID(d.sql, record.id);
    await deleteScheduleByRosterRecordID(d.sql, record.id);
    await deleteRosterRecordByDateAndStaffID(d.sql, date, staffID);

    return new Response(true, HTTPStatus.OK, "Successfully deleted the staff roster for that date.").unwrap(d.set);
}
