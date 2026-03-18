import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as taskService from "../services/TaskService";
import { initCosmos } from "../config/InitCosmos";
import { success, error } from "../utils/response";
import { corsHeaders, handlePreflight } from "../utils/cors";

export async function GetTasks(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`GetTasks request: ${request.url}`);

  const preflight = handlePreflight(request.method);
  if (preflight) return preflight;

  await initCosmos();

  const organizationId = request.query.get("organizationId");
  const page = Math.max(Number(request.query.get("page") ?? "1"), 1);
  const limit = Math.max(Number(request.query.get("limit") ?? "10"), 1);
  const search = request.query.get("search") ?? "";

  if (!organizationId) {
    return { status: 400, headers: corsHeaders, jsonBody: error("organizationId is required") };
  }

  const result = await taskService.getTasks({ organizationId, page, limit, search });
  const message = result.data.length === 0 ? "No tasks found" : "Tasks retrieved successfully";

  return {
    status: 200,
    headers: corsHeaders,
    jsonBody: success(result.data, {
      message,
      meta: {
        page: result.page,
        limit: result.limit,
        has_next: result.has_next,
      },
    }),
  };
}

app.http("GetTasks", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  handler: GetTasks,
  route: "tasks",
});