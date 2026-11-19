import { Elysia } from "elysia";

import type { Fn } from "@lib:types/fn";
import {
    handleCreateRoster,
    handleDeleteAllRosters,
    handleDeleteAllRostersOnDate,
    handleDeleteAllStaffRostersByID,
    handleDeleteStaffRosterOnDateByID,
    handleGetAllRosters,
    handleGetAllRostersOnDate,
    handleGetAllStaffRostersByID,
    handleGetStaffRosterOnDateByID,
    handleUpdateStaffRosterOnDateByID
} from "@service:business/rosters";

type F = Fn<[unknown], unknown>;

export const rosterRoutes = new Elysia({ prefix: "/rosters" })
    .get("/", handleGetAllRosters as F)
    .get("/date/:date", handleGetAllRostersOnDate as F)
    .get("/date/:date/:staffID", handleGetStaffRosterOnDateByID as F)
    .get("/staff/:staffID", handleGetAllStaffRostersByID as F)

    .post("/date/:date/:staffID", handleCreateRoster as F)

    .patch("/date/:date/:staffID", handleUpdateStaffRosterOnDateByID as F)

    .delete("/", handleDeleteAllRosters as F)
    .delete("/date/:date", handleDeleteAllRostersOnDate as F)
    .delete("/date/:date/:staffID", handleDeleteStaffRosterOnDateByID as F)
    .delete("/staff/:staffID", handleDeleteAllStaffRostersByID as F);
