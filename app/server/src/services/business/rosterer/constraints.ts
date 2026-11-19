import type { Shift, ShiftName } from "@model:shifts";
import type { StaffAvailability } from "@model:staff";
import type { StaffPeerRelation, StaffShiftRelation } from "@data:relations";

import { shiftIndex, stepsTowardOpen } from "@service:business/rosterer/shift_order";
import type { RosterConstraint, RosterConstraintCode } from "@service:business/rosterer/types";

export function validateRating(value: number): boolean {
    return Number.isInteger(value) && value >= 0 && value <= 5;
}

function violation(code: RosterConstraintCode, message: string, staffID: string): RosterConstraint {
    return { code: code, message: message, staffID: staffID };
}

export function checkAvailabilityConstraints(availability: StaffAvailability): Array<RosterConstraint> {
    const constraints: Array<RosterConstraint> = [];
    const staffID: string = availability.staffID;
    const hasTimes: boolean = availability.fromTime !== null || availability.toTime !== null || availability.toDate !== null;

    if (availability.isFlexible === hasTimes) {
        constraints.push(violation(
            "conflicting-availability",
            "Availability flexibility conflicts with its specified time range.",
            staffID
        ));
    }

    if (availability.toDate !== null && availability.toTime === null) {
        constraints.push(violation("invalid-to-date", "An end date requires an end time.", staffID));
    }

    if (availability.preferredHour !== null && availability.preferredHour < 1) {
        constraints.push(violation("invalid-preference", "Preferred hour must be at least one.", staffID));
    }

    if (availability.preferredBreakHour !== null && availability.preferredBreakHour < 1) {
        constraints.push(violation("invalid-preference", "Preferred break hour must be at least one.", staffID));
    }

    return constraints;
}

export function checkShiftRelationConstraints(relation: StaffShiftRelation): Array<RosterConstraint> {
    const constraints: Array<RosterConstraint> = [];

    if (!validateRating(relation.preference) || !validateRating(relation.proficiency)) {
        constraints.push(violation(
            "invalid-rating",
            "Shift preference and proficiency must be between 0 and 5.",
            relation.staffID
        ));
    }

    return constraints;
}

export function checkPeerRelationConstraints(relation: StaffPeerRelation): Array<RosterConstraint> {
    const constraints: Array<RosterConstraint> = [];

    if (!validateRating(relation.preference)) {
        constraints.push(violation("invalid-rating", "Peer preference must be between 0 and 5.", relation.staffAID));
    }

    if (relation.staffAID === relation.staffBID) {
        constraints.push(violation(
            "invalid-preference",
            "A staff member cannot have a peer relation with themselves.",
            relation.staffAID
        ));
    }

    return constraints;
}

export function checkShiftTransition(
    previousShift: Shift | undefined,
    nextShift    : Shift,
    staffID      : string
): Array<RosterConstraint> {
    if (previousShift === undefined) {
        return [];
    }

    const previousName: ShiftName = previousShift.name;
    const nextName    : ShiftName = nextShift.name;
    const steps: number = stepsTowardOpen(previousName, nextName);

    if (previousName === "close" && nextName === "open") {
        return [violation(
            "close-then-open",
            "A closing shift cannot be followed by an opening shift the next day.",
            staffID
        )];
    }

    if (steps > 1) {
        return [violation(
            "non-gradual-open-rotation",
            "Rotation toward the opening shift may only move one step per day.",
            staffID
        )];
    }

    return [];
}

export function checkOvertimeAllowed(availability: StaffAvailability, shift: Shift): Array<RosterConstraint> {
    const constraints: Array<RosterConstraint> = [];

    if (availability.isFlexible === false && availability.toTime !== null && shift.toTime > availability.toTime && availability.okOvertime === false) {
        constraints.push(violation(
            "overtime-not-allowed",
            "The selected shift ends after the staff member's availability and overtime is not allowed.",
            availability.staffID
        ));
    }

    return constraints;
}

export function checkAvailabilityCoversShift(availability: StaffAvailability, shift: Shift): Array<RosterConstraint> {
    if (availability.isFlexible === true) {
        return [];
    }

    if (availability.fromTime !== null && shift.fromTime < availability.fromTime) {
        return [violation(
            "unavailable",
            "The selected shift starts before the staff member's availability.",
            availability.staffID
        )];
    }

    return [];
}

export function checkRosterConstraints(input: {
    availabilities: Array<StaffAvailability>,
    shiftRelations: Array<StaffShiftRelation>,
    peerRelations : Array<StaffPeerRelation>
}): Array<RosterConstraint> {
    const constraints: Array<RosterConstraint> = [];

    for (const availability of input.availabilities) {
        constraints.push(...checkAvailabilityConstraints(availability));
    }
    for (const relation of input.shiftRelations) {
        constraints.push(...checkShiftRelationConstraints(relation));
    }
    for (const relation of input.peerRelations) {
        constraints.push(...checkPeerRelationConstraints(relation));
    }

    return constraints;
}

export { shiftIndex, stepsTowardOpen };
