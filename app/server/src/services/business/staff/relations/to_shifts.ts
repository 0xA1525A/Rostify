import { HTTPStatus } from "@lib:enums/http_status";
import { Response, type RFServerResponse } from "@lib:templates/response";
import { Result } from "@lib:templates/result";
import { ServiceDependencies } from "@lib:templates/service_deps";
import type { Nullable } from "@lib:types/nullable";

import { validateAccessPermission } from "@service:permission/permission";

import {
    deleteAllStaffRelationsToAllShifts,
    deleteAllStaffRelationsToShiftByShiftID,
    deleteStaffRelationToAllShiftsByStaffID,
    getAllStaffRelationsToAllShifts,
    getStaffRelationsToAllShiftsByStaffID,
    setStaffRelationToShiftByShiftID,
    unsetStaffRelationToShiftByShiftID
} from "@data:relations";

export async function handleGetAllStaffRelationsToAllShifts(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const relationsResult    : Result<Array<unknown>>   = await getAllStaffRelationsToAllShifts(d.sql);
    const relationsResultData: Nullable<Array<unknown>> = relationsResult.getData();

    if (!relationsResult.isSuccess() || relationsResultData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to fetch staff shift relations.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, relationsResultData).unwrap(d.set);
}

export async function handleGetStaffRelationsToAllShiftsByStaffID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const targetStaffID: string = d.params?.staffID ?? '';

    if (targetStaffID.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const relationsResult    : Result<Array<unknown>>   = await getStaffRelationsToAllShiftsByStaffID(d.sql, targetStaffID);
    const relationsResultData: Nullable<Array<unknown>> = relationsResult.getData();

    if (!relationsResult.isSuccess() || relationsResultData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to fetch staff shift relations.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, relationsResultData).unwrap(d.set);
}

export async function handleDeleteStaffRelationToAllShiftsByStaffID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const targetStaffID: string = d.params?.staffID ?? '';

    if (targetStaffID.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const deleteRelationsResult: Result<null> = await deleteStaffRelationToAllShiftsByStaffID(d.sql, targetStaffID);

    if (!deleteRelationsResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete staff shift relations.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all staff shift relations.").unwrap(d.set);
}

export async function handleDeleteAllStaffRelationsToShiftByShiftID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const shiftID: number = Number(d.params?.shiftID);

    if (!Number.isInteger(shiftID) || shiftID < 1) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid shift ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const deleteRelationsResult: Result<null> = await deleteAllStaffRelationsToShiftByShiftID(d.sql, shiftID);

    if (!deleteRelationsResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete staff shift relations.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all relations to the selected shift.").unwrap(d.set);
}

export async function handleSetStaffRelationToShift(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const targetStaffID: string = d.params?.staffID ?? '';
    const shiftID      : number = Number(d.params?.shiftID ?? d.body?.shiftID);
    const preference   : number = d.body?.preference;
    const proficiency  : number = d.body?.proficiency;

    if (targetStaffID.trim() === "" || !Number.isInteger(shiftID) || shiftID < 1) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid staff ID or shift ID.").unwrap(d.set);
    }

    if (
        !Number.isInteger(preference)  || preference < 0 || preference > 5 ||
        !Number.isInteger(proficiency) || proficiency < 0 || proficiency > 5
    ) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Invalid shift preference or proficiency.").unwrap(d.set);
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

    const setRelationResult: Result<null> = await setStaffRelationToShiftByShiftID(
        d.sql,
        targetStaffID,
        shiftID,
        preference,
        proficiency
    );

    if (!setRelationResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to set staff shift relation.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully set staff shift relation.").unwrap(d.set);
}

export async function handleUnsetStaffRelationToShiftByShiftID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const targetStaffID: string = d.params?.staffID ?? '';
    const shiftID      : number = Number(d.params?.shiftID);

    if (targetStaffID.trim() === "" || !Number.isInteger(shiftID) || shiftID < 1) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid staff ID or shift ID.").unwrap(d.set);
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

    const unsetRelationResult: Result<null> = await unsetStaffRelationToShiftByShiftID(
        d.sql,
        targetStaffID,
        shiftID
    );

    if (!unsetRelationResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Staff shift relation not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully removed staff shift relation.").unwrap(d.set);
}

export async function handleDeleteAllStaffRelationsToAllShifts(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const deleteRelationsResult: Result<null> = await deleteAllStaffRelationsToAllShifts(d.sql);

    if (!deleteRelationsResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete all staff shift relations.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all staff shift relations.").unwrap(d.set);
}