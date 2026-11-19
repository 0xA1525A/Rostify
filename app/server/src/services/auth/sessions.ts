import      { HTTPStatus } from "@lib:enums/http_status";
import      { Result }     from "@lib:templates/result";
import type { ServiceDependencies } from "@lib:templates/service_deps";
import type { Nullable }   from "@lib:types/nullable";

import { getTokenPrincipalByToken }   from "@data:sessions";
import { getStaffByStaffID }          from "@data:staff";
import { Response, RFServerResponse } from "@lib:templates/response";

import { Staff, StaffPrivilege } from "@model:staff";

export function getClientSessionToken(headers: any): Nullable<string> {
    return headers?.["x-rostify-session-token"] ?? null;
}

export async function handleGetStaffByToken(d: ServiceDependencies): Promise<RFServerResponse> {
    const token: Nullable<string> = getClientSessionToken(d.headers);

    if (token === null) {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Missing session token.").unwrap(d.set);
    }

    type P = { id: string, privilege: StaffPrivilege };

    const getPrincipalResult: Result<P>   = await getTokenPrincipalByToken(d.sql, token);
    const principal         : Nullable<P> = getPrincipalResult.getData();

    if (!getPrincipalResult.isSuccess() || principal === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "We don't know who you are.").unwrap(d.set);
    }

    const getStaffResult: Result<Staff>   = await getStaffByStaffID(d.sql, principal.id);
    const staffInfo     : Nullable<Staff> = getStaffResult.getData();

    if (!getStaffResult.isSuccess() || staffInfo === null) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to retrieve info.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, staffInfo).unwrap(d.set);
}