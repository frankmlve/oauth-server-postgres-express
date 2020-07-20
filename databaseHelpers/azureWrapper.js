const CosmosClient = require("@azure/cosmos").CosmosClient;
const config = require("./config");
const dbContext = require("./data/databaseContext");

const { endpoint, key, databaseId, containerId } = config;

const client = new CosmosClient({ endpoint, key });

const database = client.database(databaseId);
const container = database.container(containerId);
module.exports = {
  container: container
}
// Make sure Tasks database is already setup. If not, create it.
await dbContext.create(client, databaseId, containerId);