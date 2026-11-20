import { HTTPStatus } from "@lib:enums/http_status";
import { Response, RFServerResponse } from "@lib:templates/response";
import { Result } from "@lib:templates/result";
import { ServiceDependencies } from "@lib:templates/service_deps";
import { readString, toRecord } from "@lib:templates/request_values";
import { Nullable } from "@lib:types/nullable";
import { validateAccessPermission } from "@service:permission/permission";

import type { StaffEmail } from "@model:staff";

import {
    addEmailByStaffID,
    deleteAllEmails,
    deleteEmailByEmail,
    getAllEmails,
    getEmailsByStaffID,
    updateEmailByEmailAndStaffID
} from "@data:staff";

export async function handleGetAllEmails(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const emailsResult    : Result<Array<unknown>>   = await getAllEmails(d.sql);
    const emailsResultData: Nullable<Array<unknown>> = emailsResult.getData();

    if (!emailsResult.isSuccess() || emailsResultData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to fetch all emails.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, emailsResultData).unwrap(d.set);
}

export async function handleAddEmail(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const params: Record<string, unknown> = toRecord(d.params);
    const body  : Record<string, unknown> = toRecord(d.body);

    const targetStaffID: string = readString(params, "staffID") ?? readString(body, "staffID") ?? '';
    const email        : string = readString(body, "email") ?? '';

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

    const addEmailResult: Result<number>   = await addEmailByStaffID(d.sql, targetStaffID, email);
    const addEmailData  : Nullable<number> = addEmailResult.getData();

    if (!addEmailResult.isSuccess() || addEmailData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to add email.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.CREATED, addEmailData).unwrap(d.set);
}

export async function handleUpdateEmailByEmailAndStaffID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const params: Record<string, unknown> = toRecord(d.params);
    const body  : Record<string, unknown> = toRecord(d.body);

    const targetStaffID: string = readString(params, "staffID") ?? readString(body, "staffID") ?? '';
    const oldEmail     : string = readString(params, "email") ?? readString(body, "oldEmail") ?? '';
    const newEmail     : string = readString(body, "newEmail") ?? readString(body, "email") ?? '';

    if (targetStaffID.trim() === "" || oldEmail.trim() === "" || newEmail.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID or email.").unwrap(d.set);
    }

    if (newEmail !== newEmail.toLowerCase()) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Email must be lowercase.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const updateEmailResult: Result<number>   = await updateEmailByEmailAndStaffID(d.sql, targetStaffID, oldEmail, newEmail);
    const updateEmailData  : Nullable<number> = updateEmailResult.getData();

    if (!updateEmailResult.isSuccess() || updateEmailData === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Email not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully updated email.").unwrap(d.set);
}

export async function handleDeleteEmailByEmailAndStaffID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const params: Record<string, unknown> = toRecord(d.params);
    const body  : Record<string, unknown> = toRecord(d.body);

    const targetStaffID: string = readString(params, "staffID") ?? readString(body, "staffID") ?? '';
    const email        : string = readString(params, "email") ?? readString(body, "email") ?? '';

    if (targetStaffID.trim() === "" || email.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID or email.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const deleteEmailResult: Result<null> = await deleteEmailByEmail(d.sql, targetStaffID, email);

    if (!deleteEmailResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Email not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted email.").unwrap(d.set);
}

export async function handleDeleteAllEmails(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const deleteEmailsResult: Result<null> = await deleteAllEmails(d.sql);

    if (!deleteEmailsResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete all emails.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all emails.").unwrap(d.set);
}

export async function handleGetEmailsByStaffID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const params: Record<string, unknown> = toRecord(d.params);

    const targetStaffID: string = readString(params, "staffID") ?? '';

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

    const emailsResult: Result<Array<StaffEmail>>   = await getEmailsByStaffID(d.sql, targetStaffID);
    const emailsData  : Nullable<Array<StaffEmail>> = emailsResult.getData();

    if (!emailsResult.isSuccess() || emailsData === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to fetch staff emails.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, emailsData).unwrap(d.set);
}

export async function handleUpdateEmail(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    const params: Record<string, unknown> = toRecord(d.params);
    const body  : Record<string, unknown> = toRecord(d.body);

    const targetStaffID: string = readString(params, "staffID") ?? readString(body, "staffID") ?? '';
    const email: string = readString(params, "email") ?? readString(body, "oldEmail") ?? '';
    const newEmail: string = readString(body, "newEmail") ?? readString(body, "email") ?? '';

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

    const updateEmailResult: Result<number> = await updateEmailByEmailAndStaffID(d.sql, targetStaffID, email, newEmail);

    if (!updateEmailResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Email not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully updated email.").unwrap(d.set);
}

export async function handleDeleteEmailByEmail(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    const params: Record<string, unknown> = toRecord(d.params);
    const body  : Record<string, unknown> = toRecord(d.body);

    const targetStaffID: string = readString(params, "staffID") ?? readString(body, "staffID") ?? '';
    const email: string = readString(params, "email") ?? readString(body, "email") ?? '';

    if (targetStaffID.trim() === "" || email.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID or email.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Insufficient permission.").unwrap(d.set);
    }

    const deleteEmailResult: Result<null> = await deleteEmailByEmail(d.sql, targetStaffID, email);

    if (!deleteEmailResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Email not found.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted email.").unwrap(d.set);
}
