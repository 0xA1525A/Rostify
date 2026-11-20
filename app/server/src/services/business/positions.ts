import      { HTTPStatus } from "@lib:enums/http_status";
import type { Nullable }   from "@lib:types/nullable";
import type { Result }     from "@lib:templates/result";
import type { ServiceDependencies }             from "@lib:templates/service_deps";
import      { Response, type RFServerResponse } from "@lib:templates/response";

import {
    readBoolean,
    readInteger,
    readNullableInteger,
    readString,
    toRecord
} from "@lib:templates/request_values";

import {
    createPosition,
    deleteAllPositions,
    deletePositionByPositionID,
    getAllPositionPreviews,
    getAllPositionPreviewsInUnitByID,
    getPositionByID,
    searchPositionPreviewsBySimilarNames,
    updatePositionByPositionID
} from "@data:positions";
import { validateAccessPermission } from "@service:permission/permission";
import {
    type Position,
    type PositionPreview,
         validatePosition
} from "@model:positions";

export async function handleGetAllPositionPreviews(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const allPositionsResult: Result<Array<PositionPreview>>   = await getAllPositionPreviews(d.sql);
    const allPreviews       : Nullable<Array<PositionPreview>> = allPositionsResult.getData();

    if (!allPositionsResult.isSuccess() || allPreviews === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "There's nothing here.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, allPreviews).unwrap(d.set);
}

export async function handleGetPositionByPositionID(d: ServiceDependencies): Promise<RFServerResponse> {
    const params    : Record<string, unknown> = toRecord(d.params);
    const positionID: string                  = readString(params, "positionID") ?? '';

    if (Number.isNaN(Number.parseInt(positionID))) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing position ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "staff", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const getPositionResult: Result<PositionPreview>   = await getPositionByID(d.sql, Number.parseInt(positionID));
    const position         : Nullable<PositionPreview> = getPositionResult.getData();

    if (!getPositionResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Position does not exist.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, position).unwrap(d.set);
}

export async function handleGetAllPositionPreviewsInUnitByUnitID(d: ServiceDependencies): Promise<RFServerResponse> {
    const params: Record<string, unknown> = toRecord(d.params);
    const unitID: string                  = readString(params, "unitID") ?? '';

    if (!unitID.trim()) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing unit ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    type R = Array<PositionPreview>

    const allPositionsResult: Result<R>   = await getAllPositionPreviewsInUnitByID(d.sql, Number.parseInt(unitID));
    const allPositions      : Nullable<R> = allPositionsResult.getData();

    if (!allPositionsResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "There's nothing here.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, allPositions).unwrap(d.set);
}

export async function handleSearchPositionPreviewsByName(d: ServiceDependencies): Promise<RFServerResponse> {
    const params      : Record<string, unknown> = toRecord(d.params);
    const positionName: string                  = readString(params, "positionName") ?? '';

    if (!positionName.trim()) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing position name.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    type R = Array<PositionPreview>;

    const positionPreviewsResult: Result<R>   = await searchPositionPreviewsBySimilarNames(d.sql, `%${ positionName }%`);
    const positionPreviews      : Nullable<R> = positionPreviewsResult.getData();

    if (!positionPreviewsResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "There's nothing here.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, positionPreviews).unwrap(d.set);
}

export async function handleCreatePosition(d: ServiceDependencies): Promise<RFServerResponse> {
    const body: Record<string, unknown> = toRecord(d.body);

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const newPosition: unknown = {
        id          : 0,
        unitID      : readString(body, "unitID") ?? '',
        unitName    : readString(body, "unitName") ?? '',
        name        : readString(body, "name") ?? '',
        description : readString(body, "description") ?? '',
        physicalLoad: readInteger(body, "physicalLoad") ?? -1,
        mentalLoad  : readInteger(body, "mentalLoad") ?? -1,
        riskLevel   : readInteger(body, "riskLevel") ?? -1,
        minimumStaff: readInteger(body, "minimumStaff") ?? -1,
        targetStaff : readInteger(body, "targetStaff") ?? -1,
        maximumStaff: readInteger(body, "maximumStaff") ?? -1,
        minimumSumProficiency: readNullableInteger(body, "minimumSumProficiency") ?? null,
        targetSumProficiency : readNullableInteger(body, "targetSumProficiency") ?? null,
        maximumSumProficiency: readNullableInteger(body, "maximumSumProficiency") ?? null,
        isPrioritisingStaffAmount: readBoolean(body, "isPrioritisingStaffAmount") ?? false,
    }

    if (!validatePosition(newPosition)) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Malformed position info.").unwrap(d.set);
    }

    const createPositionResult: Result<number>   = await createPosition(d.sql, newPosition);
    const newPositionID       : Nullable<number> = createPositionResult.getData();

    if (!createPositionResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to create new position.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.CREATED, newPositionID).unwrap(d.set);
}

export async function handleUpdatePositionByPositionID(d: ServiceDependencies): Promise<RFServerResponse> {
    const params    : Record<string, unknown> = toRecord(d.params);
    const body      : Record<string, unknown> = toRecord(d.body);
    const positionID: string                  = readString(params, "positionID") ?? '';

    if (Number.isNaN(Number.parseInt(positionID))) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing position ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const oldPositionResult: Result<Position>   = await getPositionByID(d.sql, Number.parseInt(positionID));
    const oldPosition      : Nullable<Position> = oldPositionResult.getData();

    if (!oldPositionResult.isSuccess() || oldPosition === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Position not found.").unwrap(d.set);
    }

    const newPosition: unknown = {
        id          : Number.parseInt(positionID),
        unitName    : readString(body, "unitName") ?? oldPosition.unitName,
        unitID      : readString(body, "unitID") ?? oldPosition.unitID,
        name        : readString(body, "name") ?? oldPosition.name,
        description : readString(body, "description") ?? oldPosition.description,
        physicalLoad: readInteger(body, "physicalLoad") ?? oldPosition.physicalLoad,
        mentalLoad  : readInteger(body, "mentalLoad") ?? oldPosition.mentalLoad,
        riskLevel   : readInteger(body, "riskLevel") ?? oldPosition.riskLevel,
        minimumStaff: readInteger(body, "minimumStaff") ?? oldPosition.minimumStaff,
        targetStaff : readInteger(body, "targetStaff") ?? oldPosition.targetStaff,
        maximumStaff: readInteger(body, "maximumStaff") ?? oldPosition.maximumStaff,
        minimumSumProficiency: readNullableInteger(body, "minimumSumProficiency") ?? oldPosition.minimumSumProficiency,
        targetSumProficiency : readNullableInteger(body, "targetSumProficiency") ?? oldPosition.targetSumProficiency,
        maximumSumProficiency: readNullableInteger(body, "maximumSumProficiency") ?? oldPosition.maximumSumProficiency,
        isPrioritisingStaffAmount: readBoolean(body, "isPrioritisingStaffAmount") ?? oldPosition.isPrioritisingStaffAmount,
    }

    if (!validatePosition(newPosition)) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Malformed position info.").unwrap(d.set);
    }

    const updatePositionResult: Result<Position>   = await updatePositionByPositionID(d.sql, Number.parseInt(positionID), newPosition);
    const updatedPosition     : Nullable<Position> = updatePositionResult.getData();

    if (!updatePositionResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to update position info.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, updatedPosition).unwrap(d.set);
}

export async function handleDeleteAllPositions(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const deleteAllPositionResult: Result<null> = await deleteAllPositions(d.sql);

    if (!deleteAllPositionResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete all positions.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all positions.").unwrap(d.set);
}

export async function handleDeletePositionByPositionID(d: ServiceDependencies): Promise<RFServerResponse> {
    const params    : Record<string, unknown> = toRecord(d.params);
    const positionID: string                  = readString(params, "positionID") ?? '';

    if (Number.isNaN(Number.parseInt(positionID))) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing position ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const deletePositionResult : Result<string> = await deletePositionByPositionID(d.sql, Number.parseInt(positionID));
    const deletedPositionName: Nullable<string> = deletePositionResult.getData();

    if (!deletePositionResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete position.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, deletedPositionName).unwrap(d.set);
}