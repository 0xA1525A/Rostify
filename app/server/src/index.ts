import cluster from "node:cluster";
import os      from "node:os";

import { rostify } from "@:server";

import type { Result }  from "@lib:templates/result";
import type { Nullable } from "@lib:types/nullable";

import { Logger }          from "@service:logger/logger";
import { normaliseOption } from "@service:normaliser/normaliser";
import { discoverRostifyOnNetwork } from "@service:discovery/discover";
import { advertiseRostifyOnNetwork, type RostifyAdvertisement } from "@service:discovery/advertise";

const FALLBACK_PORT: number = 3000;

async function main(): Promise<void> {
    const logger: Logger = new Logger();

    logger.info("Running pre-initialisation process...");

    if (cluster.isPrimary) {
        const isRostifyRunning: Result<string> = await discoverRostifyOnNetwork({ logger });
        const error           : Nullable<string> = isRostifyRunning.getData();

        if (error !== null) {
            return;
        }

        const port: number = normaliseOption<number>(Bun.env.PORT, Number.parseInt) ?? FALLBACK_PORT;

        const advertiseResult: Result<RostifyAdvertisement | string> = await advertiseRostifyOnNetwork({
            logger: logger,
            port: port,
            serverID: crypto.randomUUID()
        });

        if (!advertiseResult.isSuccess()) {
            return;
        }

        const availableParallelism: number = os.availableParallelism();
        const maxInstanceCount    : number = normaliseOption<number>(Bun.env.MAX_INSTANCE_COUNT, Number) ?? availableParallelism;
        const minInstanceCount    : number = normaliseOption<number>(Bun.env.MAX_INSTANCE_COUNT, Number) ?? 1;

        const instanceToInitialise: number  = Math.max(Math.min(availableParallelism, maxInstanceCount), minInstanceCount);
        const useSingularNoun     : boolean = instanceToInitialise === 1;

        logger.debug(`Launching ${ instanceToInitialise } Rostify Server ${ useSingularNoun ? "instance" : "instances" }...`);

        for (let instance: number = 1; instance < instanceToInitialise; instance += 1) {
            cluster.fork();
        }
    }

    await rostify();
}

(async (): Promise<void> => await main())();