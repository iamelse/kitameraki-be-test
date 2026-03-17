import { CosmosClient } from "@azure/cosmos";
import * as https from "https";

const endpoint = process.env.COSMOS_ENDPOINT!;
const key = process.env.COSMOS_KEY!;

const agent = new https.Agent({
  rejectUnauthorized: false
});

export const client = new CosmosClient({
  endpoint,
  key,
  agent
});

export const database = client.database("TaskApp");
export const container = database.container("Tasks");