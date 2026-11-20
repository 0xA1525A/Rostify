import { Elysia } from "elysia";

import { toRouteHandler } from "@lib:templates/route_handler";
import {
    handleDeleteAllSchedulesOnDate,
    handleDeleteStaffScheduleOnDateByID,
    handleGetAllSchedulePreviews,
    handleGetAllSchedulesOnDate,
    handleGetAllStaffSchedules,
    handleGetStaffScheduleOnDateByID,
    handleUpdateStaffScheduleOnDateByID
} from "@service:business/schedules";

export const scheduleRoutes = new Elysia({ prefix: "/schedules" })
    .get("/", toRouteHandler(handleGetAllSchedulePreviews))
    .get("/date/:date", toRouteHandler(handleGetAllSchedulesOnDate))
    .get("/date/:date/:staffID", toRouteHandler(handleGetStaffScheduleOnDateByID))
    .get("/staff/:staffID", toRouteHandler(handleGetAllStaffSchedules))

    .patch("/date/:date/:staffID", toRouteHandler(handleUpdateStaffScheduleOnDateByID))

    .delete("/date/:date", toRouteHandler(handleDeleteAllSchedulesOnDate))
    .delete("/date/:date/:staffID", toRouteHandler(handleDeleteStaffScheduleOnDateByID));
