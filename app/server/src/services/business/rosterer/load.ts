import type { HistoricalAssignment, StaffLoadProfile } from "@service:business/rosterer/types";

export type LoadDirection = -1 | 0 | 1;

export type StaffLoadDirection = {
    physical: LoadDirection,
    mental  : LoadDirection,
    risk    : LoadDirection,
    hours   : LoadDirection
};

export type GroupLoadProfile = {
    averagePhysicalLoad: number,
    averageMentalLoad  : number,
    averageRiskLevel   : number,
    averageHours       : number
};

export type LoadAnalysis = {
    profiles  : Array<StaffLoadProfile>,
    group     : GroupLoadProfile,
    directions: Map<string, StaffLoadDirection>
};

function average(total: number, count: number): number {
    return count === 0 ? 0 : total / count;
}

function direction(value: number, target: number, tolerance: number): LoadDirection {
    if (target === 0) {
        return 0;
    }

    if (value < target * (1 - tolerance)) {
        return 1;
    }

    if (value > target * (1 + tolerance)) {
        return -1;
    }

    return 0;
}

export function computeLoadProfiles(history: Array<HistoricalAssignment>, tolerance: number): LoadAnalysis {
    const byStaff: Map<string, Array<HistoricalAssignment>> = new Map<string, Array<HistoricalAssignment>>();

    for (const assignment of history) {
        const existing: Array<HistoricalAssignment> = byStaff.get(assignment.staffID) ?? [];

        existing.push(assignment);
        byStaff.set(assignment.staffID, existing);
    }

    const profiles: Array<StaffLoadProfile> = [];

    for (const [staffID, assignments] of byStaff) {
        const count: number = assignments.length;

        profiles.push({
            staffID           : staffID,
            averagePhysicalLoad: average(assignments.reduce((total, a) => total + a.physicalLoad, 0), count),
            averageMentalLoad  : average(assignments.reduce((total, a) => total + a.mentalLoad, 0), count),
            averageRiskLevel   : average(assignments.reduce((total, a) => total + a.riskLevel, 0), count),
            averageHours       : average(assignments.reduce((total, a) => total + a.hours, 0), count),
            assignmentCount    : count
        });
    }

    const group: GroupLoadProfile = groupFromProfiles(profiles);

    return { profiles: profiles, group: group, directions: directionsFromProfiles(profiles, group, tolerance) };
}

export function directionsFromProfiles(
    profiles : Array<StaffLoadProfile>,
    group    : GroupLoadProfile,
    tolerance: number
): Map<string, StaffLoadDirection> {
    const directions: Map<string, StaffLoadDirection> = new Map<string, StaffLoadDirection>();

    for (const profile of profiles) {
        directions.set(profile.staffID, {
            physical: direction(profile.averagePhysicalLoad, group.averagePhysicalLoad, tolerance),
            mental  : direction(profile.averageMentalLoad, group.averageMentalLoad, tolerance),
            risk    : direction(profile.averageRiskLevel, group.averageRiskLevel, tolerance),
            hours   : direction(profile.averageHours, group.averageHours, tolerance)
        });
    }

    return directions;
}

export function groupFromProfiles(profiles: Array<StaffLoadProfile>): GroupLoadProfile {
    const count: number = profiles.length;

    return {
        averagePhysicalLoad: average(profiles.reduce((total, p) => total + p.averagePhysicalLoad, 0), count),
        averageMentalLoad  : average(profiles.reduce((total, p) => total + p.averageMentalLoad, 0), count),
        averageRiskLevel   : average(profiles.reduce((total, p) => total + p.averageRiskLevel, 0), count),
        averageHours       : average(profiles.reduce((total, p) => total + p.averageHours, 0), count)
    };
}
