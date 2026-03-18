import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as taskService from "../services/TaskService";
import { initCosmos } from "../config/InitCosmos";
import { success, error } from "../utils/response";
import { UpdateTaskSchema } from "../validators/TaskValidator";
import { corsHeaders, handlePreflight } from "../utils/cors";

export async function UpdateTask(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const preflight = handlePreflight(request.method);
  if (preflight) return preflight;

  try {
    await initCosmos();

    const taskId = request.params?.id;
    const organizationId = request.query.get("organizationId");

    if (!taskId || !organizationId) {
      return {
        status: 400,
        headers: corsHeaders,
        jsonBody: error("id and organizationId are required")
      };
    }

    const body = await request.json();

    const parseResult = UpdateTaskSchema.safeParse(body);
    if (!parseResult.success || Object.keys(parseResult.data).length === 0) {
      const firstError = parseResult.success
        ? { message: "Request body cannot be empty" }
        : parseResult.error.issues[0];

      return {
        status: 400,
        headers: corsHeaders,
        jsonBody: error(firstError.message)
      };
    }

    const updatedData = {
      ...parseResult.data,
      organizationId,
      updatedAt: new Date().toISOString()
    };

    const updatedTask = await taskService.updateTask(taskId, updatedData);

    return {
      status: 200,
      headers: corsHeaders,
      jsonBody: success(updatedTask, {
        message: "Task updated successfully"
      })
    };
  } catch (err: any) {
    context.log("UpdateTask error:", err);

    if (err.message === "Task not found") {
      return {
        status: 404,
        headers: corsHeaders,
        jsonBody: error("Task not found")
      };
    }

    return {
      status: 500,
      headers: corsHeaders,
      jsonBody: error("Internal server error")
    };
  }
}

app.http("UpdateTask", {
  methods: ["PUT", "OPTIONS"],
  authLevel: "anonymous",
  handler: UpdateTask,
  route: "tasks/update/{id}"
});