import      { HTTPStatus } from "@lib:enums/http_status";
import type { Nullable }   from "@lib:types/nullable";
import      { Result }     from "@lib:templates/result";
import      { type RFServerResponse, Response } from "@lib:templates/response";
import type { ServiceDependencies }             from "@lib:templates/service_deps";

import { createLogin, getLoginByStaffID } from "@data:logins";
import { getStaffByStaffID } from "@data:staff";

import { validateUsername, validatePassword } from "@service:auth/validator";

import type { Login } from "@model:logins";
import type { Staff }            from "@model:staff";

export async function handleRegister(d: ServiceDependencies & { hashOptions: Bun.Password.Argon2Algorithm }): Promise<RFServerResponse> {
    const staffID: string = d.body?.staffID ?? '';

    if (!staffID.trim()) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing staff ID").unwrap(d.set);
    }

    const staffInfo: Result<Staff> = await getStaffByStaffID(d.sql, staffID);

    if (!staffInfo.isSuccess() || staffInfo.getData() === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Staff ID does not exists. Please contact your manager or administrator.").unwrap(d.set);
    }

    const loginAccountInfo: Result<Login> = await getLoginByStaffID(d.sql, d.body.staffID);

    if (loginAccountInfo.isSuccess() || loginAccountInfo.getData() !== null) {
        return new Response(false, HTTPStatus.FORBIDDEN, "You already have an account. Please contact your manager or administrator.").unwrap(d.set);
    }

    const usernameValidateResult: Result<string>   = validateUsername(d.body.username);
    const usernameValidateData  : Nullable<string> = usernameValidateResult.getData();

    if (!usernameValidateResult.isSuccess() || usernameValidateData !== null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, `Invalid username: ${ usernameValidateData }`).unwrap(d.set);
    }

    const passwordValidateResult: Result<string> = validatePassword(d.body.password, d.body.confirmPassword);
    const passwordValidateData  : Nullable<string> = passwordValidateResult.getData();

    if (!passwordValidateResult.isSuccess() || passwordValidateData !== null) {
        return new Response(false, HTTPStatus.BAD_REQUEST, `Invalid password: ${ passwordValidateData }`).unwrap(d.set);
    }

    const passwordHash: string = await Bun.password.hash(d.body.password, d.hashOptions);

    const newAccount: Pick<Login, "username" | "passwordHash"> = {
        username: d.body.username,
        passwordHash: passwordHash
    }

    const createResult: Result<string> = await createLogin(d.sql, d.body.staffID, newAccount);

    if (!createResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to create new account.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.CREATED, "Successfully created an account. Please wait for your manager or administrator to activate it.").unwrap(d.set);
}