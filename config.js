// @ts-check

const config = {
    endpoint: "https://oauth-gihsa-portalaccionista-db.documents.azure.com:443/",
    key: "mFTlxPH8zZfvlN3526BEqODD689jXNfourhQWUef1tCwzyjmRccIvSfKELaHfLPYssIjWMgU8lk22ecvlwBMwA==",
    databaseId: "userdirectory",
    containerId: "usserdirectory",
    partitionKey: { kind: "Hash", paths: ["/users"] }
  };
  
  module.exports = config;