import { Elysia } from "elysia";

import { Fn } from "@lib:types/fn";

export const rosterRoutes = new Elysia({ prefix: "/roster" })
    .get("/", handleGetAllRosters as Fn<[any], any>)
    .get("/date/:date", handleGetAllRostersOnDate as Fn<[any], any>)
    .get("/date/:date/:staffID", handleGetStaffRosterOnDateByID as Fn<[any], any>)
    .get("/staff/:staffID", handleGetAllStaffRostersByID as Fn<[any], any>)

    .post("/date/:date/:staffID", handleCreateRoster as Fn<[any], any>)

    .patch("/date/:date/:staffID", handleUpdateStaffRosterOnDateByID as Fn<[any], any>)

    .delete("/", handleDeleteAllRosters as Fn<[any], any>)
    .delete("/date/:date", handleDeleteAllRostersOnDate as Fn<[any], any>)
    .delete("/date/:date/:staffID", handleDeleteStaffRosterOnDateByID as Fn<[any], any>)
    .delete("/staff/:staffID", handleDeleteAllStaffRostersByID as Fn<[any], any>);