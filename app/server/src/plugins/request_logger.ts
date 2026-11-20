import { Elysia } from "elysia";

import type { Logger } from "@service:logger/logger";

export function requestLogger(logger: Logger): Elysia {
    return new Elysia({ name: "request-logger" }).onRequest((context): void => {
        const request: Request = context.request;
        const url     : URL    = new URL(request.url);

        const client = context.server?.requestIP(request);

        const clientAddress: string          = client?.address ?? "???";
        const clientPort   : number | string = client?.port    ?? "???";

        logger.debug(
            `${ clientAddress }:${ clientPort } ${ request.method } ${ url.pathname }${ url.search }`
        );
    });
}
