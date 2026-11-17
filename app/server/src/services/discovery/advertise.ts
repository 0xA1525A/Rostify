import {
         Bonjour,
    type Service,
    type Browser
}
from "bonjour-service";

import      { Result } from "@lib:templates/result";
import type { Fn }     from "@lib:types/fn";

import      { normaliseEnv } from "@service:env/env";
import type { Logger }       from "@service:logger/logger";

export interface HasRostifyConqueredThisNetworkDependencies {
    logger: Logger;
}

export async function hasRostifyConqueredThisNetwork(d: HasRostifyConqueredThisNetworkDependencies): Promise<Result<string, null>> {
    d.logger.debug("Looking for running Rostify Server instances on the network...");

    const FALLBACK_ROSTIFY_SERVICE_TYPE: string = "rostify";
    const FALLBACK_DISCOVERY_TIMEOUT_MS: number = 5000;

    const ROSTIFY_SERVICE_TYPE: string = normaliseEnv<string>(Bun.env.ROSTIFY_SERVICE_TYPE, String) ?? FALLBACK_ROSTIFY_SERVICE_TYPE;
    const DISCOVERY_TIMEOUT   : number = normaliseEnv<number>(Bun.env.DISCOVERY_TIMEOUT_MS, Number) ?? FALLBACK_DISCOVERY_TIMEOUT_MS;

    const bonjour: Bonjour = new Bonjour();

    const browser: Browser = bonjour.find({
        type: ROSTIFY_SERVICE_TYPE,
        protocol: "tcp"
    });

    type T = Result<string, null>;

    const resolveFunction: Fn<[Fn<[T | PromiseLike<T>], void>], void> = (resolve: Fn<[T | PromiseLike<T>], void>): void => {
        let completed: boolean = false;
        let timer: ReturnType<typeof setTimeout>;

        const finish: Fn<[T], void> = (result: T): void => {
            if (completed) {
                return;
            }

            completed = true;

            clearTimeout(timer);

            browser.stop();
            bonjour.destroy();

            resolve(result);
        };

        const handleFoundRostifyInNetwork: Fn<[Service], void> = (service: Service): void => {
            const foundRostifyMessage: string = `An existing Rostify server was discovered: ${ service.name } (${ service.host }:${ service.port }).`;

            d.logger.error(foundRostifyMessage);

            finish(new Result<string, null>(
                true,
                foundRostifyMessage
            ));
        }

        const handleErrorDiscovering: Fn<[unknown], void> = (error: unknown): void => {
            const errorDiscoveringMessage: string = `Unable to perform Bonjour discovery: ${ String(error) }`;

            d.logger.error(errorDiscoveringMessage);

            finish(new Result<string, null>(
                true,
                errorDiscoveringMessage
            ));
        }

        browser.on("up", handleFoundRostifyInNetwork);
        browser.on("error", handleErrorDiscovering);

        timer = setTimeout(() => {
            d.logger.debug("There's no Rostify Server running here. This place is mine now. \\^0w0^/");

            void finish(new Result<string, null>(false, null))
        }, DISCOVERY_TIMEOUT);
    }

    return await new Promise<T>(resolveFunction);
}