import { HTTPStatus } from "@lib:enums/http_status";
import type { Nullable }                   from "@lib:types/nullable";
import      { Response, type RFServerResponse } from "@lib:templates/response";
import type { Result }                     from "@lib:templates/result";
import type { ServiceDependencies }        from "@lib:templates/service_deps";

import { validateAccessPermission } from "@service:permission/permission";
import {
    deleteAllLogins,
    deleteLoginByStaffID,
    getAllLogins,
    getLoginByStaffID,
    getLoginByUsername,
    updateLoginByID
} from "@data:logins";

import      { validateAccountStatus, type AccountStatus, type Login } from "@model:logins";
import      { validatePassword, validateUsername } from "@service:auth/validator";
import type { StaffPrivilege }           from "@model:staff";
import      { getTokenPrincipalByToken } from "@data:sessions";
import      { getClientSessionToken }    from "@service:auth/sessions";

export async function handleDeleteAllLoginAccounts(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const deleteResult: Result<null> = await deleteAllLogins(d.sql);

    if (!deleteResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete all accounts.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all login accounts.").unwrap(d.set);
}

export async function handleDeleteLoginAccountByStaffID(d: ServiceDependencies): Promise<RFServerResponse>
{
    const targetStaffID: string = d.params?.staffID ?? '';

    if (targetStaffID.trim() === '') {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID. Whom are we supposed to be searching for?").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const deleteResult   : Result<string>   = await deleteLoginByStaffID(d.sql, targetStaffID);
    const deletedUsername: Nullable<string> = deleteResult.getData();

    if (!deleteResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete login account.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, `Successfully deleted ${ deletedUsername }`).unwrap(d.set);
}

export async function handleGetAllLoginAccounts(d: ServiceDependencies): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const getResult: Result<Array<Omit<Login, "passwordHash">>> = await getAllLogins(d.sql);

    if (!getResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to retrieve all login accounts.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, getResult.getData()).unwrap(d.set);
}

export async function handleGetLoginAccountByStaffID(d: ServiceDependencies): Promise<RFServerResponse> {
    const targetStaffID: string = d.params?.staffID ?? '';

    if (targetStaffID.trim() === '') {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, targetStaffID);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const getResult  : Result<Login>   = await getLoginByStaffID(d.sql, targetStaffID);
    const accountData: Nullable<Login> = getResult.getData();

    if (!getResult.isSuccess() || accountData === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Unable to retrieve login account.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, accountData).unwrap(d.set);
}

export async function handleUpdateLoginAccountByStaffID(d: ServiceDependencies): Promise<RFServerResponse> {
    const staffID                : string = d.params.staffID   ?? '';
    const newUsername            : string = d.body.username    ?? '';
    const newPassword            : string = d.body.newPassword ?? '';
    const newPasswordConfirmation: string = d.body.newPasswordConfirmation ?? '';
    const oldPassword            : string = d.body.oldPassword ?? '';
    const newStatus              : string = d.body.newStatus   ?? '';

    const validationResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, staffID);

    if (!validationResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "You are not allowed to change other's info.").unwrap(d.set);
    }

    const getOldAccountResult: Result<Login> = await getLoginByStaffID(d.sql, staffID);
    const oldAccount: Nullable<Login> = getOldAccountResult.getData();

    if (!getOldAccountResult.isSuccess() || oldAccount === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Staff not found.").unwrap(d.set);
    }

    let usernameToSet: string = oldAccount.username;

    if (newUsername.trim() !== '') {
        if (!validateUsername(newUsername).isSuccess()) {
            return new Response(false, HTTPStatus.BAD_REQUEST, "Invalid username.").unwrap(d.set);
        }

        if (newUsername !== oldAccount.username) {
            const existingUsernameResult: Result<Login> = await getLoginByUsername(d.sql, newUsername);

            if (existingUsernameResult.isSuccess()) {
                return new Response(false, HTTPStatus.BAD_REQUEST, "Username already exists.").unwrap(d.set);
            }

            usernameToSet = newUsername;
        }
    }

    let passwordHashToSet: string = oldAccount.passwordHash;

    if (newPassword !== '' || newPasswordConfirmation !== '' || oldPassword !== '') {
        if (oldPassword === '' || newPassword === '' || newPasswordConfirmation === '') {
            return new Response(false, HTTPStatus.BAD_REQUEST, "To set a new password, provide the old password and new password confirmation as well.").unwrap(d.set);
        }

        const isPasswordCorrect: boolean = await Bun.password.verify(oldPassword, oldAccount.passwordHash);

        if (!isPasswordCorrect) {
            return new Response(false, HTTPStatus.UNAUTHORISED, "Incorrect old password.").unwrap(d.set);
        }

        const validateNewPasswordResult: Result<string>   = validatePassword(newPassword, newPasswordConfirmation);
        const errorMessage             : Nullable<string> = validateNewPasswordResult.getData();

        if (!validateNewPasswordResult.isSuccess()) {
            return new Response(false, HTTPStatus.BAD_REQUEST, `Invalid new password: ${ errorMessage }`).unwrap(d.set);
        }

        passwordHashToSet = await Bun.password.hash(newPassword);
    }

    let statusToSet: AccountStatus = oldAccount.status;

    if (newStatus !== '') {
        if (!validateAccountStatus(newStatus)) {
            return new Response(false, HTTPStatus.BAD_REQUEST, "Invalid new status.").unwrap(d.set);
        }

        const sessionToken: string = getClientSessionToken(d.headers) ?? '';

        type P = { id: string, privilege: StaffPrivilege };

        const accountPrincipalResult: Result<P>   = await getTokenPrincipalByToken(d.sql, sessionToken);
        const accountPrincipal      : Nullable<P> = accountPrincipalResult.getData();

        if (!accountPrincipalResult.isSuccess() || accountPrincipal === null) {
            return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to retrieve principal info.").unwrap(d.set);
        }

        if (!["manager", "admin"].includes(accountPrincipal.privilege)) {
            return new Response(false, HTTPStatus.FORBIDDEN, "You're not allowed to change this account's status.").unwrap(d.set);
        }

        statusToSet = newStatus as AccountStatus;
    }

    const newAccount: Omit<Login, "staffID"> = {
        username    : usernameToSet,
        passwordHash: passwordHashToSet,
        status      : statusToSet
    };

    const updateResult: Result<Login> = await updateLoginByID(d.sql, staffID, newAccount);

    if (!updateResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to update info.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully updated info.").unwrap(d.set);
}

export async function handlePasswordReset(d: ServiceDependencies): Promise<RFServerResponse> {
    const token: Nullable<string> = getClientSessionToken(d.headers);
    const newPassword: string = d.body.newPassword ?? '';
    const newPasswordConfirmation: string = d.body.newPasswordConfirmation ?? '';
    const oldPassword: string = d.body.oldPassword ?? '';

    if (!token) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Missing token. Who are you?").unwrap(d.set);
    }

    const validateNewPsaswordRequest: Result<string>   = validatePassword(newPassword, newPasswordConfirmation);
    const errorMessage              : Nullable<string> = validateNewPsaswordRequest.getData();

    if (!validateNewPsaswordRequest.isSuccess()) {
        return new Response(false, HTTPStatus.BAD_REQUEST, `invalid new password: ${ errorMessage }`).unwrap(d.set);
    }

    type P = { id: string, privilege: StaffPrivilege };

    const getPrincipalResult: Result<P> = await getTokenPrincipalByToken(d.sql, token);
    const principal: Nullable<P> = getPrincipalResult.getData();

    if (!getPrincipalResult.isSuccess() || principal === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Unknown token.").unwrap(d.set);
    }

    const validatePermissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", true, principal.id);

    if (!validatePermissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "You are not meant to be here.").unwrap(d.set);
    }

    const getOldAccountResult: Result<Login>   = await getLoginByStaffID(d.sql, principal.id);
    const oldAccount         : Nullable<Login> = getOldAccountResult.getData();

    if (!getOldAccountResult.isSuccess() || oldAccount === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Unable to retrieve info.").unwrap(d.set);
    }

    const validatePasswordResult: boolean = await Bun.password.verify(oldPassword, oldAccount.passwordHash);

    if (!validatePasswordResult) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Incorrect old password.").unwrap(d.set);
    }

    const passwordHash: string = await Bun.password.hash(newPassword);

    const newCredentials: Omit<Login, "staffID"> = {
        username: oldAccount.username,
        passwordHash: passwordHash,
        status: oldAccount.status
    };

    const updateResult: Result<Login> = await updateLoginByID(d.sql, principal.id, newCredentials);

    if (!updateResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to update account.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully reset password.").unwrap(d.set);
}