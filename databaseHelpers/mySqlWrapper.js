module.exports = {
  query: query,
};

const {
  Pool
} = require('pg')
const connectionString = process.env.DATABASE_URL

function query(queryString, cbFunc) {
  const pool = new Pool({
    /* user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
    ssl: true */
    connectionString: connectionString,
  });

  pool.query(queryString, (error, results) => {
    cbFunc(setResponse(error, results));
  });
}

function setResponse(error, results) {
  return {
    error: error,
    results: results ? results : null,
  };
}
