import { UUID } from "node:crypto";

import { SQL } from "bun";

import { Elysia } from "elysia";
import { cors }   from "@elysiajs/cors";

import type { Result } from "@lib:templates/result";

import { requestLogger } from "@plugin:request_logger";

import { connect }      from "@service:database/database";
import { Logger }       from "@service:logger/logger";
import { DateTime }     from "@service:datetime/datetime";
import { normaliseOption } from "@service:normaliser/normaliser";

import { healthRoutes }   from "@route:health";
import { authRoutes }     from "@route:auth";
import { staffRoutes }    from "@route:staff";
import { unitRoutes }     from "@route:units";
import { positionRoutes } from "@route:positions";
import { taskRoutes }     from "@route:tasks";
import { shiftRoutes }    from "@route:shifts";
import { rosterRoutes }   from "@route:rosters";
import { scheduleRoutes } from "@route:schedules";
import { positionConflictRoutes } from "@route:position_conflicts";

export interface EnvVariables {
    readonly HOST        : string;
    readonly PORT        : number;
    readonly DATABASE_URL: string;
}

export const DEFAULT_HOST: string = "localhost";
export const DEFAULT_PORT: number = 3_000;
export const WAIT_TIME_BEFORE_START_MS: number = 5_000;

export async function rostify(): Promise<void> {
    const logger: Logger = new Logger(new DateTime());
    const envs: EnvVariables = {
        HOST        : normaliseOption<string>(Bun.env.HOST, String)         ?? DEFAULT_HOST,
        PORT        : normaliseOption<number>(Bun.env.PORT, Number)         ?? DEFAULT_PORT,
        DATABASE_URL: normaliseOption<string>(Bun.env.DATABASE_URL, String) ?? ''
    };

    const id: UUID = crypto.randomUUID();

    logger.debug(`Rostify on ${ process.pid } is named "${ id }".`)

    logger.info("Initialising Rostify Server...");
    logger.debug("Preparing environment variables...");

    if (envs.HOST === undefined || envs.PORT === undefined || envs.DATABASE_URL === '') {
        logger.error("Invalid environment variable(s). `HOST`, `PORT`, and `DATABASE_URL` must be defined.");

        return;
    }

    logger.debug("Environment variables are ready.");
    logger.debug("Connecting to database...");

    const sql: Result<SQL | string> = await connect(envs.DATABASE_URL);

    if (!sql.isSuccess()) {
        logger.error(`Unable to connect to database: ${ sql.getData() }`);

        return;
    }

    logger.debug("Connected to database.");

    const allowOrigin: any = cors({ origin: true });
    const app        : any = new Elysia({ prefix: "/api" });
    const decorations: Record<string, any> = {
        sql        : sql.getData(),
        logger     : logger,
        hashOptions: {
            algorithm : "argon2id",
            memoryCost: normaliseOption<number>(Bun.env.HASHOPTS_MEMORY_COST, Number) ?? 8,
            timeCost  : normaliseOption<number>(Bun.env.HASHOPTS_TIME_COST, Number)   ?? 3,
        },
    };

    setTimeout(async (): Promise<void> => {
        await app
        .decorate(decorations)
        .use(allowOrigin)
        .use(requestLogger())
        .use(healthRoutes)
        .use(authRoutes)
        .use(staffRoutes)
        .use(unitRoutes)
        .use(positionRoutes)
        .use(taskRoutes)
        .use(shiftRoutes)
        .use(rosterRoutes)
        .use(scheduleRoutes)
        .use(positionConflictRoutes)
        .listen(envs.PORT);

        logger.info(`${ id } is listening to ${ envs.HOST }:${ envs.PORT }.`);
    }, WAIT_TIME_BEFORE_START_MS)
}