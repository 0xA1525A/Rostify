import      { HTTPStatus } from "@lib:enums/http_status";
import type { Nullable }   from "@lib:types/nullable";
import type { Result }     from "@lib:templates/result";
import type { ServiceDependencies }             from "@lib:templates/service_deps";
import      { Response, type RFServerResponse } from "@lib:templates/response";

import {
    createStaff,
    getAllStaffPreviews,
    getStaffByID,
    updateStaffByID,
    deleteStaffByID,
    getStaffPreviewsBySimilarNames,
    deleteAllStaff,
    addEmailForID,
    updateEmailForIDByEmail,
    deleteEmailFromIDByEmail,
    addTelForID,
    updateTelForIDByTel,
    deleteTelFromIDByTel,
    createAvailabilityOnDateForID,
    updateAvailabilityOnDateForID,
    deleteAvailabilityOnDateForID,
    setStaffRelationToStaffByStaffID,
    unsetStaffRelationToStaffByStaffID,
    setStaffRelationToShiftByShiftID,
    unsetStaffRelationToShiftByShiftID,
    setStaffRelationToPositionByPositionID,
    unsetStaffRelationToPositionByPositionID
} from "@data:staff";
import { validateAccessPermission } from "@service:permission/permission";

import {
    type StaffPreview,
    type Staff,
    type StaffPrivilege,
         validateStaff,
         validateStaffAvailability,
         StaffAvailability
} from "@model:staff";
import type { Fn } from "@lib:types/fn";

export async function handleGetAllStaffPreviews(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
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

export async function handleGetStaffByID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const targetStaffID: string = d.params.id;

    if (targetStaffID.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID in URL.").unwrap(d.set);
    }

    const permissionResult: Result<string>   = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const staffInfo    : Result<Staff>   = await getStaffByID(d.sql, targetStaffID);
    const staffInfoData: Nullable<Staff> = staffInfo.getData();

    if (!staffInfo.isSuccess() || staffInfoData === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Staff not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, staffInfoData).unwrap(d.set);
}

export async function handleSearchStaffPreviewsByNames(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const searchKeyword: string = d.params.names ?? '';

    if (searchKeyword.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Search type and keyword is required.").unwrap(d.set);
    }

    type R = Array<StaffPreview>;

    if (!searchKeyword.trim().includes(' ')) {
        const searchResult    : Result<R> = await getStaffPreviewsBySimilarNames(d.sql, `%${ searchKeyword }%`);
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
        const searchResult    : Result<R>   = await getStaffPreviewsBySimilarNames(d.sql, `%${ keyword.trim() }%`);
        const searchResultData: Nullable<R> = searchResult.getData();

        if (!searchResult.isSuccess() || searchResultData === null) {
            return;
        }

        searchResultData.forEach((eachPreview: StaffPreview): void => addToTotalResult(eachPreview));
    };

    await Promise.all(splittedKeywords.map(async (keyword: string): Promise<void> => await getMultiplePreviews(keyword)));

    return new Response(true, HTTPStatus.OK, totalSearchResult).unwrap(d.set);
}

export async function handleCreateStaff(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const nickname   : string           = d.body?.nickname    ?? '';
    const firstName  : string           = d.body?.firstName   ?? '';
    const middleName : Nullable<string> = d.body?.middleName  ?? null;
    const lastName   : string           = d.body?.lastName    ?? '';
    const dateOfBirth: string           = d.body?.dateOfBirth ?? '';
    const isFullTime : boolean          = d.body?.isFullTime  ?? '';
    const privilege  : StaffPrivilege   = d.body?.privilege   ?? ''

    const staffInfo: Staff = {
        id         : crypto.randomUUID(), // Just a placeholder UUID. The real one is generated on the postgres.
        nickname   : nickname,
        firstName  : firstName,
        middleName : middleName,
        lastName   : lastName,
        dateOfBirth: dateOfBirth,
        isFullTime : isFullTime,
        privilege  : privilege
    };

    const validateStaffInfo: boolean = validateStaff(staffInfo);

    if (!validateStaffInfo) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Invalid staff information.").unwrap(d.set);
    }

    if (privilege === "admin") {
        return new Response(false, HTTPStatus.FORBIDDEN, "You cannot create admin.").unwrap(d.set);
    }

    const createStaffResult: Result<string>   = await createStaff(d.sql, staffInfo);
    const newStaffID       : Nullable<string> = createStaffResult.getData();

    if (!createStaffResult.isSuccess() || newStaffID === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to register a new staff.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.CREATED, newStaffID).unwrap(d.set);
}

export async function handleUpdateStaffByID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const targetStaffID: string = d.params?.staffID ?? '';

    if (targetStaffID.trim() === '') {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID. Whom are we supposed to be searching for?").unwrap(d.set);
    }

    const permissionResult: Result<string>   = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const oldStaffInfoResult: Result<Staff>   = await getStaffByID(d.sql, targetStaffID);
    const oldStaffInfo      : Nullable<Staff> = oldStaffInfoResult.getData();

    if (!oldStaffInfoResult.getData() || oldStaffInfo === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to retreive staff information.").unwrap(d.set);
    }

    const newStaffInfo: Staff = {
        id         : targetStaffID,
        nickname   : d.body?.nickname    ?? oldStaffInfo.nickname,
        firstName  : d.body?.firstName   ?? oldStaffInfo.firstName,
        middleName : d.body?.middleName  ?? null,
        lastName   : d.body?.lastName    ?? oldStaffInfo.lastName,
        dateOfBirth: d.body?.dateOfBirth ?? oldStaffInfo.dateOfBirth,
        isFullTime : d.body?.isFullTime  ?? oldStaffInfo.isFullTime,
        privilege  : d.body?.privilege   ?? oldStaffInfo.privilege
    };

    const validateNewStaffInfoResult: boolean = validateStaff(newStaffInfo);

    if (!validateNewStaffInfoResult) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Invalid Staff Information.").unwrap(d.set);
    }

    const updateStaffInfoResult: Result<Staff> = await updateStaffByID(d.sql, targetStaffID, newStaffInfo);
    const updateStaffInfoData  : Nullable<Staff> = updateStaffInfoResult.getData();

    if (!updateStaffInfoResult.isSuccess() || updateStaffInfoData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to update staff information.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, updateStaffInfoData).unwrap(d.set);
}

export async function handleDeleteStaffByID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const targetStaffID: string = d.params?.staffID ?? '';

    if (targetStaffID.trim() === '') {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID. Whom are we supposed to be searching for?").unwrap(d.set);
    }

    const permissionResult: Result<string>   = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    type R = {
        firstName: string,
        lastName: string
    };
    const deleteStaffResult: Result<R>   = await deleteStaffByID(d.sql, targetStaffID);
    const deleteStaffData  : Nullable<R> = deleteStaffResult.getData();

    if (!deleteStaffResult.isSuccess() || deleteStaffData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete staff.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, `Successfully deleted ${deleteStaffData.firstName} ${deleteStaffData.lastName}`).unwrap(d.set);
}

export async function handleDeleteAllStaff(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const permissionResult: Result<string>   = await validateAccessPermission(d.sql, d.headers, "admin", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const deleteAllStaffResult: Result<null> = await deleteAllStaff(d.sql);

    if (!deleteAllStaffResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete staff.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, `Successfully deleted all staff.`).unwrap(d.set);
}

export async function handleGetEmailsByStaffID(
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

    const emailsResult: Result<Array<string>>   = await getEmailsByStaffID(d.sql, targetStaffID);
    const emailsData  : Nullable<Array<string>> = emailsResult.getData();

    if (!emailsResult.isSuccess() || emailsData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to fetch staff emails.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, emailsData).unwrap(d.set);
}

export async function handleAddEmailToStaffWithID(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    const targetStaffID: string = d.params?.staffID ?? '';
    const email: string = d.body?.email ?? '';

    if (targetStaffID.trim() === "" || email.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID or email.").unwrap(d.set);
    }

    if (email !== email.toLowerCase()) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Email must be lowercase.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const addEmailResult: Result<number> = await addEmailForID(d.sql, targetStaffID, email);
    const addEmailData: Nullable<number> = addEmailResult.getData();

    if (!addEmailResult.isSuccess() || addEmailData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to add email.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.CREATED, addEmailData).unwrap(d.set);
}

export async function handleUpdateEmailByEmail(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    const targetStaffID: string = d.params?.staffID ?? '';
    const email: string = d.params?.email ?? '';
    const newEmail: string = d.body?.email ?? '';

    if (targetStaffID.trim() === "" || email.trim() === "" || newEmail.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID or email.").unwrap(d.set);
    }

    if (newEmail !== newEmail.toLowerCase()) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Email must be lowercase.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const updateEmailResult: Result<number> = await updateEmailForIDByEmail(d.sql, targetStaffID, email, newEmail);

    if (!updateEmailResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Email not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully updated email.").unwrap(d.set);
}

export async function handleDeleteEmailByEmail(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    const targetStaffID: string = d.params?.staffID ?? '';
    const email: string = d.params?.email ?? '';

    if (targetStaffID.trim() === "" || email.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID or email.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const deleteEmailResult: Result<null> = await deleteEmailFromIDByEmail(d.sql, targetStaffID, email);

    if (!deleteEmailResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Email not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted email.").unwrap(d.set);
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

    const telsResult: Result<Array<string>>   = await getTelsByStaffID(d.sql, targetStaffID);
    const telsData  : Nullable<Array<string>> = telsResult.getData();

    if (!telsResult.isSuccess() || telsData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to fetch staff telephone numbers.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, telsData).unwrap(d.set);
}

export async function handleAddTelToStaffWithID(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    const targetStaffID: string = d.params?.staffID ?? '';
    const tel: string = d.body?.tel ?? '';

    if (targetStaffID.trim() === "" || tel.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID or telephone number.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const addTelResult: Result<number> = await addTelForID(d.sql, targetStaffID, tel);
    const addTelData: Nullable<number> = addTelResult.getData();

    if (!addTelResult.isSuccess() || addTelData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to add telephone number.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.CREATED, addTelData).unwrap(d.set);
}

export async function handleUpdateTelByTel(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    const targetStaffID: string = d.params?.staffID ?? '';
    const tel: string = d.params?.tel ?? '';
    const newTel: string = d.body?.tel ?? '';

    if (targetStaffID.trim() === "" || tel.trim() === "" || newTel.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID or telephone number.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const updateTelResult: Result<number> = await updateTelForIDByTel(d.sql, targetStaffID, tel, newTel);

    if (!updateTelResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Telephone number not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully updated telephone number.").unwrap(d.set);
}

export async function handleDeleteTelByID(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    const targetStaffID: string = d.params?.staffID ?? '';
    const tel: string = d.params?.tel ?? '';

    if (targetStaffID.trim() === "" || tel.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID or telephone number.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const deleteTelResult: Result<null> = await deleteTelFromIDByTel(d.sql, targetStaffID, tel);

    if (!deleteTelResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Telephone number not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted telephone number.").unwrap(d.set);
}

export async function handleGetAllAvailabilitiesOnDate(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const targetDate: string = d.params?.date ?? '';

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

    const availabilitiesResult: Result<Array<StaffAvailability>>   = await getAllAvailabilitiesOnDate(d.sql, targetDate);
    const availabilitiesData  : Nullable<Array<StaffAvailability>> = availabilitiesResult.getData();

    if (!availabilitiesResult.isSuccess() || availabilitiesData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to fetch availabilities on date.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, availabilitiesData).unwrap(d.set);
}

export async function handleGetAllAvailabilitiesByStaffID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const targetStaffID: string = d.params?.id ?? '';

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

    const availabilitiesResult: Result<Array<StaffAvailability>>   = await getAllAvailabilitiesByStaffID(d.sql, targetStaffID);
    const availabilitiesData  : Nullable<Array<StaffAvailability>> = availabilitiesResult.getData();

    if (!availabilitiesResult.isSuccess() || availabilitiesData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to fetch staff availabilities.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, availabilitiesData).unwrap(d.set);
}

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

export async function handleCreateAvailabilityOnDateForStaffID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const availabilityData: unknown = d.body;

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

    const createAvailabilityResult: Result<null> = await createAvailabilityOnDateForID(
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

export async function handleUpdateAvailabilityOnDateForStaffID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const availabilityData: unknown = d.body;

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

    const updateAvailabilityResult: Result<null> = await updateAvailabilityOnDateForID(
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

export async function handleDeleteAvailabilityOnDateForStaffID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const targetStaffID: string = d.params?.staffID ?? '';
    const targetDate   : string = d.params?.date ?? '';

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

    const deleteAvailabilityResult: Result<null> = await deleteAvailabilityOnDateForID(
        d.sql,
        targetStaffID,
        targetDate
    );

    if (!deleteAvailabilityResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Staff availability not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted staff availability.").unwrap(d.set);
}

export async function handleSetStaffRelationToStaffByStaffID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const targetStaffID : string = d.params?.staffID ?? '';
    const relatedStaffID: string = d.params?.relatedStaffID ?? '';
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
    const relatedStaffID: string = d.params?.relatedStaffID ?? '';

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

export async function handleSetStaffRelationToShiftByShiftID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const targetStaffID: string = d.params?.staffID ?? '';
    const shiftID      : number = Number(d.params?.shiftID);
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

export async function handleSetStaffRelationToPositionByPositionID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const targetStaffID: string = d.params?.staffID ?? '';
    const positionID   : number = Number(d.params?.positionID);
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