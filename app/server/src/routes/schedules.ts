import { Elysia } from "elysia";

import { Fn } from "@lib:types/fn";

export const scheduleRoutes = new Elysia({ prefix: "/schedule" })
    .get("/", handleGetAllSchedulePreviews as Fn<[any], any>)
    .get("/date/:date", handleGetAllSchedulesOnDate as Fn<[any], any>)
    .get("/date/:date/:staffID", handleGetStaffScheduleOnDateByID as Fn<[any], any>)
    .get("/staff/:staffID", handleGetAllStaffSchedules as Fn<[any], any>)

    .post("/date/:date/:staffID", handleCreateSchedule as Fn<[any], any>)

    .patch("/date/:date/:staffID", handleUpdateStaffScheduleOnDateByID as Fn<[any], any>)

    .delete("/", handleDeleteAllSchedules as Fn<[any], any>)
    .delete("/date/:date", handleDeleteAllSchedulesOnDate as Fn<[any], any>)
    .delete("/date/:date/:staffID", handleDeleteStaffScheduleOnDateByID as Fn<[any], any>)
    .delete("/staff/:staffID", handleDeleteAllStaffSchedules as Fn<[any], any>);