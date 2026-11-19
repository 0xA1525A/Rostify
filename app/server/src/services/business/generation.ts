import type { SQL } from "bun";

import { Result } from "@lib:templates/result";

import type { DailyRosterEntry, RosterPunch, RosterRecord } from "@model:rosters";

import { getAvailabilitiesByDate } from "@data:availabilities";
import { getHistoricalLoadRows, getHistoricalPositionRows } from "@data:history";
import { getAllStaffRelationsToAllPositions, getAllStaffRelationsToAllShifts, getAllStaffRelationsToAllStaff } from "@data:relations";
import { createRosterPunch, createRosterRecord, deleteRosterPunchesByDate, deleteRosterRecordsByDate, getDailyRosterByDate, getRosterRecordsByDate } from "@data:rosters";
import { getAllPositions } from "@data:positions";
import { getAllStaffWorkInfo } from "@data:staff";
import { getAllShifts } from "@data:shifts";
import { getAllTasks } from "@data:tasks";
import { deleteSchedulePositionsByDate, deleteScheduleTasksByDate, createSchedulePosition, createScheduleTask } from "@data:schedules";
import { getAllPositionConflicts } from "@data:position_conflicts";

import { generateRoster } from "@service:business/rosterer/generate";
import { generateSchedule } from "@service:business/scheduler/generate";

const LOOKBACK_DAYS: number = 30;
const DAY_NAMES: ReadonlyArray<string> = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function addDays(date: string, days: number): string {
    const value: Date = new Date(`${ date }T00:00:00Z`);

    value.setUTCDate(value.getUTCDate() + days);

    return value.toISOString().slice(0, 10);
}

function unwrap<T>(result: Result<Array<T>>): Array<T> {
    const data: Array<T> | null = result.getData();

    return result.isSuccess() && data !== null ? data : [];
}

export async function generateDailyRosterAndSchedule(
    sql: SQL,
    date: string
): Promise<Result<Array<DailyRosterEntry>>> {
    if (!/^\d{4}-\d{2}-\d{2}$/u.test(date)) {
        return new Result<Array<DailyRosterEntry>>(false, null);
    }

    const previousDate: string = addDays(date, -1);
    const startDate: string = addDays(date, -LOOKBACK_DAYS);
    const targetDay: string = DAY_NAMES[new Date(`${ date }T00:00:00Z`).getUTCDay()] ?? "";

    const [
        availabilitiesResult,
        shiftsResult,
        shiftRelationsResult,
        peerRelationsResult,
        staffResult,
        previousRecordsResult,
        historyResult,
        positionsResult,
        positionRelationsResult,
        conflictsResult,
        tasksResult,
        positionHistoryResult
    ] = await Promise.all([
        getAvailabilitiesByDate(sql, date),
        getAllShifts(sql),
        getAllStaffRelationsToAllShifts(sql),
        getAllStaffRelationsToAllStaff(sql),
        getAllStaffWorkInfo(sql),
        getRosterRecordsByDate(sql, previousDate),
        getHistoricalLoadRows(sql, startDate, date),
        getAllPositions(sql),
        getAllStaffRelationsToAllPositions(sql),
        getAllPositionConflicts(sql),
        getAllTasks(sql),
        getHistoricalPositionRows(sql, startDate, date)
    ]);

    const shifts = unwrap(shiftsResult);
    const staff = unwrap(staffResult);
    const tasks = unwrap(tasksResult);
    const shiftByID: Map<number, (typeof shifts)[number]> = new Map<number, (typeof shifts)[number]>();

    for (const shift of shifts) {
        shiftByID.set(shift.id, shift);
    }

    const previousRecords = unwrap(previousRecordsResult).flatMap((record) => {
        const shift = shiftByID.get(record.shiftID);

        return shift === undefined ? [] : [{ ...record, shift: shift }];
    });

    const isHoliday: boolean = tasks.some((task): boolean => task.day === targetDay && task.isHoliday);

    const rosterResult = generateRoster({
        date: date,
        availabilities: unwrap(availabilitiesResult),
        shifts: shifts,
        shiftRelations: unwrap(shiftRelationsResult),
        peerRelations: unwrap(peerRelationsResult),
        staff: staff,
        previousRecords: previousRecords,
        history: unwrap(historyResult),
        isHoliday: isHoliday
    });

    const roster = rosterResult.getData();

    if (!rosterResult.isSuccess() || roster === null) {
        return new Result<Array<DailyRosterEntry>>(false, null);
    }

    await deleteRosterPunchesByDate(sql, date);
    await deleteSchedulePositionsByDate(sql, date);
    await deleteScheduleTasksByDate(sql, date);
    await deleteRosterRecordsByDate(sql, date);

    const persistedRecords: Array<RosterRecord> = [];
    const recordIDByStaff: Map<string, number> = new Map<string, number>();

    for (const record of roster.records) {
        const createResult: Result<number> = await createRosterRecord(sql, record);
        const recordID: number | null = createResult.getData();

        if (!createResult.isSuccess() || recordID === null) {
            return new Result<Array<DailyRosterEntry>>(false, null);
        }

        persistedRecords.push({ ...record, id: recordID });
        recordIDByStaff.set(record.staffID, recordID);
    }

    const persistedPunches: Array<RosterPunch> = [];

    for (const punch of roster.punches) {
        const staffID: string = punch.recordKey.split("|")[1] ?? "";
        const rosterRecordID: number | undefined = recordIDByStaff.get(staffID);

        if (rosterRecordID === undefined) {
            continue;
        }

        const punchData: RosterPunch = {
            rosterRecordID: rosterRecordID,
            dateTime      : punch.dateTime,
            clockEvent    : punch.clockEvent
        };

        persistedPunches.push(punchData);
        await createRosterPunch(sql, rosterRecordID, punchData.dateTime, punchData.clockEvent);
    }

    if (persistedRecords.length === 0) {
        return new Result<Array<DailyRosterEntry>>(false, null);
    }

    const scheduleResult = generateSchedule({
        records: persistedRecords,
        punches: persistedPunches,
        positions: unwrap(positionsResult),
        relations: unwrap(positionRelationsResult),
        staff: staff,
        conflicts: unwrap(conflictsResult),
        loadProfiles: roster.loadProfiles,
        history: unwrap(positionHistoryResult),
        tasks: tasks
    });

    const schedule = scheduleResult.getData();

    if (scheduleResult.isSuccess() && schedule !== null) {
        for (const item of schedule.positions) {
            await createSchedulePosition(sql, item);
        }

        for (const item of schedule.tasks) {
            await createScheduleTask(sql, item);
        }
    }

    const dailyRosterResult: Result<Array<DailyRosterEntry>> = await getDailyRosterByDate(sql, date);
    const dailyRoster: Array<DailyRosterEntry> | null = dailyRosterResult.getData();

    if (!dailyRosterResult.isSuccess() || dailyRoster === null) {
        return new Result<Array<DailyRosterEntry>>(false, null);
    }

    return new Result<Array<DailyRosterEntry>>(true, dailyRoster);
}
