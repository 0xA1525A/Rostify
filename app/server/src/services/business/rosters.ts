import { HTTPStatus } from "@lib:enums/http_status";
import { Response, type RFServerResponse } from "@lib:templates/response";
import { Result } from "@lib:templates/result";
import type { ServiceDependencies } from "@lib:templates/service_deps";
import type { Nullable } from "@lib:types/nullable";

import { validateAccessPermission } from "@service:permission/permission";

import {
    createRosterRecord,
    deleteAllRosterRecords,
    deleteRosterRecordByDateAndStaffID,
    deleteRosterRecordsByDate,
    deleteRosterRecordsByStaffID,
    getAllRosterRecords,
    getRosterRecordByDateAndStaffID,
    getRosterRecordsByDate,
    getRosterRecordsByStaffID,
    updateRosterRecordByDateAndStaffID
} from "@data:rosters";

import { validateRosterRecord, type RosterRecord } from "@model:rosters";

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

    const rostersResult: Result<Array<RosterRecord>>   = await getAllRosterRecords(d.sql);
    const rosters     : Nullable<Array<RosterRecord>> = rostersResult.getData();

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

    const rostersResult: Result<Array<RosterRecord>>   = await getRosterRecordsByDate(d.sql, date);
    const rosters     : Nullable<Array<RosterRecord>> = rostersResult.getData();

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

    const rosterResult: Result<RosterRecord>   = await getRosterRecordByDateAndStaffID(d.sql, date, staffID);
    const roster      : Nullable<RosterRecord> = rosterResult.getData();

    if (!rosterResult.isSuccess() || roster === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Roster not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, roster).unwrap(d.set);
}

export async function handleGetAllStaffRostersByID(d: ServiceDependencies): Promise<RFServerResponse> {
    const staffID: Nullable<string> = getStaffIDParam(d);

    if (staffID === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, staffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const rostersResult: Result<Array<RosterRecord>>   = await getRosterRecordsByStaffID(d.sql, staffID);
    const rosters     : Nullable<Array<RosterRecord>> = rostersResult.getData();

    if (!rostersResult.isSuccess() || rosters === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Rosters not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, rosters).unwrap(d.set);
}

export async function handleCreateRoster(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const rosterInfo: RosterRecord = {
        id     : 0, // placeholder; generated by the database.
        date   : d.body?.date    ?? d.params?.date    ?? '',
        staffID: d.body?.staffID ?? d.params?.staffID ?? '',
        shiftID: Number(d.body?.shiftID)
    };

    if (!validateRosterRecord(rosterInfo)) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Invalid roster information.").unwrap(d.set);
    }

    const createResult: Result<number>   = await createRosterRecord(d.sql, rosterInfo);
    const newRosterID: Nullable<number> = createResult.getData();

    if (!createResult.isSuccess() || newRosterID === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to create roster.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.CREATED, newRosterID).unwrap(d.set);
}

export async function handleUpdateStaffRosterOnDateByID(d: ServiceDependencies): Promise<RFServerResponse> {
    const date   : Nullable<string> = getDateParam(d);
    const staffID: Nullable<string> = getStaffIDParam(d);

    if (date === null || staffID === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid date or staff ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const shiftID: number = Number(d.body?.shiftID);

    if (!Number.isInteger(shiftID) || shiftID < 1) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid shift ID.").unwrap(d.set);
    }

    const updateResult: Result<RosterRecord>   = await updateRosterRecordByDateAndStaffID(d.sql, date, staffID, shiftID);
    const roster      : Nullable<RosterRecord> = updateResult.getData();

    if (!updateResult.isSuccess() || roster === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Roster not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, roster).unwrap(d.set);
}

export async function handleDeleteAllRosters(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const deleteResult: Result<null> = await deleteAllRosterRecords(d.sql);

    if (!deleteResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete all rosters.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all rosters.").unwrap(d.set);
}

export async function handleDeleteAllRostersOnDate(d: ServiceDependencies): Promise<RFServerResponse> {
    const date: Nullable<string> = getDateParam(d);

    if (date === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid date.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const deleteResult: Result<null> = await deleteRosterRecordsByDate(d.sql, date);

    if (!deleteResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Rosters not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all rosters on that date.").unwrap(d.set);
}

export async function handleDeleteStaffRosterOnDateByID(d: ServiceDependencies): Promise<RFServerResponse> {
    const date   : Nullable<string> = getDateParam(d);
    const staffID: Nullable<string> = getStaffIDParam(d);

    if (date === null || staffID === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid date or staff ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const deleteResult: Result<null> = await deleteRosterRecordByDateAndStaffID(d.sql, date, staffID);

    if (!deleteResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Roster not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted staff roster.").unwrap(d.set);
}

export async function handleDeleteAllStaffRostersByID(d: ServiceDependencies): Promise<RFServerResponse> {
    const staffID: Nullable<string> = getStaffIDParam(d);

    if (staffID === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const deleteResult: Result<null> = await deleteRosterRecordsByStaffID(d.sql, staffID);

    if (!deleteResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Rosters not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all rosters for staff member.").unwrap(d.set);
}
