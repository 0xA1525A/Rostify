import      { HTTPStatus } from "@lib:enums/http_status";
import type { Nullable }   from "@lib:types/nullable";
import type { Fn }         from "@lib:types/fn";
import type { Result }     from "@lib:templates/result";
import type { ServiceDependencies }             from "@lib:templates/service_deps";
import { readBoolean, readNullableString, readString, toRecord } from "@lib:templates/request_values";
import      { Response, type RFServerResponse } from "@lib:templates/response";

import {
    createStaff,
    getAllStaffPreviews,
    getStaffByStaffID,
    updateStaffByStaffID,
    deleteStaffByStaffID,
    getStaffPreviewsByAnyName,
    deleteAllStaff,
} from "@data:staff";

import { validateAccessPermission } from "@service:permission/permission";

import {
    type StaffPreview,
    type Staff,
         validateStaff,
} from "@model:staff";

export async function handleGetAllStaffPreviews(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const allStaffPreviewInfo    : Result<Array<StaffPreview>>  = await getAllStaffPreviews(d.sql);
    const allStaffPreviewInfoData: Nullable<Array<StaffPreview>> = allStaffPreviewInfo.getData();

    if (!allStaffPreviewInfo.isSuccess() || allStaffPreviewInfoData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to fetch all preview data.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, allStaffPreviewInfoData).unwrap(d.set);
}

export async function handleGetStaffByStaffID(d: ServiceDependencies): Promise<RFServerResponse> {
    const params: Record<string, unknown> = toRecord(d.params);

    const targetStaffID: string = readString(params, "staffID") ?? '';

    if (targetStaffID.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID in URL.").unwrap(d.set);
    }

    const permissionResult: Result<string>   = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const staffInfo    : Result<Staff>   = await getStaffByStaffID(d.sql, targetStaffID);
    const staffInfoData: Nullable<Staff> = staffInfo.getData();

    if (!staffInfo.isSuccess() || staffInfoData === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Staff not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, staffInfoData).unwrap(d.set);
}

export async function handleSearchStaffPreviewsByAnyName(d: ServiceDependencies): Promise<RFServerResponse> {
    const params: Record<string, unknown> = toRecord(d.params);

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const searchKeyword: string = readString(params, "names") ?? '';

    if (searchKeyword.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Search type and keyword is required.").unwrap(d.set);
    }

    type R = Array<StaffPreview>;

    if (!searchKeyword.trim().includes(' ')) {
        const searchResult    : Result<R> = await getStaffPreviewsByAnyName(d.sql, `%${ searchKeyword }%`);
        const searchResultData: Nullable<R> = searchResult.getData();

        if (!searchResult.isSuccess() || searchResultData === null) {
            return new Response(false, HTTPStatus.NOT_FOUND, "Staff Not Found.").unwrap(d.set);
        }

        return new Response(true, HTTPStatus.OK, searchResultData).unwrap(d.set);
    }

    let totalSearchResult: R             = [];
    let resultIDs        : Array<string> = [];

    const splittedKeywords: Array<string> = searchKeyword.trim().split(' ');

    const addToTotalResult: Fn<[StaffPreview], void> = (staffPreview: StaffPreview): void => {
        if (resultIDs.includes(staffPreview.id)) {
            return;
        }

        resultIDs        .push(staffPreview.id);
        totalSearchResult.push(staffPreview);
    };

    const getMultiplePreviews: Fn<[string], Promise<void>> = async (keyword: string): Promise<void> => {
        const searchResult    : Result<R>   = await getStaffPreviewsByAnyName(d.sql, `%${ keyword.trim() }%`);
        const searchResultData: Nullable<R> = searchResult.getData();

        if (!searchResult.isSuccess() || searchResultData === null) {
            return;
        }

        searchResultData.forEach((eachPreview: StaffPreview): void => addToTotalResult(eachPreview));
    };

    await Promise.all(splittedKeywords.map(async (keyword: string): Promise<void> => await getMultiplePreviews(keyword)));

    return new Response(true, HTTPStatus.OK, totalSearchResult).unwrap(d.set);
}

export async function handleCreateStaff(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const body: Record<string, unknown> = toRecord(d.body);

    const nickname   : string           = readString(body, "nickname") ?? '';
    const firstName  : string           = readString(body, "firstName") ?? '';
    const middleName : Nullable<string> = readNullableString(body, "middleName") ?? null;
    const lastName   : string           = readString(body, "lastName") ?? '';
    const dateOfBirth: string           = readString(body, "dateOfBirth") ?? '';
    const privilege  : string           = readString(body, "privilege") ?? '';

    const staffInfo: unknown = {
        id         : crypto.randomUUID(),
        nickname   : nickname,
        firstName  : firstName,
        middleName : middleName,
        lastName   : lastName,
        dateOfBirth: dateOfBirth,
        isFullTime : readBoolean(body, "isFullTime") ?? '',
        privilege  : privilege
    };

    if (!validateStaff(staffInfo)) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Invalid staff information.").unwrap(d.set);
    }

    const validStaffInfo: Staff = staffInfo;

    if (privilege === "manager") {
        return new Response(false, HTTPStatus.FORBIDDEN, "You cannot create manager.").unwrap(d.set);
    }

    const createStaffResult: Result<string>   = await createStaff(d.sql, validStaffInfo);
    const newStaffID       : Nullable<string> = createStaffResult.getData();

    if (!createStaffResult.isSuccess() || newStaffID === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to register a new staff.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.CREATED, newStaffID).unwrap(d.set);
}

export async function handleUpdateStaff(d: ServiceDependencies): Promise<RFServerResponse> {
    const params: Record<string, unknown> = toRecord(d.params);
    const body  : Record<string, unknown> = toRecord(d.body);

    const targetStaffID: string = readString(params, "staffID") ?? '';

    if (targetStaffID.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const oldStaffInfoResult: Result<Staff>   = await getStaffByStaffID(d.sql, targetStaffID);
    const oldStaffInfo      : Nullable<Staff> = oldStaffInfoResult.getData();

    if (!oldStaffInfoResult.isSuccess() || oldStaffInfo === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Staff not found.").unwrap(d.set);
    }

    const newStaffInfo: unknown = {
        id         : targetStaffID,
        nickname   : readString(body, "nickname") ?? oldStaffInfo.nickname,
        firstName  : readString(body, "firstName") ?? oldStaffInfo.firstName,
        middleName : readNullableString(body, "middleName") ?? oldStaffInfo.middleName,
        lastName   : readString(body, "lastName") ?? oldStaffInfo.lastName,
        dateOfBirth: readString(body, "dateOfBirth") ?? oldStaffInfo.dateOfBirth,
        isFullTime : readBoolean(body, "isFullTime") ?? oldStaffInfo.isFullTime,
        privilege  : readString(body, "privilege") ?? oldStaffInfo.privilege
    };

    if (!validateStaff(newStaffInfo)) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Invalid staff information.").unwrap(d.set);
    }

    const validStaffInfo: Staff = newStaffInfo;

    if (validStaffInfo.privilege === "manager" && oldStaffInfo.privilege !== "manager") {
        return new Response(false, HTTPStatus.FORBIDDEN, "You cannot promote staff to manager.").unwrap(d.set);
    }

    const staffInfoToUpdate: Omit<Staff, "id"> = {
        nickname   : validStaffInfo.nickname,
        firstName  : validStaffInfo.firstName,
        middleName : validStaffInfo.middleName,
        lastName   : validStaffInfo.lastName,
        dateOfBirth: validStaffInfo.dateOfBirth,
        isFullTime : validStaffInfo.isFullTime,
        privilege  : validStaffInfo.privilege
    };

    const updateStaffResult: Result<Staff>   = await updateStaffByStaffID(d.sql, targetStaffID, staffInfoToUpdate);
    const updateStaffData  : Nullable<Staff> = updateStaffResult.getData();

    if (!updateStaffResult.isSuccess() || updateStaffData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to update staff information.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, updateStaffData).unwrap(d.set);
}

export async function handleDeleteStaffByID(d: ServiceDependencies): Promise<RFServerResponse> {
    const params: Record<string, unknown> = toRecord(d.params);

    const targetStaffID: string = readString(params, "staffID") ?? '';

    if (targetStaffID.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    type R = {
        firstName: string,
        lastName: string
    };

    const deleteStaffResult: Result<R>   = await deleteStaffByStaffID(d.sql, targetStaffID);
    const deleteStaffData  : Nullable<R> = deleteStaffResult.getData();

    if (!deleteStaffResult.isSuccess() || deleteStaffData === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Staff not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, `Successfully deleted ${ deleteStaffData.firstName } ${ deleteStaffData.lastName }.`).unwrap(d.set);
}

export async function handleDeleteAllStaff(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string>   = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const deleteAllStaffResult: Result<null> = await deleteAllStaff(d.sql);

    if (!deleteAllStaffResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete staff.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, `Successfully deleted all staff.`).unwrap(d.set);
}