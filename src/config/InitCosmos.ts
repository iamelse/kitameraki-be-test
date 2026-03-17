import { client } from "./CosmosClient";

export async function initCosmos() {

  const { database } = await client.databases.createIfNotExists({
    id: "TaskApp"
  });

  await database.containers.createIfNotExists({
    id: "Tasks",
    partitionKey: {
      paths: ["/organizationId"]
    }
  });

  console.log("Cosmos DB ready");
}