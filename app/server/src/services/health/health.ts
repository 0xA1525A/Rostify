import      { HTTPStatus } from "@lib:enums/http_status";
import type { Result }     from "@lib:templates/result";
import type { Nullable }   from "@lib:types/nullable";
import type { ServiceDependencies } from "@lib:templates/service_deps";
import      { Response, type RFServerResponse } from "@lib:templates/response";

import { isConnected } from "@service:database/database";

export async function handleGetHealth(d: Readonly<ServiceDependencies>): Promise<RFServerResponse> {
    try {
        const result: Result<string>   = await isConnected(d.sql);
        const data  : Nullable<string> = result.getData();

        if (!result.isSuccess() || data !== null) {
            throw new Error(data ?? "Database connection is unavailable.");
        }

        return new Response(true, HTTPStatus.OK, "We're good :)").unwrap(d.set);
    }
    catch (error: unknown) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, `We're under the weather: ${ String(error) } :(`).unwrap(d.set);
    }
}