import { Result } from "@lib:templates/result";

import type { StaffShiftRelation } from "@data:relations";
import type { RosterRecord } from "@model:rosters";
import type { StaffAvailability } from "@model:staff";

import { checkAvailabilityConstraints } from "@service:business/rosterer/constraints";

export function generateRoster(
    date: string,
    availabilities: Array<StaffAvailability>,
    shiftRelations: Array<StaffShiftRelation>,
    fallbackShiftID: number
): Result<Array<Omit<RosterRecord, "id">>> {
    const records: Array<Omit<RosterRecord, "id">> = [];
    const assignedStaff: Set<string> = new Set<string>();

    availabilities.forEach((availability: StaffAvailability): void => {
        if (availability.date !== date || assignedStaff.has(availability.staffID)) {
            return;
        }

        if (checkAvailabilityConstraints(availability).length !== 0) {
            return;
        }

        assignedStaff.add(availability.staffID);

        const candidates: Array<StaffShiftRelation> = shiftRelations
            .filter((relation: StaffShiftRelation): boolean => relation.staffID === availability.staffID)
            .sort((a: StaffShiftRelation, b: StaffShiftRelation): number =>
                (b.preference + b.proficiency) - (a.preference + a.proficiency)
            );

        const shiftID: number = candidates.length === 0 ? fallbackShiftID : candidates[0].shiftID;

        records.push({
            date   : date,
            staffID: availability.staffID,
            shiftID: shiftID
        });
    });

    return new Result<Array<Omit<RosterRecord, "id">>>(true, records);
}
