import { Elysia } from "elysia";

import { toRouteHandler } from "@lib:templates/route_handler";
import {
    handleDeleteRosterByDate,
    handleDeleteStaffRosterByDate,
    handleGenerateRoster,
    handleGetAllRosters,
    handleGetAllRostersOnDate,
    handleGetStaffRosterOnDateByID,
    handleMoveStaffRoster
} from "@service:business/rosters";

export const rosterRoutes = new Elysia({ prefix: "/rosters" })
    .post("/generate/:date", toRouteHandler(handleGenerateRoster))

    .get("/", toRouteHandler(handleGetAllRosters))
    .get("/:date", toRouteHandler(handleGetAllRostersOnDate))
    .get("/:date/:staffID", toRouteHandler(handleGetStaffRosterOnDateByID))

    .patch("/:date/:staffID", toRouteHandler(handleMoveStaffRoster))

    .delete("/:date", toRouteHandler(handleDeleteRosterByDate))
    .delete("/:date/:staffID", toRouteHandler(handleDeleteStaffRosterByDate));
