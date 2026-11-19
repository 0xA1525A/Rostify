import type { StaffPeerRelation, StaffShiftRelation } from "@data:relations";
import type { StaffAvailability } from "@model:staff";

export type RosterConstraintCode =
    "invalid-rating" |
    "incomplete-availability" |
    "conflicting-availability" |
    "invalid-to-date" |
    "invalid-preference";

export type RosterConstraint = {
    code   : RosterConstraintCode,
    message: string,
    staffID: string
};

export function validateRating(value: number): boolean {
    return Number.isInteger(value) && value >= 0 && value <= 5;
}

export function checkAvailabilityConstraints(availability: StaffAvailability): Array<RosterConstraint> {
    const constraints: Array<RosterConstraint> = [];
    const staffID: string = availability.staffID;
    const hasTimes: boolean = availability.fromTime !== null || availability.toTime !== null || availability.toDate !== null;

    if (availability.isFlexible === hasTimes) {
        constraints.push({
            code   : "conflicting-availability",
            message: "Availability flexibility conflicts with its specified time range.",
            staffID: staffID
        });
    }

    if (availability.toDate !== null && availability.toTime === null) {
        constraints.push({
            code   : "invalid-to-date",
            message: "An end date requires an end time.",
            staffID: staffID
        });
    }

    if (availability.preferredHour !== null && availability.preferredHour < 1) {
        constraints.push({
            code   : "invalid-preference",
            message: "Preferred hour must be at least one.",
            staffID: staffID
        });
    }

    if (availability.preferredBreakHour !== null && availability.preferredBreakHour < 1) {
        constraints.push({
            code   : "invalid-preference",
            message: "Preferred break hour must be at least one.",
            staffID: staffID
        });
    }

    return constraints;
}

export function checkShiftRelationConstraints(relation: StaffShiftRelation): Array<RosterConstraint> {
    const constraints: Array<RosterConstraint> = [];

    if (!validateRating(relation.preference) || !validateRating(relation.proficiency)) {
        constraints.push({
            code   : "invalid-rating",
            message: "Shift preference and proficiency must be between 0 and 5.",
            staffID: relation.staffID
        });
    }

    return constraints;
}

export function checkPeerRelationConstraints(relation: StaffPeerRelation): Array<RosterConstraint> {
    const constraints: Array<RosterConstraint> = [];

    if (!validateRating(relation.preference)) {
        constraints.push({
            code   : "invalid-rating",
            message: "Peer preference must be between 0 and 5.",
            staffID: relation.staffAID
        });
    }

    if (relation.staffAID === relation.staffBID) {
        constraints.push({
            code   : "invalid-preference",
            message: "A staff member cannot have a peer relation with themselves.",
            staffID: relation.staffAID
        });
    }

    return constraints;
}

export function checkRosterConstraints(input: {
    availabilities: Array<StaffAvailability>,
    shiftRelations: Array<StaffShiftRelation>,
    peerRelations : Array<StaffPeerRelation>
}): Array<RosterConstraint> {
    const constraints: Array<RosterConstraint> = [];

    input.availabilities.forEach((availability: StaffAvailability): void => {
        constraints.push(...checkAvailabilityConstraints(availability));
    });
    input.shiftRelations.forEach((relation: StaffShiftRelation): void => {
        constraints.push(...checkShiftRelationConstraints(relation));
    });
    input.peerRelations.forEach((relation: StaffPeerRelation): void => {
        constraints.push(...checkPeerRelationConstraints(relation));
    });

    return constraints;
}
