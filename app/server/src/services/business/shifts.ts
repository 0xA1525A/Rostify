import      { HTTPStatus } from "@lib:enums/http_status";
import type { Nullable }   from "@lib:types/nullable";
import type { Result }     from "@lib:templates/result";
import type { ServiceDependencies }             from "@lib:templates/service_deps";
import      { Response, type RFServerResponse } from "@lib:templates/response";

import {
    readBoolean,
    readString,
    toRecord
} from "@lib:templates/request_values";

import {
    createShift,
    deleteAllShifts,
    deleteShiftByShiftID,
    getAllShifts,
    getShiftByShiftID,
    searchShiftsByShiftName,
    updateShiftByShiftID
} from "@data:shifts";

import { validateAccessPermission } from "@service:permission/permission";

import { type Shift, validateShift } from "@model:shifts";

export async function handleGetAllShifts(d: ServiceDependencies
): Promise<RFServerResponse>{
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const getAllShiftsResult: Result<Array<Shift>>   = await getAllShifts(d.sql);
    const allShifts         : Nullable<Array<Shift>> = getAllShiftsResult.getData();

    if (!getAllShiftsResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "There's nothing to see.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, allShifts).unwrap(d.set);
}

export async function handleGetShiftByID(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const params : Record<string, unknown> = toRecord(d.params);
    const shiftID: string                  = readString(params, "shiftID") ?? '';

    if (Number.isNaN(Number.parseInt(shiftID))) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing shift ID.").unwrap(d.set);
    }

    const getShiftResult: Result<Shift>   = await getShiftByShiftID(d.sql, Number.parseInt(shiftID));
    const shift         : Nullable<Shift> = getShiftResult.getData();

    if (!getShiftResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "There's nothing here").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, shift).unwrap(d.set);
}

export async function handleSearchShiftsByName(d: ServiceDependencies): Promise<RFServerResponse> {
     const params   : Record<string, unknown> = toRecord(d.params);
     const shiftName: string                  = readString(params, "shiftName") ?? '';

    if (!shiftName.trim()) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing shift name.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    type R = Array<Shift>;

    const searchShiftsResult: Result<R>   = await searchShiftsByShiftName(d.sql, `%${ shiftName }%`);
    const searchShifts      : Nullable<R> = searchShiftsResult.getData();

    if (!searchShiftsResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "There's nothing here.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, searchShifts).unwrap(d.set);
}

export async function handleCreateShift(d: ServiceDependencies): Promise<RFServerResponse> {
    const body: Record<string, unknown> = toRecord(d.body);

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const shiftInfo: unknown = {
        id         : 0,
        day        : readString(body, "day") ?? '',
        isHoliday  : readBoolean(body, "isHoliday") ?? '',
        name       : readString(body, "name") ?? '',
        description: readString(body, "description") ?? '',
        fromTime   : readString(body, "fromTime") ?? '',
        toTime     : readString(body, "toTime") ?? '',
        isOvernight: readBoolean(body, "isOvernight") ?? false
    }

    if (!validateShift(shiftInfo)) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Malformed shift info.").unwrap(d.set);
    }

    const createShiftResult: Result<number>   = await createShift(d.sql, shiftInfo)
    const newShiftID       : Nullable<number> = createShiftResult.getData();

    if (!createShiftResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to create shift.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.CREATED, newShiftID).unwrap(d.set);
}

export async function handleUpdateShiftByShiftID(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const params       : Record<string, unknown> = toRecord(d.params);
    const body         : Record<string, unknown> = toRecord(d.body);
    const targetShiftID: string                  = readString(params, "shiftID") ?? '';

    if (Number.isNaN(Number.parseInt(targetShiftID))) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing parameter: Shift ID.").unwrap(d.set);
    }

    const getCurrentShiftResult: Result<Shift>   = await getShiftByShiftID(d.sql, Number.parseInt(targetShiftID));
    const oldShift             : Nullable<Shift> = getCurrentShiftResult.getData();

    if (!getCurrentShiftResult.isSuccess() || oldShift === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Shift not found.").unwrap(d.set);
    }

    const newShift: unknown = {
        id         : 0,
        day        : readString(body, "day") ?? oldShift.day,
        isHoliday  : readBoolean(body, "isHoliday") ?? oldShift.isHoliday,
        name       : readString(body, "name") ?? oldShift.name,
        description: readString(body, "description") ?? oldShift.description,
        fromTime   : readString(body, "fromTime") ?? oldShift.fromTime,
        toTime     : readString(body, "toTime") ?? oldShift.toTime,
        isOvernight: readBoolean(body, "isOvernight") ?? oldShift.isOvernight
    }

    if (!validateShift(newShift)) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Malformed shift info.").unwrap(d.set);
    }

    const updateShiftResult: Result<Shift>   = await updateShiftByShiftID(d.sql, Number.parseInt(targetShiftID), newShift);
    const updatedShift     : Nullable<Shift> = updateShiftResult.getData();

    if (!updateShiftResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to update shift.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, updatedShift).unwrap(d.set);
}

export async function handleDeleteAllShifts(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const deleteAllShiftsResult: Result<null> = await deleteAllShifts(d.sql);

    if (!deleteAllShiftsResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete all shifts.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all shifts.").unwrap(d.set);
}

export async function handleDeleteShiftByShiftID(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const params       : Record<string, unknown> = toRecord(d.params);
    const targetShiftID: string                  = readString(params, "shiftID") ?? '';

    if (Number.isNaN(Number.parseInt(targetShiftID))) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing parameter: Shift ID.").unwrap(d.set);
    }

    const deleteShiftResult: Result<string> = await deleteShiftByShiftID(d.sql, Number.parseInt(targetShiftID));
    const deletedShiftName : Nullable<string> = deleteShiftResult.getData();

    if (!deleteShiftResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete this shift.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, `Successfully deleted shift ${ deletedShiftName }.`).unwrap(d.set);
}