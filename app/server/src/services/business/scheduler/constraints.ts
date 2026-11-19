import type { Position } from "@model:positions";
import type { PositionConflict } from "@model:position_conflicts";
import type { StaffPositionRelation } from "@data:relations";

import type {
    AssignedPosition,
    ScheduleConstraint,
    ScheduleConstraintCode
} from "@service:business/scheduler/types";

export function validateRating(value: number): boolean {
    return Number.isInteger(value) && value >= 0 && value <= 5;
}

function violation(
    code: ScheduleConstraintCode,
    message: string,
    position: AssignedPosition
): ScheduleConstraint {
    return {
        code          : code,
        message       : message,
        rosterRecordID: position.rosterRecordID,
        dateTime      : position.dateTime,
        positionID    : position.positionID
    };
}

export function findPositionRelation(
    staffID: string,
    positionID: number,
    relations: Array<StaffPositionRelation>
): StaffPositionRelation | undefined {
    return relations.find(
        (relation): boolean => relation.staffID === staffID && relation.positionID === positionID
    );
}

export function isQualified(
    staffID: string,
    positionID: number,
    relations: Array<StaffPositionRelation>
): boolean {
    const relation: StaffPositionRelation | undefined = findPositionRelation(staffID, positionID, relations);

    return relation !== undefined && validateRating(relation.proficiency) && relation.proficiency > 0;
}

export function checkPositionAssignment(
    position: AssignedPosition,
    relations: Array<StaffPositionRelation>
): Array<ScheduleConstraint> {
    if (position.positionID === null) {
        return [];
    }

    const constraints: Array<ScheduleConstraint> = [];
    const relation: StaffPositionRelation | undefined = findPositionRelation(
        position.staffID,
        position.positionID,
        relations
    );

    if (relation === undefined || !validateRating(relation.proficiency) || relation.proficiency === 0) {
        constraints.push(violation(
            "missing-qualification",
            "A zero or missing proficiency means the staff member must not be assigned to this position.",
            position
        ));
    }

    if (relation !== undefined && !validateRating(relation.preference)) {
        constraints.push(violation("invalid-rating", "Position preference must be between 0 and 5.", position));
    }

    return constraints;
}

export function findConflict(
    fromPositionID: number,
    toPositionID: number,
    conflicts: Array<PositionConflict>
): PositionConflict | undefined {
    return conflicts.find(
        (conflict): boolean =>
            conflict.positionAID === fromPositionID && conflict.positionBID === toPositionID
    );
}

function findActiveConflict(
    previousPositionID: number,
    previousDateTime: string,
    nextPositionID: number,
    nextDateTime: string,
    conflicts: Array<PositionConflict>
): PositionConflict | undefined {
    const conflict: PositionConflict | undefined = findConflict(previousPositionID, nextPositionID, conflicts);

    if (conflict === undefined) {
        return undefined;
    }

    const elapsedHours: number = (new Date(nextDateTime).getTime() - new Date(previousDateTime).getTime()) / 3_600_000;

    if (elapsedHours < 0 || elapsedHours > conflict.conflictDurationHr) {
        return undefined;
    }

    return conflict;
}

export function getActiveConflictSeverity(
    previousPositionID: number,
    previousDateTime: string,
    next: AssignedPosition,
    conflicts: Array<PositionConflict>
): number {
    if (next.positionID === null) {
        return 0;
    }

    const conflict: PositionConflict | undefined = findActiveConflict(
        previousPositionID,
        previousDateTime,
        next.positionID,
        next.dateTime,
        conflicts
    );

    return conflict?.severity ?? 0;
}

export function checkPositionConflict(
    previousPositionID: number,
    previousDateTime: string,
    next: AssignedPosition,
    conflicts: Array<PositionConflict>
): Array<ScheduleConstraint> {
    if (next.positionID === null) {
        return [];
    }

    const conflict: PositionConflict | undefined = findActiveConflict(
        previousPositionID,
        previousDateTime,
        next.positionID,
        next.dateTime,
        conflicts
    );

    if (conflict === undefined) {
        return [];
    }

    const code: ScheduleConstraintCode = conflict.severity === 5 ? "hard-position-conflict" : "position-conflict";

    return [violation(code, `Severity ${ conflict.severity } conflict between positions.`, next)];
}

export function checkStaffingLevels(
    counts: Map<number, number>,
    positions: Array<Position>,
    sample: AssignedPosition
): Array<ScheduleConstraint> {
    const constraints: Array<ScheduleConstraint> = [];

    for (const position of positions) {
        const count: number = counts.get(position.id) ?? 0;

        if (count < position.minimumStaff) {
            constraints.push(violation(
                "understaffed",
                `Position ${ position.id } is below its minimum staff count.`,
                { ...sample, positionID: position.id }
            ));
        }

        if (count > position.maximumStaff) {
            constraints.push(violation(
                "overstaffed",
                `Position ${ position.id } exceeds its maximum staff count.`,
                { ...sample, positionID: position.id }
            ));
        }
    }

    return constraints;
}

export function checkSumProficiency(
    sums: Map<number, number>,
    positions: Array<Position>,
    sample: AssignedPosition
): Array<ScheduleConstraint> {
    const constraints: Array<ScheduleConstraint> = [];

    for (const position of positions) {
        const sum: number = sums.get(position.id) ?? 0;

        if (position.minimumSumProficiency !== null && sum < position.minimumSumProficiency) {
            constraints.push(violation(
                "sum-proficiency-below-minimum",
                `Position ${ position.id } is below its minimum sum of proficiency.`,
                { ...sample, positionID: position.id }
            ));
        }

        if (position.maximumSumProficiency !== null && sum > position.maximumSumProficiency) {
            constraints.push(violation(
                "sum-proficiency-above-maximum",
                `Position ${ position.id } exceeds its maximum sum of proficiency.`,
                { ...sample, positionID: position.id }
            ));
        }
    }

    return constraints;
}
