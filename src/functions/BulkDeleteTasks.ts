import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as taskService from "../services/TaskService";
import { initCosmos } from "../config/InitCosmos";
import { success, error } from "../utils/response";

export async function BulkDeleteTasks(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    context.log(`BulkDeleteTasks request: ${request.url}`);

    await initCosmos();

    const organizationId = request.query.get("organizationId");
    if (!organizationId) {
      return { status: 400, jsonBody: error("organizationId is required") };
    }

    const body = (await request.json()) as string[];
    if (!Array.isArray(body) || body.length === 0) {
      return { status: 400, jsonBody: error("Body must be a non-empty array of task IDs") };
    }

    await taskService.bulkDeleteTasks(body, organizationId, context);

    return {
      status: 200,
      jsonBody: success(null, {
        message: "Tasks deleted successfully"
      })
    };
  } catch (err) {
    context.log("BulkDeleteTasks error:", err);
    return { status: 500, jsonBody: error("Internal server error") };
  }
}

app.http("BulkDeleteTasks", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  handler: BulkDeleteTasks,
  route: "tasks/mass/delete"
});