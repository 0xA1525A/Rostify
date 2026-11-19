import      { HTTPStatus } from "@lib:enums/http_status";
import type { Result }     from "@lib:templates/result"
import type { Nullable }   from "@lib:types/nullable";
import      { ServiceDependencies } from "@lib:templates/service_deps";
import      { Response, type RFServerResponse } from "@lib:templates/response";

import { getLoginByUsername } from "@data:logins";
import { getStaffByStaffID }                  from "@data:staff";
import { getSessionByStaffID, createSessionByStaffID } from "@data:sessions";

import { validateLoginInfo } from "@service:auth/validator";

import      { Login } from "@model:logins";
import type { Session }          from "@model:sessions";
import type { Staff }            from "@model:staff";

export async function handleLogin(d: ServiceDependencies): Promise<RFServerResponse> {
    if (!d.sql) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "SQL connection is undefined or null.").unwrap(d.set);
    }

    const validateResult: Result<string>   = validateLoginInfo(d.body);
    const errorMessage  : Nullable<string> = validateResult.getData();

    if (!validateResult.isSuccess()) {
        return new Response(false, HTTPStatus.BAD_REQUEST, errorMessage ?? "Invalid login information.").unwrap(d.set);
    }

    const username: string = d.body.username;
    const password: string = d.body.password;

    const getCredentialsResult: Result<Login>   = await getLoginByUsername(d.sql, username);
    const credentials         : Nullable<Login> = getCredentialsResult.getData();

    if (!getCredentialsResult.isSuccess() || credentials === null || !await Bun.password.verify(password, credentials.passwordHash)) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Invalid username or password.").unwrap(d.set);
    }

    switch (credentials.status) {
        case "active":
            break;

        case "pending":
            return new Response(false, HTTPStatus.UNAUTHORISED, "Your account is not ready yet. Please contact your manager or administrator.").unwrap(d.set);

        case "disabled":
            return new Response(false, HTTPStatus.UNAUTHORISED, "Your account has been disabled. Please contact your manager or administrator.").unwrap(d.set);

        default:
            return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Account status found on database is incorrect. Please contact administrator.").unwrap(d.set);
    }

    const activeSessionResult: Result<Session> = await getSessionByStaffID(d.sql, credentials.staffID);

    if (activeSessionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, `@${ username } has already logged in on another device.`).unwrap(d.set);
    }

    const getStaffInfoResult: Result<Staff>   = await getStaffByStaffID(d.sql, credentials.staffID);
    const staffInfo         : Nullable<Staff> = getStaffInfoResult.getData();

    if (!getStaffInfoResult.isSuccess() || staffInfo === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, `Unable to retreive staff information.`).unwrap(d.set);
    }

    const createSessionResult: Result<string>   = await createSessionByStaffID(d.sql, credentials.staffID);
    const newToken           : Nullable<string> = createSessionResult.getData();

    if (!createSessionResult.isSuccess() || newToken === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, `Unable to create new session.`).unwrap(d.set);
    }

    type R = { token: string, staff: Staff };

    const responseData: R = {
        token: newToken,
        staff: staffInfo
    };

    return new Response(true, HTTPStatus.OK, responseData).unwrap(d.set);
}