import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as taskService from "../services/TaskService";
import { initCosmos } from "../config/InitCosmos";
import { success, error } from "../utils/response";

export async function DeleteTask(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    await initCosmos();

    const taskId = request.query.get("id");
    const organizationId = request.query.get("organizationId");

    if (!taskId || !organizationId) {
      return {
        status: 400,
        jsonBody: error("id and organizationId are required")
      };
    }

    await taskService.deleteTask(taskId, organizationId);

    return {
      status: 200,
      jsonBody: success(null, { message: "Task deleted successfully" })
    };
  } catch (err) {
    context.log("DeleteTask error:", err);

    return {
      status: 500,
      jsonBody: error("Internal server error")
    };
  }
}

app.http("DeleteTask", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  handler: DeleteTask,
  route: "tasks/{id}"
});