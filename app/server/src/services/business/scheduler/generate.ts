import { Result } from "@lib:templates/result";

import type { StaffPositionRelation } from "@data:relations";
import type { RosterRecord } from "@model:rosters";
import type { SchedulePosition } from "@model:schedules";

export type ScheduleSlot = {
    dateTime  : string,
    positionID: number | null // null represents a break
};

export function generateSchedule(
    records: Array<RosterRecord>,
    relations: Array<StaffPositionRelation>,
    slots: Array<ScheduleSlot>
): Result<Array<SchedulePosition>> {
    const assignments: Array<SchedulePosition> = [];
    const usedSlots: Set<string> = new Set<string>();

    slots.forEach((slot: ScheduleSlot): void => {
        let bestRecord: RosterRecord | undefined;
        let bestScore: number = -1;

        records.forEach((record: RosterRecord): void => {
            const key: string = `${ record.id }|${ slot.dateTime }`;

            if (usedSlots.has(key)) {
                return;
            }

            if (slot.positionID === null) {
                if (bestRecord === undefined) {
                    bestRecord = record;
                    bestScore = 0;
                }

                return;
            }

            const score: number = relations
                .filter((relation: StaffPositionRelation): boolean =>
                    relation.staffID === record.staffID &&
                    relation.positionID === slot.positionID
                )
                .reduce((total: number, relation: StaffPositionRelation): number => total + relation.preference + relation.proficiency, 0);

            if (score > bestScore) {
                bestRecord = record;
                bestScore = score;
            }
        });

        if (bestRecord === undefined) {
            return;
        }

        usedSlots.add(`${ bestRecord.id }|${ slot.dateTime }`);

        assignments.push({
            rosterRecordID: bestRecord.id,
            dateTime      : slot.dateTime,
            positionID    : slot.positionID
        });
    });

    return new Result<Array<SchedulePosition>>(true, assignments);
}
