import { Elysia } from "elysia";

import { toRouteHandler } from "@lib:templates/route_handler";

import { handleGetHealth } from "@service:health/health";

export const healthRoutes = new Elysia({ prefix: "/health" })
    .get("/", toRouteHandler(handleGetHealth));