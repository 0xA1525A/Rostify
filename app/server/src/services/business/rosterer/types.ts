import type { ClockEvent, RosterRecord } from "@model:rosters";
import type { Shift } from "@model:shifts";
import type { StaffAvailability } from "@model:staff";
import type { StaffPeerRelation, StaffShiftRelation } from "@data:relations";

export type RosterConstraintCode =
    "invalid-rating" |
    "incomplete-availability" |
    "conflicting-availability" |
    "invalid-to-date" |
    "invalid-preference" |
    "unavailable" |
    "overtime-not-allowed" |
    "close-then-open" |
    "non-gradual-open-rotation" |
    "insufficient-rest" |
    "too-many-consecutive-days" |
    "duplicate-record";

export type RosterConstraint = {
    code   : RosterConstraintCode,
    message: string,
    staffID: string
};

export type StaffInfo = {
    id         : string,
    isFullTime : boolean
};

export type HistoricalAssignment = {
    date        : string,
    staffID     : string,
    physicalLoad: number,
    mentalLoad  : number,
    riskLevel   : number,
    hours       : number
};

export type StaffLoadProfile = {
    staffID           : string,
    averagePhysicalLoad: number,
    averageMentalLoad  : number,
    averageRiskLevel   : number,
    averageHours       : number,
    assignmentCount    : number
};

export type RosterGenerationInput = {
    date            : string,
    availabilities  : Array<StaffAvailability>,
    shifts          : Array<Shift>,
    shiftRelations  : Array<StaffShiftRelation>,
    peerRelations   : Array<StaffPeerRelation>,
    staff           : Array<StaffInfo>,
    previousRecords : Array<RosterRecord & { shift: Shift }>,
    history         : Array<HistoricalAssignment>,
    isHoliday       ?: boolean,
    fairnessTolerance?: number,
    random          ?: () => number
};

export type PendingPunch = {
    recordKey : string,
    dateTime  : string,
    clockEvent: ClockEvent
};

export type RosterGenerationOutput = {
    records     : Array<Omit<RosterRecord, "id">>,
    punches     : Array<PendingPunch>,
    loadProfiles: Array<StaffLoadProfile>,
    constraints : Array<RosterConstraint>
};

export type ShiftWithID = Shift;
