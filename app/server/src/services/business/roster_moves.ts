import type { SQL } from "bun";

import { Result } from "@lib:templates/result";
import type { DailyRosterEntry, RosterPunch, RosterRecord } from "@model:rosters";
import type { StaffAvailability } from "@model:staff";

import { getAvailabilityByDateAndStaffID } from "@data:availabilities";
import { getHistoricalLoadRows, getHistoricalPositionRows } from "@data:history";
import { getAllPositionConflicts } from "@data:position_conflicts";
import { getAllPositions } from "@data:positions";
import { getAllStaffRelationsToAllPositions } from "@data:relations";
import {
    createRosterPunch,
    deleteRosterPunchesByRosterRecordID,
    getDailyRosterByDate,
    getRosterRecordByDateAndStaffID,
    updateRosterRecordByDateAndStaffID
} from "@data:rosters";
import { createSchedulePosition, deleteSchedulePositionsByRosterRecordID } from "@data:schedules";
import { getAllStaffWorkInfo } from "@data:staff";
import { getShiftByShiftID } from "@data:shifts";

import { planPunches, rosterRecordKey } from "@service:business/rosterer/generate";
import { computeLoadProfiles } from "@service:business/rosterer/load";
import { generateSchedule } from "@service:business/scheduler/generate";

import { addDaysUTC } from "@service:permission/date_access";

const LOOKBACK_DAYS: number = 30;
const DEFAULT_FAIRNESS_TOLERANCE: number = 0.05;

function unwrap<T>(result: Result<Array<T>>): Array<T> {
    const data: Array<T> | null = result.getData();

    return result.isSuccess() && data !== null ? data : [];
}

function fallbackAvailability(date: string, staffID: string): StaffAvailability {
    return {
        date        : date,
        staffID     : staffID,
        fromTime    : null,
        toTime      : null,
        toDate      : null,
        isFlexible  : true,
        okOvertime  : true,
        okMultipleBreak: true,
        okLongBreak : false,
        preferredHour: null,
        preferredBreakHour: 1,
        preferredShift: null
    };
}

/**
 * Reassigns one staff member to a different shift on an already-generated day,
 * then rebuilds only that person's punches and position schedule so the rest of
 * the day's manual moves stay untouched.
 */
export async function moveStaffShift(
    sql: SQL,
    date: string,
    staffID: string,
    shiftID: number
): Promise<Result<DailyRosterEntry>> {
    const recordResult: Result<RosterRecord> = await getRosterRecordByDateAndStaffID(sql, date, staffID);
    const record = recordResult.getData();

    if (!recordResult.isSuccess() || record === null) {
        return new Result<DailyRosterEntry>(false, null);
    }

    const shiftResult = await getShiftByShiftID(sql, shiftID);
    const shift = shiftResult.getData();

    if (!shiftResult.isSuccess() || shift === null) {
        return new Result<DailyRosterEntry>(false, null);
    }

    const availabilityResult = await getAvailabilityByDateAndStaffID(sql, staffID, date);
    const availability: StaffAvailability = availabilityResult.getData() ?? fallbackAvailability(date, staffID);

    const startDate: string = addDaysUTC(date, -LOOKBACK_DAYS);
    const [
        positionsResult,
        relationsResult,
        staffResult,
        conflictsResult,
        historyResult,
        positionHistoryResult
    ] = await Promise.all([
        getAllPositions(sql),
        getAllStaffRelationsToAllPositions(sql),
        getAllStaffWorkInfo(sql),
        getAllPositionConflicts(sql),
        getHistoricalLoadRows(sql, startDate, date),
        getHistoricalPositionRows(sql, startDate, date)
    ]);

    await deleteRosterPunchesByRosterRecordID(sql, record.id);
    await deleteSchedulePositionsByRosterRecordID(sql, record.id);

    const updateResult = await updateRosterRecordByDateAndStaffID(sql, date, staffID, shiftID);
    const updatedRecord = updateResult.getData();

    if (!updateResult.isSuccess() || updatedRecord === null) {
        return new Result<DailyRosterEntry>(false, null);
    }

    const punches: Array<RosterPunch> = [];

    for (const planned of planPunches(rosterRecordKey(date, staffID), date, shift, availability)) {
        const punch: RosterPunch = {
            rosterRecordID: record.id,
            dateTime      : planned.dateTime,
            clockEvent    : planned.clockEvent
        };

        const createResult: Result<null> = await createRosterPunch(
            sql,
            record.id,
            punch.dateTime,
            punch.clockEvent
        );

        if (!createResult.isSuccess()) {
            return new Result<DailyRosterEntry>(false, null);
        }

        punches.push(punch);
    }

    const scheduleResult = generateSchedule({
        records     : [updatedRecord],
        punches     : punches,
        positions   : unwrap(positionsResult),
        relations   : unwrap(relationsResult),
        staff       : unwrap(staffResult),
        conflicts   : unwrap(conflictsResult),
        loadProfiles: computeLoadProfiles(unwrap(historyResult), DEFAULT_FAIRNESS_TOLERANCE).profiles,
        history     : unwrap(positionHistoryResult),
        tasks       : []
    });

    const schedule = scheduleResult.getData();

    if (scheduleResult.isSuccess() && schedule !== null) {
        for (const position of schedule.positions) {
            if (position.rosterRecordID !== record.id) {
                continue;
            }

            await createSchedulePosition(sql, position);
        }
    }

    const dailyResult = await getDailyRosterByDate(sql, date);
    const daily: Array<DailyRosterEntry> | null = dailyResult.getData();

    if (!dailyResult.isSuccess() || daily === null) {
        return new Result<DailyRosterEntry>(false, null);
    }

    const entry: DailyRosterEntry | undefined = daily.find(
        (item): boolean => item.staff_id === staffID
    );

    return entry === undefined
        ? new Result<DailyRosterEntry>(false, null)
        : new Result<DailyRosterEntry>(true, entry);
}
