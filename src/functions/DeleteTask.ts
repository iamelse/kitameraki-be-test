import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as taskService from "../services/TaskService";
import { initCosmos } from "../config/InitCosmos";
import { success, error } from "../utils/response";
import { corsHeaders, handlePreflight } from "../utils/cors";

export async function DeleteTask(
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

    await taskService.deleteTask(taskId, organizationId);

    return {
      status: 200,
      headers: corsHeaders,
      jsonBody: success(null, { message: "Task deleted successfully" })
    };
  } catch (err) {
    context.log("DeleteTask error:", err);

    return {
      status: 500,
      headers: corsHeaders,
      jsonBody: error("Internal server error")
    };
  }
}

app.http("DeleteTask", {
  methods: ["DELETE", "OPTIONS"],
  authLevel: "anonymous",
  handler: DeleteTask,
  route: "tasks/delete/{id}"
});