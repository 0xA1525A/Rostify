import { Result } from "@lib:templates/result";

import type { SchedulePosition } from "@model:schedules";

import { groupFromProfiles, directionsFromProfiles } from "@service:business/rosterer/load";
import {
    checkPositionAssignment,
    checkStaffingLevels,
    checkSumProficiency,
    findPositionRelation,
    getActiveConflictSeverity,
    isQualified
} from "@service:business/scheduler/constraints";

import type {
    AssignedPosition,
    HistoricalPositionAssignment,
    PunchForRecord,
    ScheduleConstraint,
    SchedulerInput,
    SchedulerOutput
} from "@service:business/scheduler/types";

const HOUR_MS: number = 60 * 60 * 1000;
const DEFAULT_FAIRNESS_TOLERANCE: number = 0.05;
const DAY_NAMES: ReadonlyArray<string> = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

type Interval = {
    recordID: number,
    staffID : string,
    start   : number,
    end     : number
};

type Slot = {
    dateTime: string,
    start   : number,
    active  : Array<Interval>
};

type BreakMarker = {
    recordID: number,
    staffID : string,
    dateTime: string
};

type LastAssignment = {
    positionID: number,
    dateTime  : string
};

type Candidate = {
    positionID: number,
    score     : number,
    severity  : number
};

function buildIntervals(
    records: SchedulerInput["records"],
    punches: Array<PunchForRecord>
): { intervals: Array<Interval>, breaks: Array<BreakMarker> } {
    const staffByRecord: Map<number, string> = new Map<number, string>();

    for (const record of records) {
        staffByRecord.set(record.id, record.staffID);
    }

    const punchesByRecord: Map<number, Array<PunchForRecord>> = new Map<number, Array<PunchForRecord>>();

    for (const punch of punches) {
        const existing: Array<PunchForRecord> = punchesByRecord.get(punch.rosterRecordID) ?? [];

        existing.push(punch);
        punchesByRecord.set(punch.rosterRecordID, existing);
    }

    const intervals: Array<Interval> = [];
    const breaks: Array<BreakMarker> = [];

    for (const [recordID, recordPunches] of punchesByRecord) {
        const staffID: string = staffByRecord.get(recordID) ?? "";
        const sorted: Array<PunchForRecord> = [...recordPunches].sort(
            (a, b): number => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
        );

        let open: number | null = null;

        for (const punch of sorted) {
            const timestamp: number = new Date(punch.dateTime).getTime();

            if (punch.clockEvent === "in" && open === null) {
                open = timestamp;
                continue;
            }

            if (punch.clockEvent === "out" && open !== null) {
                const previous: Interval | undefined = intervals[intervals.length - 1];

                if (previous !== undefined && previous.recordID === recordID && open > previous.end) {
                    breaks.push({
                        recordID: recordID,
                        staffID : staffID,
                        dateTime: new Date(previous.end).toISOString()
                    });
                }

                intervals.push({ recordID: recordID, staffID: staffID, start: open, end: timestamp });
                open = null;
            }
        }
    }

    return { intervals: intervals, breaks: breaks };
}

function buildSlots(intervals: Array<Interval>): Array<Slot> {
    const slots: Map<string, Slot> = new Map<string, Slot>();

    for (const interval of intervals) {
        for (let timestamp: number = interval.start; timestamp < interval.end; timestamp += HOUR_MS) {
            const dateTime: string = new Date(timestamp).toISOString();
            const slot: Slot = slots.get(dateTime) ?? { dateTime: dateTime, start: timestamp, active: [] };

            slot.active.push(interval);
            slots.set(dateTime, slot);
        }
    }

    return [...slots.values()].sort((a, b): number => a.start - b.start);
}

function seedLastAssignments(history: Array<HistoricalPositionAssignment>): Map<string, LastAssignment> {
    const last: Map<string, LastAssignment> = new Map<string, LastAssignment>();

    for (const assignment of history) {
        const current: LastAssignment | undefined = last.get(assignment.staffID);

        if (current === undefined || new Date(assignment.dateTime).getTime() > new Date(current.dateTime).getTime()) {
            last.set(assignment.staffID, {
                positionID: assignment.positionID,
                dateTime  : assignment.dateTime
            });
        }
    }

    return last;
}

function dayOf(date: string): string {
    const value: Date = new Date(`${ date }T00:00:00Z`);

    return DAY_NAMES[value.getUTCDay()] ?? "";
}

export function generateSchedule(input: SchedulerInput): Result<SchedulerOutput> {
    const random: () => number = input.random ?? Math.random;
    const tolerance: number = input.fairnessTolerance ?? DEFAULT_FAIRNESS_TOLERANCE;
    const analysis = groupFromProfiles(input.loadProfiles);
    const directions = directionsFromProfiles(input.loadProfiles, analysis, tolerance);
    const { intervals, breaks } = buildIntervals(input.records, input.punches);
    const slots: Array<Slot> = buildSlots(intervals);
    const lastByStaff: Map<string, LastAssignment> = seedLastAssignments(input.history);

    const assigned: Array<AssignedPosition> = [];
    const violations: Array<ScheduleConstraint> = [];
    const countsBySlot: Map<string, Map<number, number>> = new Map<string, Map<number, number>>();
    const sumsBySlot: Map<string, Map<number, number>> = new Map<string, Map<number, number>>();

    // When a target-staff position is full, move one existing member to their next
    // preferred eligible position instead of pushing the newcomer somewhere worse.
    function relocateOverflow(
        fullPositionID: number,
        slotTime: string,
        counts: Map<number, number>,
        sums: Map<number, number>
    ): boolean {
        const full: import("@model:positions").Position | undefined = input.positions.find(
            (item): boolean => item.id === fullPositionID
        );

        if (full === undefined || !full.isPrioritisingStaffAmount ||
            (counts.get(fullPositionID) ?? 0) < full.targetStaff) {
            return false;
        }

        const members: Array<AssignedPosition> = assigned.filter(
            (item): boolean => item.dateTime === slotTime && item.positionID === fullPositionID
        );

        members.sort((a, b): number => {
            const aPref: number = findPositionRelation(a.staffID, fullPositionID, input.relations)?.preference ?? 0;
            const bPref: number = findPositionRelation(b.staffID, fullPositionID, input.relations)?.preference ?? 0;

            return aPref - bPref;
        });

        for (const member of members) {
            let bestAltID: number | null = null;
            let bestAltSum: number = 0;
            let bestAltScore: number = Number.NEGATIVE_INFINITY;

            for (const alt of input.positions) {
                if (alt.id === fullPositionID || !isQualified(member.staffID, alt.id, input.relations)) {
                    continue;
                }

                const altCount: number = counts.get(alt.id) ?? 0;

                if (altCount >= alt.maximumStaff ||
                    (alt.isPrioritisingStaffAmount && altCount >= alt.targetStaff)) {
                    continue;
                }

                const relation = findPositionRelation(member.staffID, alt.id, input.relations);

                if (relation === undefined) {
                    continue;
                }

                const altSum: number = (sums.get(alt.id) ?? 0) + relation.proficiency;

                if (alt.maximumSumProficiency !== null && altSum > alt.maximumSumProficiency) {
                    continue;
                }

                const previous: LastAssignment | undefined = lastByStaff.get(member.staffID);

                if (previous !== undefined &&
                    getActiveConflictSeverity(previous.positionID, previous.dateTime, { ...member, positionID: alt.id }, input.conflicts) > 0) {
                    continue;
                }

                const score: number = relation.preference * 10 + relation.proficiency * 4 + random() / 1000;

                if (score > bestAltScore) {
                    bestAltScore = score;
                    bestAltID = alt.id;
                    bestAltSum = altSum;
                }
            }

            if (bestAltID !== null) {
                const oldRelation = findPositionRelation(member.staffID, fullPositionID, input.relations);

                if (oldRelation !== undefined) {
                    sums.set(fullPositionID, (sums.get(fullPositionID) ?? 0) - oldRelation.proficiency);
                }

                counts.set(fullPositionID, (counts.get(fullPositionID) ?? 0) - 1);
                counts.set(bestAltID, (counts.get(bestAltID) ?? 0) + 1);
                sums.set(bestAltID, bestAltSum);
                member.positionID = bestAltID;
                lastByStaff.set(member.staffID, { positionID: bestAltID, dateTime: slotTime });

                return true;
            }
        }

        return false;
    }

    for (const slot of slots) {
        const counts: Map<number, number> = new Map<number, number>();
        const sums: Map<number, number> = new Map<number, number>();

        countsBySlot.set(slot.dateTime, counts);
        sumsBySlot.set(slot.dateTime, sums);

        for (const interval of slot.active) {
            const direction = directions.get(interval.staffID) ?? { physical: 0, mental: 0, risk: 0 };
            let bestClean: Candidate | null = null;
            let bestConflicted: Candidate | null = null;

            for (const position of input.positions) {
                if (!isQualified(interval.staffID, position.id, input.relations)) {
                    continue;
                }

                const count: number = counts.get(position.id) ?? 0;

                if (count >= position.maximumStaff) {
                    continue;
                }

                const relation = input.relations.find(
                    (item): boolean => item.staffID === interval.staffID && item.positionID === position.id
                );

                if (relation === undefined) {
                    continue;
                }

                const sum: number = (sums.get(position.id) ?? 0) + relation.proficiency;

                if (position.maximumSumProficiency !== null && sum > position.maximumSumProficiency) {
                    continue;
                }

                const candidate: AssignedPosition = {
                    rosterRecordID: interval.recordID,
                    dateTime      : slot.dateTime,
                    positionID    : position.id,
                    staffID       : interval.staffID
                };

                const severity: number = lastByStaff.has(interval.staffID)
                    ? getActiveConflictSeverity(
                        (lastByStaff.get(interval.staffID) as LastAssignment).positionID,
                        (lastByStaff.get(interval.staffID) as LastAssignment).dateTime,
                        candidate,
                        input.conflicts
                    )
                    : 0;

                if (severity === 5) {
                    continue;
                }
                const loadFit: number =
                    direction.physical * position.physicalLoad +
                    direction.mental   * position.mentalLoad +
                    direction.risk     * position.riskLevel;
                const headcount: number = position.isPrioritisingStaffAmount
                    ? (position.targetStaff - count) * 3
                    : 0;
                const score: number =
                    relation.preference * 10 +
                    relation.proficiency * 4 +
                    loadFit * 3 +
                    headcount +
                    random() / 1000;

                const ranked: Candidate = {
                    positionID: position.id,
                    score     : score,
                    severity  : severity
                };

                if (severity === 0) {
                    if (bestClean === null || ranked.score > bestClean.score) {
                        bestClean = ranked;
                    }
                    continue;
                }

                if (bestConflicted === null ||
                    ranked.severity < bestConflicted.severity ||
                    (ranked.severity === bestConflicted.severity && ranked.score > bestConflicted.score)) {
                    bestConflicted = ranked;
                }
            }

            // A conflict-free position always wins. A soft conflict is only accepted
            // when no clean alternative exists, preferring the lowest severity.
            const selected: Candidate | null = bestClean ?? bestConflicted;

            if (selected === null) {
                violations.push({
                    code          : "missing-qualification",
                    message       : "No eligible position is available for this staff member at this time.",
                    rosterRecordID: interval.recordID,
                    dateTime      : slot.dateTime,
                    positionID    : null
                });
                continue;
            }

            const bestPositionID: number = selected.positionID;
            const bestSeverity: number = selected.severity;

            const chosen: AssignedPosition = {
                rosterRecordID: interval.recordID,
                dateTime      : slot.dateTime,
                positionID    : bestPositionID,
                staffID       : interval.staffID
            };

            relocateOverflow(bestPositionID, slot.dateTime, counts, sums);

            assigned.push(chosen);
            counts.set(bestPositionID, (counts.get(bestPositionID) ?? 0) + 1);

            if (bestSeverity > 0) {
                violations.push({
                    code          : "position-conflict",
                    message       : "A soft position conflict was accepted because no alternative was available.",
                    rosterRecordID: interval.recordID,
                    dateTime      : slot.dateTime,
                    positionID    : bestPositionID
                });
            }

            const relation = input.relations.find(
                (item): boolean => item.staffID === interval.staffID && item.positionID === bestPositionID
            );

            if (relation !== undefined) {
                sums.set(bestPositionID, (sums.get(bestPositionID) ?? 0) + relation.proficiency);
            }

            lastByStaff.set(interval.staffID, {
                positionID: bestPositionID,
                dateTime  : slot.dateTime
            });
        }

        const sample: AssignedPosition = {
            rosterRecordID: slot.active[0]?.recordID ?? 0,
            dateTime      : slot.dateTime,
            positionID    : null,
            staffID       : ""
        };

        violations.push(...checkStaffingLevels(counts, input.positions, sample));
        violations.push(...checkSumProficiency(sums, input.positions, sample));
    }

    const assignedAt: Set<string> = new Set<string>();

    for (const item of assigned) {
        assignedAt.add(`${ item.rosterRecordID }|${ item.dateTime }`);
    }

    const positions: Array<SchedulePosition> = [];

    for (const item of assigned) {
        positions.push({
            rosterRecordID: item.rosterRecordID,
            dateTime      : item.dateTime,
            positionID    : item.positionID
        });
    }

    for (const marker of breaks) {
        if (assignedAt.has(`${ marker.recordID }|${ marker.dateTime }`)) {
            continue;
        }

        positions.push({
            rosterRecordID: marker.recordID,
            dateTime      : marker.dateTime,
            positionID    : null
        });
    }

    const tasks: SchedulerOutput["tasks"] = [];
    const loadByRecord: Map<number, number> = new Map<number, number>();

    for (const item of assigned) {
        loadByRecord.set(item.rosterRecordID, (loadByRecord.get(item.rosterRecordID) ?? 0) + 1);
    }

    for (const task of input.tasks) {
        const candidates: SchedulerInput["records"] = input.records.filter(
            (record): boolean => dayOf(record.date) === task.day
        );

        const responsible: SchedulerInput["records"] = candidates.filter(
            (record): boolean => assigned.some((item): boolean => {
                if (item.rosterRecordID !== record.id || item.positionID === null) {
                    return false;
                }

                const position = input.positions.find((p): boolean => p.id === item.positionID);

                if (position === undefined) {
                    return false;
                }

                return (task.responsiblePositionID !== null && position.id === task.responsiblePositionID) ||
                       (task.responsibleUnitID !== null && position.unitID === task.responsibleUnitID);
            })
        );

        const pool: SchedulerInput["records"] = responsible.length !== 0 ? responsible : candidates;

        let chosen: SchedulerInput["records"][number] | undefined;

        for (const record of pool) {
            if (chosen === undefined || (loadByRecord.get(record.id) ?? 0) < (loadByRecord.get(chosen.id) ?? 0)) {
                chosen = record;
            }
        }

        if (chosen === undefined) {
            continue;
        }

        const interval: Interval | undefined = intervals.find(
            (item): boolean => item.recordID === chosen?.id
        );

        if (interval === undefined) {
            continue;
        }

        tasks.push({
            rosterRecordID: chosen.id,
            dateTime      : new Date(interval.start).toISOString(),
            taskID        : task.id
        });
    }

    for (const item of assigned) {
        violations.push(...checkPositionAssignment(item, input.relations));
    }

    const output: SchedulerOutput = { positions: positions, tasks: tasks, violations: violations };

    return new Result<SchedulerOutput>(true, output);
}
