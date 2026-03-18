import { container } from "../config/CosmosClient";
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
  const offset = (page - 1) * limit;

  let query = `SELECT * FROM c WHERE c.organizationId = @organizationId`;
  const parameters = [{ name: "@organizationId", value: organizationId }];

  if (search) {
    query += ` AND CONTAINS(c.title, @search, true)`;
    parameters.push({ name: "@search", value: search });
  }

  query += ` ORDER BY c._ts DESC OFFSET ${offset} LIMIT ${limit + 1}`;

  const result = await container.items.query<Task>({ query, parameters }).fetchAll();
  return result.resources;
}

export async function getTask(id: string, organizationId: string): Promise<Task | undefined> {
  try {
    const { resource } = await container.item(id, organizationId).read<Task>();
    return resource;
  } catch {
    return undefined;
  }
}

export async function createTask(task: Task): Promise<Task | undefined> {
  const { resource } = await container.items.create<Task>(task);
  return resource;
}

export async function updateTask(task: Task): Promise<Task | undefined> {
  const { resource } = await container.item(task.id, task.organizationId).replace<Task>(task);
  return resource;
}

export async function deleteTask(id: string, organizationId: string): Promise<void> {
  await container.item(id, organizationId).delete();
}

export async function bulkDeleteTasks(ids: string[], organizationId: string, context?: InvocationContext): Promise<void> {
  for (const id of ids) {
    try {
      await container.item(id, organizationId).delete();
    } catch (err) {
      context?.log(`Failed to delete task ${id}:`, err);
    }
  }
}