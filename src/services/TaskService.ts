import * as repository from "../repositories/TaskRepository";
import { randomUUID } from "crypto";
import { Task } from "../models/Task";
import { InvocationContext } from "@azure/functions";

interface GetTasksParams {
  organizationId: string;
  page: number;
  limit: number;
  search?: string;
}

export async function getTasks(params: GetTasksParams) {
  const { organizationId, page, limit, search } = params;

  const resources = await repository.getTasks({ organizationId, page, limit, search });

  const hasNext = resources.length > limit;
  const sliced = hasNext ? resources.slice(0, limit) : resources;

  const clean = sliced.map(({ _rid, _self, _etag, _attachments, _ts, ...rest }: any) => rest);

  return {
    data: clean,
    page,
    limit,
    has_next: hasNext
  };
}

export async function getTask(id: string, organizationId: string) {
  const task = await repository.getTask(id, organizationId);
  if (!task) throw new Error("Task not found");
  return task;
}

export async function createTask(data: Omit<Task, "id" | "createdAt"> & { organizationId: string }) {
  const task: Task = {
    id: randomUUID(),
    title: data.title,
    description: data.description,
    status: data.status ?? "open",
    organizationId: data.organizationId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return repository.createTask(task);
}

export async function updateTask(
  id: string,
  data: Partial<Omit<Task, "id" | "organizationId" | "createdAt">> & { organizationId: string }
) {
  const existing = await repository.getTask(id, data.organizationId);
  if (!existing) throw new Error("Task not found");

  const updatedTask: Task = { ...existing, ...data };
  return repository.updateTask(updatedTask);
}

export async function deleteTask(id: string, organizationId: string) {
  const existing = await repository.getTask(id, organizationId);
  if (!existing) throw new Error("Task not found");
  return repository.deleteTask(id, organizationId);
}

export async function bulkDeleteTasks(ids: string[], organizationId: string, context?: InvocationContext) {
  return repository.bulkDeleteTasks(ids, organizationId, context);
}