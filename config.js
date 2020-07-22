// @ts-check

const config = {
    endpoint: process.env.DATABASE_HOST,
    key: process.env.DATABASE_PASSWORD,
    databaseId: process.env.DATABASE_NAME,
    containerId: process.env.DATABASE_CONTAINER,
    partitionKey: { kind: "Hash", paths: [process.env.DATABASE_PATH] }
  };
  
  module.exports = config;