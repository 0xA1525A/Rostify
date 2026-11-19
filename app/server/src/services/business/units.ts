import      { HTTPStatus } from "@lib:enums/http_status";
import type { Nullable }   from "@lib:types/nullable";
import type { Result }     from "@lib:templates/result";
import type { ServiceDependencies }             from "@lib:templates/service_deps";
import      { Response, type RFServerResponse } from "@lib:templates/response";

import {
    createUnit,
    deleteAllUnits,
    deleteUnitByUnitID,
    getAllUnits,
    getUnitByID,
    searchUnitsByUnitName,
    updateUnitByUnitID
} from "@data:units";

import { validateAccessPermission } from "@service:permission/permission";

import { type Unit, validateUnit } from "@model:units";

export async function handleGetAllUnits(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const getAllUnitsResult: Result<Array<Unit>>   = await getAllUnits(d.sql);
    const allUnits         : Nullable<Array<Unit>> = getAllUnitsResult.getData();

    if (!getAllUnitsResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "There's nothing to see.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, allUnits).unwrap(d.set);
}

export async function handleGetUnitByUnitID(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const unitID: string = d.params.unitID ?? '';

    if (Number.isNaN(Number.parseInt(unitID))) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing unit ID.").unwrap(d.set);
    }

    const getUnitResult: Result<Unit>   = await getUnitByID(d.sql, Number.parseInt(unitID));
    const unit         : Nullable<Unit> = getUnitResult.getData();

    if (!getUnitResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "There's nothing here").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, unit).unwrap(d.set);
}

export async function handleSearchUnitsByName(d: ServiceDependencies): Promise<RFServerResponse>
{
     const unitName: string = d.params.unitName ?? '';

    if (!unitName.trim()) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing unit name.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    type R = Array<Unit>;

    const searchUnitsResult: Result<R>   = await searchUnitsByUnitName(d.sql, `%${ unitName }%`);
    const searchUnits      : Nullable<R> = searchUnitsResult.getData();

    if (!searchUnitsResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "There's nothing here.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, searchUnits).unwrap(d.set);
}

export async function handleCreateUnit(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const unitInfo: Unit = {
        id         : 0, // placeholder.
        name       : d.body.name        ?? '',
        description: d.body.description ?? '',
        workingArea: d.body.workingArea ?? ''
    }

    const validateUnitInfo: boolean = validateUnit(unitInfo);

    if (!validateUnitInfo) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Malformed unit info.").unwrap(d.set);
    }

    const createUnitResult: Result<number>   = await createUnit(d.sql, unitInfo)
    const newUnitID       : Nullable<number> = createUnitResult.getData();

    if (!createUnitResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to create unit.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.CREATED, newUnitID).unwrap(d.set);
}

export async function handleUpdateUnitByUnitID(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const targetUnitID: string = d.params.unitID ?? '';

    if (Number.isNaN(Number.parseInt(targetUnitID))) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing parameter: Unit ID.").unwrap(d.set);
    }

    const getCurrentUnitResult: Result<Unit>   = await getUnitByID(d.sql, Number.parseInt(targetUnitID));
    const oldUnit             : Nullable<Unit> = getCurrentUnitResult.getData();

    if (!getCurrentUnitResult.isSuccess() || oldUnit === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Unit not found.").unwrap(d.set);
    }

    const newUnit: Unit = {
        id          : Number.parseInt(targetUnitID),
        name        : d.body.name        ?? oldUnit.name,
        description : d.body.description ?? oldUnit.description,
        workingArea : d.body.workingArea ?? oldUnit.workingArea
    }

    const validateUnitInfo: boolean = validateUnit(newUnit);

    if (!validateUnitInfo) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Malformed unit info.").unwrap(d.set);
    }

    const updateUnitResult: Result<Unit>   = await updateUnitByUnitID(d.sql, Number.parseInt(targetUnitID), newUnit);
    const updatedUnit     : Nullable<Unit> = updateUnitResult.getData();

    if (!updateUnitResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to update unit.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, updatedUnit).unwrap(d.set);
}

export async function handleDeleteAllUnits(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const deleteAllUnitsResult: Result<null> = await deleteAllUnits(d.sql);

    if (!deleteAllUnitsResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete all units.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all units.").unwrap(d.set);
}

export async function handleDeleteUnitByUnitID(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const targetUnitID: string = d.params.unitID ?? '';

    if (Number.isNaN(Number.parseInt(targetUnitID))) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing parameter: Unit ID.").unwrap(d.set);
    }

    const deleteUnitResult: Result<string> = await deleteUnitByUnitID(d.sql, Number.parseInt(targetUnitID));
    const deletedUnitName : Nullable<string> = deleteUnitResult.getData();

    if (!deleteUnitResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete this unit.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, `Successfully deleted unit ${ deletedUnitName }.`).unwrap(d.set);
}