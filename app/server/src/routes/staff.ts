import { Elysia } from "elysia";

import type { Fn } from "@lib:types/fn";
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

type F = Fn<[unknown], unknown>;

export const staffRoutes = new Elysia({ prefix: "/staff" })
    .get("/",       handleGetAllStaffPreviews as F)
    .get("/emails", handleGetAllEmails        as F)
    .get("/tels",   handleGetAllTels          as F)
    .get("/availabilities", handleGetAllAvailabilities as F)
    .get("/availabilities/:date", handleGetAvailabilitiesByDate as F)
    .get("/search/:names", handleSearchStaffPreviewsByAnyName as F)

    .get("/relations", handleGetAllStaffRelationsToEverything as F)
    .get("/relations/staff", handleGetAllStaffRelationsToAllStaff as F)
    .get("/relations/shifts", handleGetAllStaffRelationsToAllShifts as F)
    .get("/relations/positions", handleGetAllStaffRelationsToAllPositions as F)

    .get("/:staffID", handleGetStaffByStaffID as F)
    .get("/:staffID/emails", handleGetEmailsByStaffID as F)
    .get("/:staffID/tels", handleGetTelsByStaffID as F)
    .get("/:staffID/availabilities", handleGetAvailabilitiesByStaffID as F)
    .get("/:staffID/availabilities/:date", handleGetAvailabilityByDateAndStaffID as F)
    .get("/:staffID/relations", handleGetStaffRelationToEverythingByStaffID as F)
    .get("/:staffID/relations/staff", handleGetStaffRelationsToAllStaffByStaffID as F)
    .get("/:staffID/relations/shifts", handleGetStaffRelationsToAllShiftsByStaffID as F)
    .get("/:staffID/relations/positions", handleGetStaffRelationsToAllPositionsByStaffID as F)

    .post("/", handleCreateStaff as F)
    .post("/emails", handleAddEmail as F)
    .post("/tels", handleAddTel as F)
    .post("/availabilities/:date", handleCreateAvailability as F)

    .post("/:staffID/relations/staff/:relatedStaffID", handleSetStaffRelationToStaff as F)
    .post("/:staffID/relations/shifts/:shiftID", handleSetStaffRelationToShift as F)
    .post("/:staffID/relations/positions/:positionID", handleSetStaffRelationToPosition as F)

    .patch("/:staffID", handleUpdateStaff as F)
    .patch("/emails", handleUpdateEmail as F)
    .patch("/tels", handleUpdateTel as F)
    .patch("/:staffID/availabilities/:date", handleUpdateAvailability as F)
    .patch("/:staffID/relations/staff/:relatedStaffID", handleSetStaffRelationToStaff as F)
    .patch("/:staffID/relations/shifts/:shiftID", handleSetStaffRelationToShift as F)
    .patch("/:staffID/relations/positions/:positionID", handleSetStaffRelationToPosition as F)

    .delete("/", handleDeleteAllStaff as F)
    .delete("/emails", handleDeleteAllEmails as F)
    .delete("/tels", handleDeleteAllTels as F)
    .delete("/availabilities", handleDeleteAllAvailabilities as F)
    .delete("/relations", handleDeleteAllStaffRelationsToEverything as F)
    .delete("/relations/staff", handleDeleteAllStaffRelationsToAllStaff as F)
    .delete("/relations/shifts", handleDeleteAllStaffRelationsToAllShifts as F)
    .delete("/relations/positions", handleDeleteAllStaffRelationsToAllPositions as F)
    .delete("/relations/staff/:staffID", handleDeleteAllStaffRelationsToStaffByStaffID as F)
    .delete("/relations/shifts/:shiftID", handleDeleteAllStaffRelationsToShiftByShiftID as F)
    .delete("/relations/positions/:positionID", handleDeleteAllStaffRelationsToPositionByPositionID as F)

    .delete("/:staffID", handleDeleteStaffByID as F)
    .delete("/:staffID/emails/:email", handleDeleteEmailByEmailAndStaffID as F)
    .delete("/:staffID/tels/:tel", handleDeleteTelByTelAndStaffID as F)
    .delete("/:staffID/availabilities", handleDeleteAvailabilityByStaffID as F)
    .delete("/:staffID/availabilities/:date", handleDeleteAvailabilityByDateAndStaffID as F)
    .delete("/:staffID/relations", handleDeleteStaffRelationToEverythingByStaffID as F)
    .delete("/:staffID/relations/staff", handleDeleteStaffRelationToAllStaffByStaffID as F)
    .delete("/:staffID/relations/shifts", handleDeleteStaffRelationToAllShiftsByStaffID as F)
    .delete("/:staffID/relations/positions", handleDeleteStaffRelationToAllPositionsByStaffID as F)
    .delete("/:staffID/relations/staff/:relatedStaffID", handleUnsetStaffRelationToStaffByStaffID as F)
    .delete("/:staffID/relations/shifts/:shiftID", handleUnsetStaffRelationToShiftByShiftID as F)
    .delete("/:staffID/relations/positions/:positionID", handleUnsetStaffRelationToPositionByPositionID as F);
