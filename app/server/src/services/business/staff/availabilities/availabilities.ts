import { HTTPStatus } from "@lib:enums/http_status";
import { Response, RFServerResponse } from "@lib:templates/response";
import { Result } from "@lib:templates/result";
import { ServiceDependencies } from "@lib:templates/service_deps";
import { isRecord, readString, toRecord } from "@lib:templates/request_values";
import { Nullable } from "@lib:types/nullable";
import { StaffAvailability, validateStaffAvailability } from "@model:staff";
import { validateAccessPermission } from "@service:permission/permission";

import {
    createAvailabilityByDateAndStaffID,
    deleteAllAvailabilities,
    deleteAvailabilityByDateAndStaffID,
    deleteAvailabilitiesByStaffID,
    getAllAvailabilities,
    getAvailabilityByDateAndStaffID,
    getAvailabilitiesByDate,
    getAvailabilitiesByStaffID,
    updateAvailabilityByDateAndStaffID
} from "@data:availabilities";

export async function handleGetAllAvailabilities(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const permissionResult: Result<string> = await validateAccessPermission(
        d.sql,
        d.headers,
        "manager",
        false
    );

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const availabilitiesResult: Result<Array<StaffAvailability>>   = await getAllAvailabilities(d.sql);
    const availabilitiesData  : Nullable<Array<StaffAvailability>> = availabilitiesResult.getData();

    if (!availabilitiesResult.isSuccess() || availabilitiesData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to fetch all availabilities.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, availabilitiesData).unwrap(d.set);
}

export async function handleGetAvailabilitiesByStaffID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const params: Record<string, unknown> = toRecord(d.params);

    const targetStaffID: string = readString(params, "staffID") ?? '';

    if (targetStaffID.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID in URL.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(
        d.sql,
        d.headers,
        "manager",
        true,
        targetStaffID
    );

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const availabilitiesResult: Result<Array<StaffAvailability>>   = await getAvailabilitiesByStaffID(d.sql, targetStaffID);
    const availabilitiesData  : Nullable<Array<StaffAvailability>> = availabilitiesResult.getData();

    if (!availabilitiesResult.isSuccess() || availabilitiesData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to fetch staff availabilities.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, availabilitiesData).unwrap(d.set);
}

export async function handleGetAvailabilitiesByDate(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const params: Record<string, unknown> = toRecord(d.params);

    const targetDate: string = readString(params, "date") ?? '';

    if (targetDate.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing availability date.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(
        d.sql,
        d.headers,
        "manager",
        false
    );

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const availabilitiesResult: Result<Array<StaffAvailability>>   = await getAvailabilitiesByDate(d.sql, targetDate);
    const availabilitiesData  : Nullable<Array<StaffAvailability>> = availabilitiesResult.getData();

    if (!availabilitiesResult.isSuccess() || availabilitiesData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to fetch availabilities on date.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, availabilitiesData).unwrap(d.set);
}

export async function handleUpdateAvailability(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const params: Record<string, unknown> = toRecord(d.params);
    const body  : Record<string, unknown> = toRecord(d.body);

    const targetStaffID: string = readString(params, "staffID") ?? readString(body, "staffID") ?? '';
    const targetDate   : string = readString(params, "date") ?? readString(body, "date") ?? '';

    const availabilityData: unknown = {
        ...body,
        staffID: targetStaffID,
        date   : targetDate
    };

    if (!validateStaffAvailability(availabilityData)) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Invalid staff availability information.").unwrap(d.set);
    }

    const availability: StaffAvailability = availabilityData;

    if (targetStaffID.trim() === "" || targetDate.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID or availability date.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(
        d.sql,
        d.headers,
        "manager",
        true,
        targetStaffID
    );

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const updateAvailabilityResult: Result<null> = await updateAvailabilityByDateAndStaffID(
        d.sql,
        targetStaffID,
        targetDate,
        availability
    );

    if (!updateAvailabilityResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Staff availability not found or unable to update it.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully updated staff availability.").unwrap(d.set);
}

export async function handleUpdateAvailabilityByDateAndStaffID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const availabilityData: unknown = toRecord(d.body);

    if (!validateStaffAvailability(availabilityData)) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Invalid staff availability information.").unwrap(d.set);
    }

    const availability: StaffAvailability = availabilityData;

    const permissionResult: Result<string> = await validateAccessPermission(
        d.sql,
        d.headers,
        "manager",
        true,
        availability.staffID
    );

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const updateAvailabilityResult: Result<null> = await updateAvailabilityByDateAndStaffID(
        d.sql,
        availability.staffID,
        availability.date,
        availability
    );

    if (!updateAvailabilityResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to update staff availability.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully updated staff availability.").unwrap(d.set);
}

export async function handleCreateAvailability(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const body  : Record<string, unknown> = toRecord(d.body);
    const params: Record<string, unknown> = toRecord(d.params);

    const nestedAvailability: unknown = body.availability;
    const source: Record<string, unknown> = isRecord(nestedAvailability) ? nestedAvailability : body;

    const availabilityData: unknown = {
        ...source,
        staffID: readString(source, "staffID") || readString(params, "staffID") || '',
        date   : readString(source, "date")    || readString(params, "date")    || ''
    };

    if (!validateStaffAvailability(availabilityData)) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Invalid staff availability information.").unwrap(d.set);
    }

    const availability: StaffAvailability = availabilityData;

    const permissionResult: Result<string> = await validateAccessPermission(
        d.sql,
        d.headers,
        "manager",
        true,
        availability.staffID
    );

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const createAvailabilityResult: Result<null> = await createAvailabilityByDateAndStaffID(
        d.sql,
        availability.staffID,
        availability.date,
        availability
    );

    if (!createAvailabilityResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to create staff availability.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.CREATED, "Successfully created staff availability.").unwrap(d.set);
}

export async function handleDeleteAllAvailabilities(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const deleteAvailabilitiesResult: Result<null> = await deleteAllAvailabilities(d.sql);

    if (!deleteAvailabilitiesResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete all availabilities.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all availabilities.").unwrap(d.set);
}

export async function handleDeleteAvailabilityByDate(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const params: Record<string, unknown> = toRecord(d.params);

    const targetStaffID: string = readString(params, "staffID") ?? '';
    const targetDate   : string = readString(params, "date") ?? '';

    if (targetStaffID.trim() === "" || targetDate.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID or availability date.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(
        d.sql,
        d.headers,
        "manager",
        true,
        targetStaffID
    );

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const deleteAvailabilityResult: Result<null> = await deleteAvailabilityByDateAndStaffID(
        d.sql,
        targetStaffID,
        targetDate
    );

    if (!deleteAvailabilityResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Staff availability not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted staff availability.").unwrap(d.set);
}

export async function handleGetAvailabilityByDateAndStaffID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const params: Record<string, unknown> = toRecord(d.params);

    const targetStaffID: string = readString(params, "staffID") ?? '';
    const targetDate   : string = readString(params, "date") ?? '';

    if (targetStaffID.trim() === "" || targetDate.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID or availability date.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(
        d.sql,
        d.headers,
        "manager",
        true,
        targetStaffID
    );

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const availabilityResult: Result<StaffAvailability>   = await getAvailabilityByDateAndStaffID(d.sql, targetStaffID, targetDate);
    const availability      : Nullable<StaffAvailability> = availabilityResult.getData();

    if (!availabilityResult.isSuccess() || availability === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Staff availability not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, availability).unwrap(d.set);
}

export async function handleDeleteAvailabilityByStaffID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const params: Record<string, unknown> = toRecord(d.params);
    const body  : Record<string, unknown> = toRecord(d.body);

    const targetStaffID: string = readString(params, "staffID") ?? readString(body, "staffID") ?? '';

    if (targetStaffID.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(
        d.sql,
        d.headers,
        "manager",
        true,
        targetStaffID
    );

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const deleteResult: Result<null> = await deleteAvailabilitiesByStaffID(d.sql, targetStaffID);

    if (!deleteResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Staff availability not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all availabilities for staff member.").unwrap(d.set);
}

export async function handleDeleteAvailabilityByDateAndStaffID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const params: Record<string, unknown> = toRecord(d.params);
    const body  : Record<string, unknown> = toRecord(d.body);

    const targetStaffID: string = readString(params, "staffID") ?? readString(body, "staffID") ?? '';
    const targetDate   : string = readString(params, "date") ?? readString(body, "date") ?? '';

    if (targetStaffID.trim() === "" || targetDate.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID or availability date.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(
        d.sql,
        d.headers,
        "manager",
        true,
        targetStaffID
    );

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const deleteResult: Result<null> = await deleteAvailabilityByDateAndStaffID(d.sql, targetStaffID, targetDate);

    if (!deleteResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Staff availability not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted staff availability.").unwrap(d.set);
}