import { Elysia } from "elysia";

import { toRouteHandler } from "@lib:templates/route_handler";
import { handleCreateStaff, handleDeleteAllStaff, handleDeleteStaffByID, handleGetAllStaffPreviews, handleGetStaffByStaffID, handleSearchStaffPreviewsByAnyName, handleUpdateStaff } from "@service:business/staff/staff";
import { handleAddEmail, handleDeleteAllEmails, handleDeleteEmailByEmailAndStaffID, handleGetAllEmails, handleGetEmailsByStaffID, handleUpdateEmail } from "@service:business/staff/contacts/emails";
import { handleAddTel, handleDeleteAllTels, handleDeleteTelByTelAndStaffID, handleGetAllTels, handleGetTelsByStaffID, handleUpdateTel } from "@service:business/staff/contacts/tels";
import {
    handleCreateAvailability,
    handleDeleteAllAvailabilities,
    handleDeleteAvailabilityByDateAndStaffID,
    handleDeleteAvailabilityByStaffID,
    handleGetAllAvailabilities,
    handleGetAvailabilityByDateAndStaffID,
    handleGetAvailabilitiesByDate,
    handleGetAvailabilitiesByStaffID,
    handleUpdateAvailability
} from "@service:business/staff/availabilities/availabilities";
import {
    handleDeleteAllStaffRelationsToEverything,
    handleDeleteStaffRelationToEverythingByStaffID,
    handleGetAllStaffRelationsToEverything,
    handleGetStaffRelationToEverythingByStaffID
} from "@service:business/staff/relations/to_everything";
import {
    handleDeleteAllStaffRelationsToAllStaff,
    handleDeleteAllStaffRelationsToStaffByStaffID,
    handleDeleteStaffRelationToAllStaffByStaffID,
    handleGetAllStaffRelationsToAllStaff,
    handleGetStaffRelationsToAllStaffByStaffID,
    handleSetStaffRelationToStaff,
    handleUnsetStaffRelationToStaffByStaffID
} from "@service:business/staff/relations/to_staff";
import {
    handleDeleteAllStaffRelationsToAllShifts,
    handleDeleteAllStaffRelationsToShiftByShiftID,
    handleDeleteStaffRelationToAllShiftsByStaffID,
    handleGetAllStaffRelationsToAllShifts,
    handleGetStaffRelationsToAllShiftsByStaffID,
    handleSetStaffRelationToShift,
    handleUnsetStaffRelationToShiftByShiftID
} from "@service:business/staff/relations/to_shifts";
import {
    handleDeleteAllStaffRelationsToAllPositions,
    handleDeleteAllStaffRelationsToPositionByPositionID,
    handleDeleteStaffRelationToAllPositionsByStaffID,
    handleGetAllStaffRelationsToAllPositions,
    handleGetStaffRelationsToAllPositionsByStaffID,
    handleSetStaffRelationToPosition,
    handleUnsetStaffRelationToPositionByPositionID
} from "@service:business/staff/relations/to_positions";

export const staffRoutes = new Elysia({ prefix: "/staff" })
    .get("/",       toRouteHandler(handleGetAllStaffPreviews))
    .get("/emails", toRouteHandler(handleGetAllEmails))
    .get("/tels",   toRouteHandler(handleGetAllTels))
    .get("/availabilities", toRouteHandler(handleGetAllAvailabilities))
    .get("/availabilities/:date", toRouteHandler(handleGetAvailabilitiesByDate))
    .get("/search/:names", toRouteHandler(handleSearchStaffPreviewsByAnyName))

    .get("/relations", toRouteHandler(handleGetAllStaffRelationsToEverything))
    .get("/relations/staff", toRouteHandler(handleGetAllStaffRelationsToAllStaff))
    .get("/relations/shifts", toRouteHandler(handleGetAllStaffRelationsToAllShifts))
    .get("/relations/positions", toRouteHandler(handleGetAllStaffRelationsToAllPositions))

    .get("/:staffID", toRouteHandler(handleGetStaffByStaffID))
    .get("/:staffID/emails", toRouteHandler(handleGetEmailsByStaffID))
    .get("/:staffID/tels", toRouteHandler(handleGetTelsByStaffID))
    .get("/:staffID/availabilities", toRouteHandler(handleGetAvailabilitiesByStaffID))
    .get("/:staffID/availabilities/:date", toRouteHandler(handleGetAvailabilityByDateAndStaffID))
    .get("/:staffID/relations", toRouteHandler(handleGetStaffRelationToEverythingByStaffID))
    .get("/:staffID/relations/staff", toRouteHandler(handleGetStaffRelationsToAllStaffByStaffID))
    .get("/:staffID/relations/shifts", toRouteHandler(handleGetStaffRelationsToAllShiftsByStaffID))
    .get("/:staffID/relations/positions", toRouteHandler(handleGetStaffRelationsToAllPositionsByStaffID))

    .post("/", toRouteHandler(handleCreateStaff))
    .post("/emails", toRouteHandler(handleAddEmail))
    .post("/tels", toRouteHandler(handleAddTel))
    .post("/availabilities/:date", toRouteHandler(handleCreateAvailability))

    .post("/:staffID/relations/staff/:relatedStaffID", toRouteHandler(handleSetStaffRelationToStaff))
    .post("/:staffID/relations/shifts/:shiftID", toRouteHandler(handleSetStaffRelationToShift))
    .post("/:staffID/relations/positions/:positionID", toRouteHandler(handleSetStaffRelationToPosition))

    .patch("/:staffID", toRouteHandler(handleUpdateStaff))
    .patch("/emails", toRouteHandler(handleUpdateEmail))
    .patch("/tels", toRouteHandler(handleUpdateTel))
    .patch("/:staffID/availabilities/:date", toRouteHandler(handleUpdateAvailability))
    .patch("/:staffID/relations/staff/:relatedStaffID", toRouteHandler(handleSetStaffRelationToStaff))
    .patch("/:staffID/relations/shifts/:shiftID", toRouteHandler(handleSetStaffRelationToShift))
    .patch("/:staffID/relations/positions/:positionID", toRouteHandler(handleSetStaffRelationToPosition))

    .delete("/", toRouteHandler(handleDeleteAllStaff))
    .delete("/emails", toRouteHandler(handleDeleteAllEmails))
    .delete("/tels", toRouteHandler(handleDeleteAllTels))
    .delete("/availabilities", toRouteHandler(handleDeleteAllAvailabilities))
    .delete("/relations", toRouteHandler(handleDeleteAllStaffRelationsToEverything))
    .delete("/relations/staff", toRouteHandler(handleDeleteAllStaffRelationsToAllStaff))
    .delete("/relations/shifts", toRouteHandler(handleDeleteAllStaffRelationsToAllShifts))
    .delete("/relations/positions", toRouteHandler(handleDeleteAllStaffRelationsToAllPositions))
    .delete("/relations/staff/:staffID", toRouteHandler(handleDeleteAllStaffRelationsToStaffByStaffID))
    .delete("/relations/shifts/:shiftID", toRouteHandler(handleDeleteAllStaffRelationsToShiftByShiftID))
    .delete("/relations/positions/:positionID", toRouteHandler(handleDeleteAllStaffRelationsToPositionByPositionID))

    .delete("/:staffID", toRouteHandler(handleDeleteStaffByID))
    .delete("/:staffID/emails/:email", toRouteHandler(handleDeleteEmailByEmailAndStaffID))
    .delete("/:staffID/tels/:tel", toRouteHandler(handleDeleteTelByTelAndStaffID))
    .delete("/:staffID/availabilities", toRouteHandler(handleDeleteAvailabilityByStaffID))
    .delete("/:staffID/availabilities/:date", toRouteHandler(handleDeleteAvailabilityByDateAndStaffID))
    .delete("/:staffID/relations", toRouteHandler(handleDeleteStaffRelationToEverythingByStaffID))
    .delete("/:staffID/relations/staff", toRouteHandler(handleDeleteStaffRelationToAllStaffByStaffID))
    .delete("/:staffID/relations/shifts", toRouteHandler(handleDeleteStaffRelationToAllShiftsByStaffID))
    .delete("/:staffID/relations/positions", toRouteHandler(handleDeleteStaffRelationToAllPositionsByStaffID))
    .delete("/:staffID/relations/staff/:relatedStaffID", toRouteHandler(handleUnsetStaffRelationToStaffByStaffID))
    .delete("/:staffID/relations/shifts/:shiftID", toRouteHandler(handleUnsetStaffRelationToShiftByShiftID))
    .delete("/:staffID/relations/positions/:positionID", toRouteHandler(handleUnsetStaffRelationToPositionByPositionID));
