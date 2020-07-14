module.exports = {
  query: query
}
const dotenv = require('dotenv');
const POOL = require('pg').Pool;
var pool;
dotenv.config();

function initConnection() {
   pool = new POOL({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,

  })
}

/**
 * executes the specified sql query and provides a callback which is given
 * with the results in a DataResponseObject
 *
 * @param queryString
 * @param callback - takes a DataResponseObject
 */
function query(queryString, callback) {
  initConnection()
  pool.query(queryString, function (error, results, fields) {
    callback(setResponse(error, results))
  })
}

/**
 * creates and returns a DataResponseObject made out of the specified parameters.
 * A DataResponseObject has two variables. An error which is a boolean and the results of the query.
 *
 * @param error
 * @param results
 * @return {DataResponseObject<{error, results}>}
 */
function setResponse(error, results) {
  return {
    error: error,
    results: results === undefined ? null : results === null ? null : results
  }
}