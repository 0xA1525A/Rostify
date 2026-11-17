import      { HTTPStatus }     from "@lib:enums/http_status";
import      { Response }       from "@lib:templates/response";
import type { Result }         from "@lib:templates/result";
import type { Nullable }       from "@lib:types/nullable";
import type { ServiceDependencies } from "@lib:templates/service_deps";
import type { RFServerResponse }    from "@lib:templates/response";

import { deleteSessionByToken, isSessionTokenExist } from "@data:sessions";

import { getClientSessionToken } from "@service:auth/sessions";

export async function handleLogout(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    if (!d.sql) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "SQL connection is undefined or null.").unwrap(d.set);
    }

    let clientToken: Nullable<string> = null;
    try {
        clientToken = getClientSessionToken(d.headers);

        if (clientToken === null || clientToken.trim() === "") {
            throw new Error();
        }
    }
    catch {
        return new Response(false, HTTPStatus.UNAUTHORISED, "Missing or invalid session token.").unwrap(d.set);
    }

    const isExist: Result<boolean> = await isSessionTokenExist(d.sql, clientToken);

    if (isExist.getData() === false) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Session token not found.").unwrap(d.set);
    }

    const deleteResult: Result<string> = await deleteSessionByToken(d.sql, clientToken);

    if (!deleteResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to complete logout process.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully logged out.").unwrap(d.set);
}