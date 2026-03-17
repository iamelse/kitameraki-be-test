import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { container } from "../config/CosmosClient";
import { initCosmos } from "../config/InitCosmos";
import { Task } from "../models/Task";
import { randomUUID } from "crypto";
import { success, error } from "../utils/response";
import { InsertTaskSchema } from "../validators/TaskValidator";

export async function InsertTask(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    context.log(`InsertTask request: ${request.url}`);

    await initCosmos();

    const body = await request.json();

    const parseResult = InsertTaskSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0];
      return {
        status: 400,
        jsonBody: error(firstError.message)
      };
    }

    const task: Task = {
      id: randomUUID(),
      ...parseResult.data,
      status: parseResult.data.status || "open",
      createdAt: new Date().toISOString()
    };

    const { resource } = await container.items.create(task);

    const { _rid, _self, _etag, _attachments, _ts, ...cleanTask } = resource as any;

    return {
      status: 201,
      jsonBody: success(cleanTask, { message: "Task created successfully" })
    };
  } catch (err) {
    context.log("InsertTask error:", err);
    return {
      status: 500,
      jsonBody: error("Internal server error")
    };
  }
}

app.http("InsertTask", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: InsertTask,
  route: "tasks"
});