import { Elysia } from "elysia";

import type { Fn } from "@lib:types/fn";

import { handleGetHealth } from "@service:health/health";

export const healthRoutes = new Elysia({ prefix: "/health" })
    .get("/", handleGetHealth as Fn<[any], any>);