import { HTTPStatus } from "@lib:enums/http_status";
import { Response, RFServerResponse } from "@lib:templates/response";
import { Result } from "@lib:templates/result";
import { ServiceDependencies } from "@lib:templates/service_deps";
import { Nullable } from "@lib:types/nullable";
import { validateAccessPermission } from "@service:permission/permission";

import type { StaffTel } from "@model:staff";

import {
    addTelByStaffID,
    deleteAllTels,
    deleteTelByTel,
    getAllTels,
    getTelsByStaffID,
    updateTelByTelAndStaffID
} from "@data:staff";

export async function handleGetAllTels(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const telsResult    : Result<Array<unknown>>   = await getAllTels(d.sql);
    const telsResultData: Nullable<Array<unknown>> = telsResult.getData();

    if (!telsResult.isSuccess() || telsResultData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to fetch all telephone numbers.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, telsResultData).unwrap(d.set);
}

export async function handleDeleteAllTels(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const deleteTelsResult: Result<null> = await deleteAllTels(d.sql);

    if (!deleteTelsResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete all telephone numbers.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all telephone numbers.").unwrap(d.set);
}

export async function handleUpdateTelByTelAndStaffID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const targetStaffID: string = d.params?.staffID ?? d.body?.staffID ?? '';
    const oldTel       : string = d.params?.tel ?? d.body?.oldTel ?? '';
    const newTel       : string = d.body?.newTel ?? d.body?.tel ?? '';

    if (targetStaffID.trim() === "" || oldTel.trim() === "" || newTel.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID or telephone number.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const updateTelResult: Result<number>   = await updateTelByTelAndStaffID(d.sql, targetStaffID, oldTel, newTel);
    const updateTelData  : Nullable<number> = updateTelResult.getData();

    if (!updateTelResult.isSuccess() || updateTelData === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Telephone number not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully updated telephone number.").unwrap(d.set);
}

export async function handleDeleteTelByTelAndStaffID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const targetStaffID: string = d.params?.staffID ?? d.body?.staffID ?? '';
    const tel          : string = d.params?.tel ?? d.body?.tel ?? '';

    if (targetStaffID.trim() === "" || tel.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID or telephone number.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const deleteTelResult: Result<null> = await deleteTelByTel(d.sql, targetStaffID, tel);

    if (!deleteTelResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Telephone number not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted telephone number.").unwrap(d.set);
}

export async function handleGetTelsByStaffID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const targetStaffID: string = d.params?.staffID ?? '';

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

    const telsResult: Result<Array<StaffTel>>   = await getTelsByStaffID(d.sql, targetStaffID);
    const telsData  : Nullable<Array<StaffTel>> = telsResult.getData();

    if (!telsResult.isSuccess() || telsData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to fetch staff telephone numbers.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, telsData).unwrap(d.set);
}

export async function handleAddTel(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    const targetStaffID: string = d.params?.staffID ?? d.body?.staffID ?? '';
    const tel: string = d.body?.tel ?? '';

    if (targetStaffID.trim() === "" || tel.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID or telephone number.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const addTelResult: Result<number> = await addTelByStaffID(d.sql, targetStaffID, tel);
    const addTelData: Nullable<number> = addTelResult.getData();

    if (!addTelResult.isSuccess() || addTelData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to add telephone number.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.CREATED, addTelData).unwrap(d.set);
}

export async function handleUpdateTel(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    const targetStaffID: string = d.params?.staffID ?? d.body?.staffID ?? '';
    const tel: string = d.params?.tel ?? d.body?.oldTel ?? '';
    const newTel: string = d.body?.newTel ?? d.body?.tel ?? '';

    if (targetStaffID.trim() === "" || tel.trim() === "" || newTel.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID or telephone number.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const updateTelResult: Result<number> = await updateTelByTelAndStaffID(d.sql, targetStaffID, tel, newTel);

    if (!updateTelResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Telephone number not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully updated telephone number.").unwrap(d.set);
}

export async function handleDeleteTelByID(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    const targetStaffID: string = d.params?.staffID ?? d.body?.staffID ?? '';
    const tel: string = d.params?.tel ?? d.body?.tel ?? '';

    if (targetStaffID.trim() === "" || tel.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID or telephone number.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const deleteTelResult: Result<null> = await deleteTelByTel(d.sql, targetStaffID, tel);

    if (!deleteTelResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Telephone number not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted telephone number.").unwrap(d.set);
}