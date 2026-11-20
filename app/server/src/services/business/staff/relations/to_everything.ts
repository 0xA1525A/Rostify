import { HTTPStatus } from "@lib:enums/http_status";
import { Response, RFServerResponse } from "@lib:templates/response";
import { Result } from "@lib:templates/result";
import { ServiceDependencies } from "@lib:templates/service_deps";
import { readString, toRecord } from "@lib:templates/request_values";
import { validateAccessPermission } from "@service:permission/permission";

import {
    deleteAllStaffRelationsToEverything,
    deleteStaffRelationToEverythingByStaffID,
    getAllStaffRelationsToAllPositions,
    getAllStaffRelationsToAllShifts,
    getAllStaffRelationsToAllStaff,
    getStaffRelationsToAllPositionsByStaffID,
    getStaffRelationsToAllShiftsByStaffID,
    getStaffRelationsToAllStaffByStaffID
} from "@data:relations";

export async function handleDeleteStaffRelationToEverythingByStaffID(d: ServiceDependencies): Promise<RFServerResponse> {
    const params: Record<string, unknown> = toRecord(d.params);

    const targetStaffID: string = readString(params, "staffID") ?? '';

    if (targetStaffID.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const deleteRelationsResult: Result<null> = await deleteStaffRelationToEverythingByStaffID(d.sql, targetStaffID);

    if (!deleteRelationsResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete staff relations.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all relations for staff member.").unwrap(d.set);
}

export async function handleDeleteAllStaffRelationsToEverything(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const deleteRelationsResult: Result<null> = await deleteAllStaffRelationsToEverything(d.sql);

    if (!deleteRelationsResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete all staff relations.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all staff relations.").unwrap(d.set);
}

type R = {
    staff    : unknown[],
    shifts   : unknown[],
    positions: unknown[]
};

export async function handleGetAllStaffRelationsToEverything(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const staffResult     = await getAllStaffRelationsToAllStaff(d.sql);
    const shiftsResult    = await getAllStaffRelationsToAllShifts(d.sql);
    const positionsResult = await getAllStaffRelationsToAllPositions(d.sql);

    if (!staffResult.isSuccess() || !shiftsResult.isSuccess() || !positionsResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to fetch staff relations.").unwrap(d.set);
    }

    const relations: R = {
        staff    : staffResult.getData()    ?? [],
        shifts   : shiftsResult.getData()   ?? [],
        positions: positionsResult.getData() ?? []
    };

    return new Response(true, HTTPStatus.OK, relations).unwrap(d.set);
}

export async function handleGetStaffRelationToEverythingByStaffID(d: ServiceDependencies): Promise<RFServerResponse> {
    const params: Record<string, unknown> = toRecord(d.params);

    const targetStaffID: string = readString(params, "staffID") ?? '';

    if (targetStaffID.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const staffResult     = await getStaffRelationsToAllStaffByStaffID(d.sql, targetStaffID);
    const shiftsResult    = await getStaffRelationsToAllShiftsByStaffID(d.sql, targetStaffID);
    const positionsResult = await getStaffRelationsToAllPositionsByStaffID(d.sql, targetStaffID);

    const relations: R = {
        staff    : staffResult.getData()    ?? [],
        shifts   : shiftsResult.getData()   ?? [],
        positions: positionsResult.getData() ?? []
    };

    return new Response(true, HTTPStatus.OK, relations).unwrap(d.set);
}