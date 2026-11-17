import { Elysia } from "elysia";

import { Logger } from "@service:logger/logger";

function logIncomingRequest({ request, server, logger }: { request: any, server: any, logger: Logger }): void {
        const url: URL = new URL(request.url);

        const client = server?.requestIP(request);

        const clientAddress: string          = client?.address ?? "???";
        const clientPort   : number | string = client?.port    ?? "???";

        logger.debug(
            `${ clientAddress }:${ clientPort } ${ request.method } ${ url.pathname }${ url.search }`
        );
}

export function requestLogger(): Elysia {
    return new Elysia({ name: "request-logger" }).onRequest(logIncomingRequest as any);
}