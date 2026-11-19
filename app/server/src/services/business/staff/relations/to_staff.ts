import      { HTTPStatus } from "@lib:enums/http_status";
import      { Response, type RFServerResponse } from "@lib:templates/response";
import      { Result } from "@lib:templates/result";
import type { ServiceDependencies } from "@lib:templates/service_deps";
import type { Nullable }   from "@lib:types/nullable";

import { validateAccessPermission } from "@service:permission/permission";

import {
    deleteAllStaffRelationsToAllStaff,
    deleteAllStaffRelationsToStaffByStaffID,
    deleteStaffRelationToAllStaffByStaffID,
    getAllStaffRelationsToAllStaff,
    getStaffRelationsToAllStaffByStaffID,
    setStaffRelationToStaffByStaffID,
    unsetStaffRelationToStaffByStaffID
} from "@data:relations";

export async function handleGetAllStaffRelationsToAllStaff(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const relationsResult    : Result<Array<unknown>>   = await getAllStaffRelationsToAllStaff(d.sql);
    const relationsResultData: Nullable<Array<unknown>> = relationsResult.getData();

    if (!relationsResult.isSuccess() || relationsResultData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to fetch staff relations.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, relationsResultData).unwrap(d.set);
}

export async function handleGetStaffRelationsToAllStaffByStaffID(
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

    const relationsResult    : Result<Array<unknown>>   = await getStaffRelationsToAllStaffByStaffID(d.sql, targetStaffID);
    const relationsResultData: Nullable<Array<unknown>> = relationsResult.getData();

    if (!relationsResult.isSuccess() || relationsResultData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to fetch staff relations.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, relationsResultData).unwrap(d.set);
}

export async function handleDeleteStaffRelationToAllStaffByStaffID(
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

    const deleteRelationsResult: Result<null> = await deleteStaffRelationToAllStaffByStaffID(d.sql, targetStaffID);

    if (!deleteRelationsResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete staff relations.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all staff relations for staff member.").unwrap(d.set);
}

export async function handleDeleteAllStaffRelationsToStaffByStaffID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const relatedStaffID: string = d.params?.staffID ?? '';

    if (relatedStaffID.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const deleteRelationsResult: Result<null> = await deleteAllStaffRelationsToStaffByStaffID(d.sql, relatedStaffID);

    if (!deleteRelationsResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete staff relations.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all relations to the selected staff member.").unwrap(d.set);
}

export async function handleSetStaffRelationToStaff(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const targetStaffID : string = d.params?.staffID ?? '';
    const relatedStaffID: string = d.params?.relatedStaffID ?? d.body?.relatedStaffID ?? d.body?.staffID ?? '';
    const preference    : number = d.body?.preference;

    if (targetStaffID.trim() === "" || relatedStaffID.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID or related staff ID.").unwrap(d.set);
    }

    if (targetStaffID === relatedStaffID) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "A staff member cannot have a relation with themselves.").unwrap(d.set);
    }

    if (!Number.isInteger(preference) || preference < 0 || preference > 5) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Invalid staff relation preference.").unwrap(d.set);
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

    const setRelationResult: Result<null> = await setStaffRelationToStaffByStaffID(
        d.sql,
        targetStaffID,
        relatedStaffID,
        preference
    );

    if (!setRelationResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to set staff relation.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully set staff relation.").unwrap(d.set);
}

export async function handleUnsetStaffRelationToStaffByStaffID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const targetStaffID : string = d.params?.staffID ?? '';
    const relatedStaffID: string = d.params?.relatedStaffID ?? d.body?.relatedStaffID ?? '';

    if (targetStaffID.trim() === "" || relatedStaffID.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID or related staff ID.").unwrap(d.set);
    }

    if (targetStaffID === relatedStaffID) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "A staff member cannot have a relation with themselves.").unwrap(d.set);
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

    const unsetRelationResult: Result<null> = await unsetStaffRelationToStaffByStaffID(
        d.sql,
        targetStaffID,
        relatedStaffID
    );

    if (!unsetRelationResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Staff relation not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully removed staff relation.").unwrap(d.set);
}

export async function handleDeleteAllStaffRelationsToAllStaff(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const deleteRelationsResult: Result<null> = await deleteAllStaffRelationsToAllStaff(d.sql);

    if (!deleteRelationsResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete all staff relations.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all staff-to-staff relations.").unwrap(d.set);
}