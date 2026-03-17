import { CosmosClient } from "@azure/cosmos";
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { success, error } from "../utils/response";

const cosmosConnection = process.env.COSMOS_CONNECTION_STRING!;
const databaseName = process.env.COSMOS_DATABASE_NAME || "TaskApp";
const containerName = process.env.COSMOS_CONTAINER_NAME || "Tasks";

const client = new CosmosClient(cosmosConnection);

export async function GetTask(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {

  try {

    context.log(`GetTask request: ${request.url}`);

    const taskId = request.params.id;
    const organizationId = request.query.get("organizationId");

    if (!taskId || !organizationId) {
      return {
        status: 400,
        jsonBody: error("id and organizationId are required")
      };
    }

    const container = client.database(databaseName).container(containerName);

    const { resource } = await container
      .item(taskId, organizationId)
      .read();

    if (!resource) {
      return {
        status: 404,
        jsonBody: error("Task not found")
      };
    }

    const { _rid, _self, _etag, _attachments, _ts, ...task } = resource as any;

    return {
      status: 200,
      jsonBody: success(task, {
        message: "Task retrieved successfully"
      })
    };

  } catch (err) {

    context.log("GetTask error:", err);

    return {
      status: 500,
      jsonBody: error("Internal server error")
    };
  }
}

app.http("GetTask", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: GetTask,
  route: "tasks/{id}",
});