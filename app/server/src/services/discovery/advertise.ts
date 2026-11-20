import {
         Bonjour,
    type Service,
}
from "bonjour-service";

import      { Result } from "@lib:templates/result";
import type { Fn }     from "@lib:types/fn";

import      { normaliseOption } from "@service:normaliser/normaliser";
import type { Logger }          from "@service:logger/logger";

export interface AdvertisementDependencies {
    logger  : Logger;
    port    : number;
    serverID: string;
}

export interface RostifyAdvertisement {
    stop(): Promise<void>;
}

type StopService = (callback: () => void) => void;

function isStopService(value: unknown): value is StopService {
    return typeof value === "function";
}

export async function advertiseRostifyOnNetwork(
    d: AdvertisementDependencies
): Promise<Result<RostifyAdvertisement | string>> {
    d.logger.debug("Advertising Rostify Server on the network...");

    const FALLBACK_ROSTIFY_SERVICE_TYPE    : string = "rostify";
    const FALLBACK_ADVERTISEMENT_TIMEOUT_MS: number = 5000;

    const ROSTIFY_SERVICE_TYPE : string = normaliseOption<string>(Bun.env.ROSTIFY_SERVICE_TYPE, String) ?? FALLBACK_ROSTIFY_SERVICE_TYPE;
    const ADVERTISEMENT_TIMEOUT: number = normaliseOption<number>(Bun.env.ADVERTISEMENT_TIMEOUT_MS, Number) ?? FALLBACK_ADVERTISEMENT_TIMEOUT_MS;

    const bonjour: Bonjour = new Bonjour();

    const service: Service = bonjour.publish({
        name    : `rostify-server/${ d.serverID }`,
        type    : ROSTIFY_SERVICE_TYPE,
        protocol: "tcp",
        port    : d.port,
        txt     : {
            serverID: d.serverID
        }
    });

    let stopped: boolean = false;

    const stopAdvertisement: Fn<[], Promise<void>> = async (): Promise<void> => {
        if (stopped) {
            return;
        }

        stopped = true;

        await new Promise<void>((resolve) => {
            const stop: unknown = service.stop;

            if (!isStopService(stop)) {
                throw new TypeError("Service stop function is unavailable.");
            }

            stop.call(service, (): void => {
                bonjour.destroy();

                resolve();
            });
        });
    };

    type T = Result<RostifyAdvertisement | string>;

    const resolveFunction: Fn<[Fn<[T | PromiseLike<T>], void>], void> = (resolve: Fn<[T | PromiseLike<T>], void>): void => {
        let completed: boolean = false;
        let timer: ReturnType<typeof setTimeout> | null = null;

        const finish: Fn<[T], void> = (result: T): void => {
            if (completed) {
                return;
            }

            completed = true;

            if (timer !== null) {
                clearTimeout(timer);
            }

            if (!result.isSuccess()) {
                void stopAdvertisement().then(() => {
                    resolve(result);
                });

                return;
            }

            resolve(result);
        };

        const handleAdvertisementReady: Fn<[], void> = (): void => {
            d.logger.info(`Rostify Server is now advertised on the network (${ service.name }).`);

            const advertisement: RostifyAdvertisement = {
                stop: stopAdvertisement
            };

            finish(new Result<RostifyAdvertisement | string>(
                true,
                advertisement
            ));
        };

        const handleAdvertisementError: Fn<[unknown], void> = (error: unknown): void => {
            const errorAdvertisingMessage: string = `Unable to advertise Rostify Server: ${ String(error) }`;

            d.logger.error(errorAdvertisingMessage);

            finish(new Result<RostifyAdvertisement | string>(
                false,
                errorAdvertisingMessage
            ));
        };

        service.once("up", handleAdvertisementReady);
        service.once("error", handleAdvertisementError);

        timer = setTimeout(() => {
            const advertisementTimeoutMessage: string = "Timed out while advertising Rostify Server.";

            d.logger.error(advertisementTimeoutMessage);

            finish(new Result<RostifyAdvertisement | string>(
                false,
                advertisementTimeoutMessage
            ));
        }, ADVERTISEMENT_TIMEOUT);
    };

    return await new Promise<T>(resolveFunction);
}