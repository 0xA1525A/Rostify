import cluster from "node:cluster";
import os      from "node:os";
import process from "node:process";

import { Logger }       from "@service:logger/logger";
import { normaliseEnv } from "@service:env/env";

import { rostify } from "@:server";
import { Result } from "@lib:templates/result";
import { hasRostifyConqueredThisNetwork } from "@service:discovery/advertise";
import { Nullable } from "@lib:types/nullable";

async function main(): Promise<void> {
    const logger: Logger = new Logger();

    logger.info("Running pre-initialisation process...");

    if (cluster.isPrimary) {
        const isRostifyRunning: Result<string, null> = await hasRostifyConqueredThisNetwork({ logger });
        const error: Nullable<string> = isRostifyRunning.getData();

        if (error !== null) {
            logger.error(error);

            process.exitCode = 1;
            return;
        }

        const availableParallelism: number = os.availableParallelism();
        const maxInstanceCount    : number = normaliseEnv<number>(Bun.env.MAX_INSTANCE_COUNT, Number) ?? availableParallelism;
        const minInstanceCount    : number = normaliseEnv<number>(Bun.env.MAX_INSTANCE_COUNT, Number) ?? 1;

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