import type { ClockEvent, RosterRecord } from "@model:rosters";
import type { SchedulePosition, ScheduleTask } from "@model:schedules";
import type { Position } from "@model:positions";
import type { PositionConflict } from "@model:position_conflicts";
import type { Task } from "@model:tasks";
import type { StaffPositionRelation } from "@data:relations";
import type { StaffLoadProfile } from "@service:business/rosterer/types";

export type ScheduleConstraintCode =
    "missing-qualification" |
    "invalid-task" |
    "invalid-rating" |
    "understaffed" |
    "overstaffed" |
    "sum-proficiency-below-minimum" |
    "sum-proficiency-above-maximum" |
    "position-conflict" |
    "hard-position-conflict";

export type ScheduleConstraint = {
    code          : ScheduleConstraintCode,
    message       : string,
    rosterRecordID: number,
    dateTime      : string,
    positionID    : number | null
};

export type AssignedPosition = SchedulePosition & { staffID: string };

export type PunchForRecord = {
    rosterRecordID: number,
    dateTime      : string,
    clockEvent    : ClockEvent
};

export type StaffInfo = {
    id         : string,
    isFullTime : boolean
};

export type HistoricalPositionAssignment = {
    staffID   : string,
    dateTime  : string,
    positionID: number
};

export type SchedulerInput = {
    records         : Array<RosterRecord>,
    punches         : Array<PunchForRecord>,
    positions       : Array<Position>,
    relations       : Array<StaffPositionRelation>,
    staff           : Array<StaffInfo>,
    conflicts       : Array<PositionConflict>,
    loadProfiles    : Array<StaffLoadProfile>,
    history         : Array<HistoricalPositionAssignment>,
    tasks           : Array<Task>,
    fairnessTolerance?: number,
    random          ?: () => number
};

export type SchedulerOutput = {
    positions : Array<SchedulePosition>,
    tasks     : Array<ScheduleTask>,
    violations: Array<ScheduleConstraint>
};
