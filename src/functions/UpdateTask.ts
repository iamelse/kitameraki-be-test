import { CosmosClient, PatchOperation } from "@azure/cosmos";
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { success, error } from "../utils/response";

const cosmosConnection = process.env.COSMOS_CONNECTION_STRING!;
const databaseName = process.env.COSMOS_DATABASE_NAME || "TaskApp";
const containerName = process.env.COSMOS_CONTAINER_NAME || "Tasks";

const client = new CosmosClient(cosmosConnection);

export async function UpdateTask(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    context.log(`UpdateTask request: ${request.url}`);

    const taskId = request.query.get("id");
    const organizationId = request.query.get("organizationId");

    if (!taskId || !organizationId) {
      return {
        status: 400,
        jsonBody: error("id and organizationId are required")
      };
    }

    const body = (await request.json()) as Record<string, unknown>;

    if (!body || Object.keys(body).length === 0) {
      return {
        status: 400,
        jsonBody: error("Request body cannot be empty")
      };
    }

    body.updatedAt = new Date().toISOString();

    const patchRequests: PatchOperation[] = Object.keys(body).map((key) => ({
      op: "replace",
      path: `/${key}`,
      value: body[key]
    }));

    const container = client.database(databaseName).container(containerName);

    const { resource } = await container.item(taskId, organizationId).patch(patchRequests);

    if (!resource) {
      return {
        status: 404,
        jsonBody: error("Task not found")
      };
    }

    const { _rid, _self, _etag, _attachments, _ts, ...cleanTask } = resource as any;

    return {
      status: 200,
      jsonBody: success(cleanTask, { message: "Task updated successfully" })
    };
  } catch (err) {
    context.log("UpdateTask error:", err);

    return {
      status: 500,
      jsonBody: error("Internal server error")
    };
  }
}

app.http("UpdateTask", {
  methods: ["PUT"],
  authLevel: "anonymous",
  handler: UpdateTask,
  route: "tasks/{id}"
});