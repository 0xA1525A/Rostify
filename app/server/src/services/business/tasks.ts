import      { HTTPStatus } from "@lib:enums/http_status";
import type { Nullable }   from "@lib:types/nullable";
import type { Result }     from "@lib:templates/result";
import type { ServiceDependencies }             from "@lib:templates/service_deps";
import      { Response, type RFServerResponse } from "@lib:templates/response";

import {
    createTask,
    deleteAllTasks,
    deleteTaskByID,
    getAllTasks,
    getAllTasksInDay,
    getTaskByID,
    searchTasksBySimilarName,
    updateTaskByID
} from "@data:tasks";

import { validateAccessPermission } from "@service:permission/permission";

import { type Task, validateTask } from "@model:tasks";

export async function handleGetAllTasks(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const allTasksResult: Result<Array<Task>>   = await getAllTasks(d.sql);
    const allTasks      : Nullable<Array<Task>> = allTasksResult.getData();

    if (!allTasksResult.isSuccess() || allTasks === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "There's nothing here.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, allTasks).unwrap(d.set);
}

export async function handleGetTaskByID(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    const taskID: string = d.params.taskID ?? '';

    if (Number.isNaN(Number.parseInt(taskID))) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing task ID.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const getTaskResult: Result<Task>   = await getTaskByID(d.sql, Number.parseInt(taskID));
    const task         : Nullable<Task> = getTaskResult.getData();

    if (!getTaskResult.isSuccess() || task === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "There's no such task.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, task).unwrap(d.set);
}

export async function handleSearchTasksByName(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    const taskName: string = d.params.taskName ?? '';

    if (!taskName.trim()) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing task name.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    type R = Array<Task>;

    const searchTasksResult: Result<R>   = await searchTasksBySimilarName(d.sql, `%${ taskName }%`);
    const tasks            : Nullable<R> = searchTasksResult.getData();

    if (!searchTasksResult.isSuccess() || tasks === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "What are you looking for exactly?").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, tasks).unwrap(d.set);
}

export async function handleGetAllTasksInDay(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    const taskDay: string = d.params.taskDay ?? '';

    if (!taskDay.trim()) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing task name.").unwrap(d.set);
    }

    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    type R = Array<Task>;

    const searchTasksResult: Result<R>   = await getAllTasksInDay(d.sql, taskDay);
    const tasks            : Nullable<R> = searchTasksResult.getData();

    if (!searchTasksResult.isSuccess()) {
        return new Response(false, HTTPStatus.NOT_FOUND, "There's nothing here.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, tasks).unwrap(d.set);
}

export async function handleCreateTask(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const taskInfo: Task = {
        id         : 0, // placeholder.
        day        : d.body.day         ?? '',
        isHoliday  : d.body.isHoliday   ?? '',
        name       : d.body.name        ?? '',
        description: d.body.description ?? '',
        responsibleUnitID: d.body.responsibleUnitID ?? null,
        responsiblePositionID: d.body.responsiblePositionID ?? null
    }

    const validateTaskInfo: boolean = validateTask(taskInfo);

    if (!validateTaskInfo) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Malformed task info.").unwrap(d.set);
    }

    const createTaksResult: Result<number>   = await createTask(d.sql, taskInfo)
    const newTaskID       : Nullable<number> = createTaksResult.getData();

    if (!createTaksResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to create task.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.CREATED, newTaskID).unwrap(d.set);
}

export async function handleUpdateTaskByID(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const targetTaskID: string = d.params.taskID ?? '';

    if (Number.isNaN(Number.parseInt(targetTaskID))) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing parameter: Task ID.").unwrap(d.set);
    }

    const getCurrentTaskResult: Result<Task>   = await getTaskByID(d.sql, Number.parseInt(targetTaskID));
    const oldTask             : Nullable<Task> = getCurrentTaskResult.getData();

    if (!getCurrentTaskResult.isSuccess() || oldTask === null) {
        return new Response(false, HTTPStatus.NOT_FOUND, "Task not found.").unwrap(d.set);
    }

    const newTask: Task = {
        id         : 0, // placeholder.
        day        : d.body.day         ?? oldTask.day,
        isHoliday  : d.body.isHoliday   ?? oldTask.isHoliday,
        name       : d.body.name        ?? oldTask.name,
        description: d.body.description ?? oldTask.description,
        responsibleUnitID: d.body.responsibleUnitID ?? oldTask.responsibleUnitID,
        responsiblePositionID: d.body.responsiblePositionID ?? oldTask.responsiblePositionID
    }

    const validateTaskInfo: boolean = validateTask(newTask);

    if (!validateTaskInfo) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Malformed task info.").unwrap(d.set);
    }

    const updateTaskResult: Result<Task>   = await updateTaskByID(d.sql, Number.parseInt(targetTaskID), newTask);
    const updatedTask     : Nullable<Task> = updateTaskResult.getData();

    if (!updateTaskResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to update task.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, updatedTask).unwrap(d.set);
}

export async function handleDeleteAllTasks(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const deleteAllTasksResult: Result<null> = await deleteAllTasks(d.sql);

    if (!deleteAllTasksResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete all tasks.").unwrap(d.set);
    }

    return new Response(true, HTTPStatus.OK, "Successfully deleted all tasks.").unwrap(d.set);
}

export async function handleDeleteTaskByID(
    d: ServiceDependencies
): Promise<RFServerResponse> {
    const permissionResult: Result<string> = await validateAccessPermission(d.sql, d.headers, "manager", false);

    if (!permissionResult.isSuccess()) {
        return new Response(false, HTTPStatus.FORBIDDEN, "Insufficient permission.").unwrap(d.set);
    }

    const targetTaskID: string = d.params.unitID ?? '';

    if (Number.isNaN(Number.parseInt(targetTaskID))) {
        return new Response(false, HTTPStatus.BAD_REQUEST, "Missing task ID.").unwrap(d.set);
    }

    const deleteTaskResult: Result<string> = await deleteTaskByID(d.sql, Number.parseInt(targetTaskID));
    const deletedTaskName : Nullable<string> = deleteTaskResult.getData();

    if (!deleteTaskResult.isSuccess()) {
        return new Response(false, HTTPStatus.INTERNAL_SERVER_ERROR, "Unable to delete this task.").unwrap(d.set);
    }

    return new Response(false, HTTPStatus.OK, `Successfully deleted task ${ deletedTaskName }.`).unwrap(d.set);
}