import      { HTTPStatus }                      from "@lib:enums/http_status";
import type { Nullable }                   from "@lib:types/nullable";
import      { Response, type RFServerResponse } from "@lib:templates/response";
import type { Result }                     from "@lib:templates/result";
import type { ServiceDependencies }        from "@lib:templates/service_deps";

import { validateAccessPermission } from "@service:permission/permission";
import {
    deleteAllLoginAccounts,
    deleteLoginAccountByID,
    getAllLoginCredentials,
    getLoginCredentialsByStaffID,
    updateLoginAccountByID
} from "@data:logins/logins";

import type { LoginCredentials } from "@model:logins";

export async function handleDeleteAllLoginAccounts(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const deleteResult: Result<null> = await deleteAllLoginAccounts(d.sql);

    if (!deleteResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete all accounts.").unwrap(d.set);
    }

    return new Response(false, HTTPStatus.OK, "Successfully deleted all login accounts.").unwrap(d.set);
}

export async function handleDeleteLoginAccountByID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const targetStaffID: string = d.params?.staffID ?? '';

    if (targetStaffID.trim() === '') {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID. Whom are we supposed to be searching for?").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const deleteResult   : Result<string>   = await deleteLoginAccountByID(d.sql, targetStaffID);
    const deletedUsername: Nullable<string> = deleteResult.getData();

    if (!deleteResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete login account.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, `Successfully deleted ${ deletedUsername }`).unwrap(d.set);
}

export async function handleGetAllLoginAccounts(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const getResult: Result<Array<Omit<LoginCredentials, "passwordHash">>> = await getAllLoginCredentials(d.sql);

    if (!getResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to retrieve all login accounts.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, getResult.getData()).unwrap(d.set);
}

export async function handleGetLoginAccountByID(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    const targetStaffID: string = d.params?.staffID ?? '';

    if (targetStaffID.trim() === '') {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const getResult  : Result<LoginCredentials>   = await getLoginCredentialsByStaffID(d.sql, targetStaffID);
    const accountData: Nullable<LoginCredentials> = getResult.getData();

    if (!getResult.isSuccess() || accountData === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Unable to retrieve login account.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, accountData).unwrap(d.set);
}

export async function handlePendingLoginAccountByID(
    d: ServiceDependencies
): Promise<RFServerResponse>
{
    const targetStaffID: string = d.params?.staffID       ?? "";
    const action       : string = d.params?.action ?? "";

    if (targetStaffID.trim() === "") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID.").unwrap(d.set);
    }

    if (action !== "accept" && action !== "reject") {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Invalid registration approval action.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    if (action === "accept") {
        const oldAccountResult: Result<LoginCredentials>   = await getLoginCredentialsByStaffID(d.sql, targetStaffID);
        const oldAccount      : Nullable<LoginCredentials> = oldAccountResult.getData();

        if (!oldAccountResult.isSuccess() || oldAccount === null) {
            return new Response(false, HTTPStatus.NOT_FOUND, "Unable to get staff information.").unwrap(d.set);
        }

        const newAccount: Omit<LoginCredentials, "staffID"> = {
            username    : oldAccount.username,
            passwordHash: oldAccount.passwordHash,
            status      : oldAccount.status
        };

        const updateResult: Result<LoginCredentials> = await updateLoginAccountByID(d.sql, targetStaffID, newAccount);

        if (!updateResult.isSuccess()) {
            return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to approve registration request.").unwrap(d.set);
        }
    }
    else {
        const deleteResult: Result<string> = await deleteLoginAccountByID(d.sql, targetStaffID);

        if (!deleteResult.isSuccess()) {
            return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to reject registration request.").unwrap(d.set);
        }
    }

    return new Response(true, HTTPStatus.OK, `Successfully ${action === "accept" ? "approved" : "rejected"} registration request.`).unwrap(d.set);
}