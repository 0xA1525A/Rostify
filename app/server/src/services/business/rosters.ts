import { HTTPStatus } from "@lib:enums/http_status";
import { Response, type RFServerResponse } from "@lib:templates/response";
import { Result } from "@lib:templates/result";
import type { ServiceDependencies } from "@lib:templates/service_deps";
import type { Nullable } from "@lib:types/nullable";

import { validateAccessPermission } from "@service:permission/permission";

import {
    getAllRosterRecords,
    getDailyRosterByDate,
    getRosterPunchesByDateAndStaffID
} from "@data:rosters";

import { generateDailyRosterAndSchedule } from "@service:business/generation";

import type { DailyRosterEntry, RosterPunch, RosterRecord } from "@model:rosters";

function getDateParam(d: ServiceDependencies): Nullable<string> {
    const date: string = d.params?.date ?? '';

    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
}

function getStaffIDParam(d: ServiceDependencies): Nullable<string> {
    const staffID: string = d.params?.staffID ?? '';

    return staffID.trim() === '' ? null : staffID;
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

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const generated: Result<Array<DailyRosterEntry>>   = await generateDailyRosterAndSchedule(d.sql, date);
    const roster  : Nullable<Array<DailyRosterEntry>> = generated.getData();

    if (!generated.isSuccess() || roster === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to generate roster.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.CREATED, roster).unwrap(d.set);
}
