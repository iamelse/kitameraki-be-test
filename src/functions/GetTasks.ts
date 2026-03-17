import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as taskService from "../services/TaskService";
import { initCosmos } from "../config/InitCosmos";
import { success, error } from "../utils/response";

export async function GetTasks(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {

  context.log(`GetTasks request: ${request.url}`);

  await initCosmos();

  const organizationId = request.query.get("organizationId");
  const page = Math.max(Number(request.query.get("page") ?? "1"), 1);
  const limit = Math.max(Number(request.query.get("limit") ?? "10"), 1);
  const search = request.query.get("search") ?? "";

  if (!organizationId) {
    return {
      status: 400,
      jsonBody: error("organizationId is required")
    };
  }

  const result = await taskService.getTasks({
    organizationId,
    page,
    limit,
    search
  });

  const message =
    result.data.length === 0
      ? "No tasks found"
      : "Tasks retrieved successfully";

  return {
    status: 200,
    jsonBody: success(result.data, {
      message,
      meta: {
        page: result.page,
        limit: result.limit,
        has_next: result.has_next
      }
    })
  };
}

app.http("GetTasks", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: GetTasks,
  route: "tasks"
});