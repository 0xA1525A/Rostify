import type { StaffPositionRelation } from "@data:relations";
import type { SchedulePosition, ScheduleTask } from "@model:schedules";

export type ScheduleConstraintCode =
    "missing-qualification" |
    "invalid-task" |
    "invalid-rating";

export type ScheduleConstraint = {
    code          : ScheduleConstraintCode,
    message       : string,
    rosterRecordID: number
};

export function validateRating(value: number): boolean {
    return Number.isInteger(value) && value >= 0 && value <= 5;
}

export type AssignedPosition = SchedulePosition & { staffID: string };

export function checkPositionAssignment(
    position: AssignedPosition,
    relations: Array<StaffPositionRelation>
): Array<ScheduleConstraint> {
    if (position.positionID === null) { // a null position represents a break
        return [];
    }

    const qualified: StaffPositionRelation | undefined = relations.find(
        (relation: StaffPositionRelation): boolean =>
            relation.staffID === position.staffID &&
            relation.positionID === position.positionID &&
            validateRating(relation.proficiency) &&
            relation.proficiency > 0
    );

    if (qualified === undefined) {
        return [{
            code          : "missing-qualification",
            message       : "The assigned staff member is not qualified for this position.",
            rosterRecordID: position.rosterRecordID
        }];
    }

    return [];
}

export function checkTaskAssignment(task: ScheduleTask): Array<ScheduleConstraint> {
    if (!Number.isInteger(task.taskID) || task.taskID < 1) {
        return [{
            code          : "invalid-task",
            message       : "A schedule task must reference an existing task.",
            rosterRecordID: task.rosterRecordID
        }];
    }

    return [];
}

export function checkScheduleConstraints(input: {
    positions: Array<AssignedPosition>,
    tasks    : Array<ScheduleTask>,
    relations: Array<StaffPositionRelation>
}): Array<ScheduleConstraint> {
    const constraints: Array<ScheduleConstraint> = [];

    input.positions.forEach((position: AssignedPosition): void => {
        constraints.push(...checkPositionAssignment(position, input.relations));
    });
    input.tasks.forEach((task: ScheduleTask): void => {
        constraints.push(...checkTaskAssignment(task));
    });

    return constraints;
}
