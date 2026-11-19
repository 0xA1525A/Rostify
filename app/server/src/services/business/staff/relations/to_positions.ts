import { HTTPStatus } from "@lib:enums/http_status";
import { Response, RFServerResponse } from "@lib:templates/response";
import { Result } from "@lib:templates/result";
import { ServiceDependencies } from "@lib:templates/service_deps";
import { Nullable } from "@lib:types/nullable";
import { validateAccessPermission } from "@service:permission/permission";

import {
    deleteAllStaffRelationsToAllPositions,
    deleteAllStaffRelationsToPositionByPositionID,
    deleteStaffRelationToAllPositionsByStaffID,
    getAllStaffRelationsToAllPositions,
    getStaffRelationsToAllPositionsByStaffID,
    setStaffRelationToPositionByPositionID,
    unsetStaffRelationToPositionByPositionID
} from "@data:relations";

export async function handleGetAllStaffRelationsToAllPositions(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const relationsResult    : Result<Array<unknown>>   = await getAllStaffRelationsToAllPositions(d.sql);
    const relationsResultData: Nullable<Array<unknown>> = relationsResult.getData();

    if (!relationsResult.isSuccess() || relationsResultData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to fetch staff position relations.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, relationsResultData).unwrap(d.set);
}

export async function handleGetStaffRelationsToAllPositionsByStaffID(
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

    const relationsResult    : Result<Array<unknown>>   = await getStaffRelationsToAllPositionsByStaffID(d.sql, targetStaffID);
    const relationsResultData: Nullable<Array<unknown>> = relationsResult.getData();

    if (!relationsResult.isSuccess() || relationsResultData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to fetch staff position relations.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, relationsResultData).unwrap(d.set);
}

export async function handleDeleteStaffRelationToAllPositionsByStaffID(
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

    const deleteRelationsResult: Result<null> = await deleteStaffRelationToAllPositionsByStaffID(d.sql, targetStaffID);

    if (!deleteRelationsResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete staff position relations.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all staff position relations.").unwrap(d.set);
}

export async function handleDeleteAllStaffRelationsToAllPositions(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const deleteRelationsResult: Result<null> = await deleteAllStaffRelationsToAllPositions(d.sql);

    if (!deleteRelationsResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete all staff position relations.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all staff position relations.").unwrap(d.set);
}

export async function handleDeleteAllStaffRelationsToPositionByPositionID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const positionID: number = Number(d.params?.positionID);

    if (!Number.isInteger(positionID) || positionID < 1) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid position ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const deleteRelationsResult: Result<null> = await deleteAllStaffRelationsToPositionByPositionID(d.sql, positionID);

    if (!deleteRelationsResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete staff position relations.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all relations to the selected position.").unwrap(d.set);
}

export async function handleSetStaffRelationToPositionByStaffID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const targetStaffID: string = d.params?.staffID ?? '';
    const positionID   : number = Number(d.params?.positionID ?? d.body?.positionID);
    const preference   : number = d.body?.preference;
    const proficiency  : number = d.body?.proficiency;

    if (targetStaffID.trim() === "" || !Number.isInteger(positionID) || positionID < 1) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid staff ID or position ID.").unwrap(d.set);
    }

    if (
        !Number.isInteger(preference)  || preference < 0 || preference > 5 ||
        !Number.isInteger(proficiency) || proficiency < 0 || proficiency > 5
    ) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Invalid position preference or proficiency.").unwrap(d.set);
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

    const setRelationResult: Result<null> = await setStaffRelationToPositionByPositionID(
        d.sql,
        targetStaffID,
        positionID,
        preference,
        proficiency
    );

    if (!setRelationResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to set staff position relation.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully set staff position relation.").unwrap(d.set);
}

export const handleSetStaffRelationToPosition = handleSetStaffRelationToPositionByStaffID;

export async function handleUnsetStaffRelationToPositionByPositionID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const targetStaffID: string = d.params?.staffID ?? '';
    const positionID   : number = Number(d.params?.positionID);

    if (targetStaffID.trim() === "" || !Number.isInteger(positionID) || positionID < 1) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid staff ID or position ID.").unwrap(d.set);
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

    const unsetRelationResult: Result<null> = await unsetStaffRelationToPositionByPositionID(
        d.sql,
        targetStaffID,
        positionID
    );

    if (!unsetRelationResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Staff position relation not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully removed staff position relation.").unwrap(d.set);
}