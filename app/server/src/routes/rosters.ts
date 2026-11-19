import { Elysia } from "elysia";

import type { Fn } from "@lib:types/fn";
import {
    handleDeleteRosterByDate,
    handleDeleteStaffRosterByDate,
    handleGenerateRoster,
    handleGetAllRosters,
    handleGetAllRostersOnDate,
    handleGetStaffRosterOnDateByID,
    handleMoveStaffRoster
} from "@service:business/rosters";

type F = Fn<[unknown], unknown>;

export const rosterRoutes = new Elysia({ prefix: "/rosters" })
    // Static generation route first so it cannot be captured by `/:date`.
    .post("/generate/:date", handleGenerateRoster as F)

    .get("/", handleGetAllRosters as F)
    .get("/:date", handleGetAllRostersOnDate as F)
    .get("/:date/:staffID", handleGetStaffRosterOnDateByID as F)

    .patch("/:date/:staffID", handleMoveStaffRoster as F)

    .delete("/:date", handleDeleteRosterByDate as F)
    .delete("/:date/:staffID", handleDeleteStaffRosterByDate as F);
