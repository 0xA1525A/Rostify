import { HTTPStatus } from "@lib:enums/http_status";
import type { Result } from "@lib:templates/result";
import type { Nullable } from "@lib:types/nullable";
import type { ServiceDependencies } from "@lib:templates/service_deps";
import { toRecord } from "@lib:templates/request_values";
import { Response, type RFServerResponse } from "@lib:templates/response";

import { validateAccessPermission } from "@service:permission/permission";

import {
    createPositionConflict,
    deleteAllPositionConflicts,
    deletePositionConflictByIDs,
    getAllPositionConflicts,
    getConflictsFromPosition,
    getConflictsToPosition,
    getPositionConflictByIDs,
    updatePositionConflict
} from "@data:position_conflicts";

import {
    type PositionConflict,
    validatePositionConflict
} from "@model:position_conflicts";

function parseID(value: unknown): Nullable<number> {
    const id: number = Number(value);

    return Number.isInteger(id) && id > 0 ? id : null;
}

function readConflictBody(d: ServiceDependencies): Nullable<PositionConflict> {
    const body     : Record<string, unknown> = toRecord(d.body);
    const candidate: unknown                 = {
        positionAID       : parseID(body.positionAID),
        positionBID       : parseID(body.positionBID),
        conflictDurationHr: Number(body.conflictDurationHr),
        severity          : Number(body.severity)
    };

    return validatePositionConflict(candidate) ? candidate : null;
}

async function requireManager(d: ServiceDependencies): Promise<boolean> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    return permissionResult.isSuccess();
}

export async function handleGetAllPositionConflicts(d: ServiceDependencies): Promise<RFServerResponse> {
    if (!await requireManager(d)) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const conflictsResult: Result<Array<PositionConflict>>   = await getAllPositionConflicts(d.sql);
    const conflicts      : Nullable<Array<PositionConflict>> = conflictsResult.getData();

    if (!conflictsResult.isSuccess() || conflicts === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "No position conflicts found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, conflicts).unwrap(d.set);
}

export async function handleGetPositionConflictByIDs(d: ServiceDependencies): Promise<RFServerResponse> {
    const params     : Record<string, unknown> = toRecord(d.params);
    const positionAID: Nullable<number>        = parseID(params.positionAID);
    const positionBID: Nullable<number>        = parseID(params.positionBID);

    if (positionAID === null || positionBID === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid position IDs.").unwrap(d.set);
    }

    if (!await requireManager(d)) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const conflictResult: Result<PositionConflict>   = await getPositionConflictByIDs(d.sql, positionAID, positionBID);
    const conflict      : Nullable<PositionConflict> = conflictResult.getData();

    if (!conflictResult.isSuccess() || conflict === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Position conflict not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, conflict).unwrap(d.set);
}

export async function handleGetConflictsFromPosition(d: ServiceDependencies): Promise<RFServerResponse> {
    const params     : Record<string, unknown> = toRecord(d.params);
    const positionAID: Nullable<number>        = parseID(params.positionAID);

    if (positionAID === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid position ID.").unwrap(d.set);
    }

    if (!await requireManager(d)) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const conflictsResult: Result<Array<PositionConflict>>   = await getConflictsFromPosition(d.sql, positionAID);
    const conflicts      : Nullable<Array<PositionConflict>> = conflictsResult.getData();

    if (!conflictsResult.isSuccess() || conflicts === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "No conflicts found from that position.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, conflicts).unwrap(d.set);
}

export async function handleGetConflictsToPosition(d: ServiceDependencies): Promise<RFServerResponse> {
    const params     : Record<string, unknown> = toRecord(d.params);
    const positionBID: Nullable<number>        = parseID(params.positionBID);

    if (positionBID === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid position ID.").unwrap(d.set);
    }

    if (!await requireManager(d)) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const conflictsResult: Result<Array<PositionConflict>>   = await getConflictsToPosition(d.sql, positionBID);
    const conflicts      : Nullable<Array<PositionConflict>> = conflictsResult.getData();

    if (!conflictsResult.isSuccess() || conflicts === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "No conflicts found to that position.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, conflicts).unwrap(d.set);
}

export async function handleCreatePositionConflict(d: ServiceDependencies): Promise<RFServerResponse> {
    if (!await requireManager(d)) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const conflict: Nullable<PositionConflict> = readConflictBody(d);

    if (conflict === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Invalid position conflict information.").unwrap(d.set);
    }

    if (conflict.positionAID === conflict.positionBID) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "A position cannot conflict with itself.").unwrap(d.set);
    }

    const createResult: Result<null> = await createPositionConflict(d.sql, conflict);

    if (!createResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to create position conflict.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.CREATED, conflict).unwrap(d.set);
}

export async function handleUpdatePositionConflict(d: ServiceDependencies): Promise<RFServerResponse> {
    const params     : Record<string, unknown> = toRecord(d.params);
    const body       : Record<string, unknown> = toRecord(d.body);
    const positionAID: Nullable<number>        = parseID(params.positionAID);
    const positionBID: Nullable<number>        = parseID(params.positionBID);

    if (positionAID === null || positionBID === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid position IDs.").unwrap(d.set);
    }

    if (!await requireManager(d)) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const oldResult: Result<PositionConflict>   = await getPositionConflictByIDs(d.sql, positionAID, positionBID);
    const oldConflict: Nullable<PositionConflict> = oldResult.getData();

    if (!oldResult.isSuccess() || oldConflict === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Position conflict not found.").unwrap(d.set);
    }

    const newConflict: PositionConflict = {
        positionAID       : positionAID,
        positionBID       : positionBID,
        conflictDurationHr: Number(body.conflictDurationHr ?? oldConflict.conflictDurationHr),
        severity          : Number(body.severity ?? oldConflict.severity)
    };

    if (validatePositionConflict(newConflict) === false) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Invalid position conflict information.").unwrap(d.set);
    }

    const updateResult: Result<PositionConflict>   = await updatePositionConflict(d.sql, newConflict);
    const updated     : Nullable<PositionConflict> = updateResult.getData();

    if (!updateResult.isSuccess() || updated === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to update position conflict.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, updated).unwrap(d.set);
}

export async function handleDeleteAllPositionConflicts(d: ServiceDependencies): Promise<RFServerResponse> {
    if (!await requireManager(d)) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const deleteResult: Result<null> = await deleteAllPositionConflicts(d.sql);

    if (!deleteResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete all position conflicts.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all position conflicts.").unwrap(d.set);
}

export async function handleDeletePositionConflictByIDs(d: ServiceDependencies): Promise<RFServerResponse> {
    const params     : Record<string, unknown> = toRecord(d.params);
    const positionAID: Nullable<number>        = parseID(params.positionAID);
    const positionBID: Nullable<number>        = parseID(params.positionBID);

    if (positionAID === null || positionBID === null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing or invalid position IDs.").unwrap(d.set);
    }

    if (!await requireManager(d)) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const deleteResult: Result<null> = await deletePositionConflictByIDs(d.sql, positionAID, positionBID);

    if (!deleteResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Position conflict not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted position conflict.").unwrap(d.set);
}
