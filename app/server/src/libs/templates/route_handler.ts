import type { RFServerResponse } from "@lib:templates/response";
import type { ServiceDependencies } from "@lib:templates/service_deps";
import type { Fn } from "@lib:types/fn";

export type RouteHandler = Fn<[unknown], unknown>;

function isDependencies<TDependencies extends ServiceDependencies>(value: unknown): value is TDependencies {
    return typeof value === "object" && value !== null;
}

function invokeHandler<TDependencies extends ServiceDependencies>(
    handler: Fn<[TDependencies], Promise<RFServerResponse>>,
    context: unknown
): Promise<RFServerResponse> {
    if (!isDependencies<TDependencies>(context)) {
        throw new TypeError("Invalid route context.");
    }

    return handler(context);
}

export function toRouteHandler<TDependencies extends ServiceDependencies>(
    handler: Fn<[TDependencies], Promise<RFServerResponse>>
): RouteHandler {
    return (context: unknown): unknown => invokeHandler(handler, context);
}
