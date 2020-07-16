let mySqlConnection;
var crypto = require("crypto");
let current_date = new Date().toISOString();

module.exports = injectedMySqlConnection => {

  mySqlConnection = injectedMySqlConnection

  return {

    registerUserInDB: registerUserInDB,
    getUserFromCrentials: getUserFromCrentials,
    doesUserExist: doesUserExist,
    updateUserPassword: updateUserPassword
  }
}


/**
 * attempts to register a user in the DB with the specified details.
 * it provides the results in the specified callback which takes a
 * DataResponseObject as its only parameter
 *
 * @param username
 * @param password
 * @param registrationCallback - takes a DataResponseObject
 */


function registerUserInDB(username, password, registrationCallback) {
  var shaPass = crypto.createHash("sha256").update(password).digest("hex");
  const registerUserQuery = `INSERT INTO "users" (username, password, created_date) VALUES ('${username}', '${shaPass}', '${current_date}')`
  console.log('Query para insert= ' + registerUserQuery)
  mySqlConnection.query(registerUserQuery, registrationCallback)
}

/**
 * Gets the user with the specified username and password.
 * It provides the results in a callback which takes an:
 * an error object which will be set to null if there is no error.
 * and a user object which will be null if there is no user
 *
 * @param username
 * @param password
 * @param callback - takes an error and a user object
 */
function getUserFromCrentials(username, password, callback) {

  var shaPass = crypto.createHash("sha256").update(password).digest("hex");
  const getUserQuery = `SELECT * FROM "users" WHERE username = '${username}' AND password = '${shaPass}'`
  console.log(getUserQuery)

  //execute the query to get the user
  mySqlConnection.query(getUserQuery, (dataResponseObject) => {
    //pass in the error which may be undefined and pass the results object which we get the user from if it is not null
    callback(false, dataResponseObject.results !== undefined && dataResponseObject.results.rows.length === 1 ? dataResponseObject.results.rows[0] : undefined)
  })
}

/**
 * Determines whether or not user with the specified userName exists.
 * It provides the results in a callback which takes 2 parameters:
 * an error object which will be set to null if there is no error, and
 * secondly a boolean value which says whether or the user exists.
 * The boolean value is set to true if the user exists else it's set
 * to false or it will be null if the results object is null.
 *
 * @param username
 * @param callback - takes an error and a boolean value indicating
 *                   whether a user exists
 */
function doesUserExist(username, callback) {
  const doesUserExistQuery = `SELECT * FROM "users" WHERE username = '${username}'`
  console.log(doesUserExistQuery)
  const sqlCallback = (dataResponseObject) => {

    const doesUserExist = dataResponseObject.results !== undefined ? dataResponseObject.results.rowCount > 0 ? true : false : null
    callback(dataResponseObject.error, doesUserExist)
  }
  mySqlConnection.query(doesUserExistQuery, sqlCallback)
}


//Updating user password last_update
function updateUserPassword(userName, password, sqlCallback) {
  var shaPass = crypto.createHash("sha256").update(password).digest("hex");

  const updatePasswordQuery = `UPDATE "users" set password = ${shaPass}', last_update = '${current_date}' WHERE username = '${userName}';`
  mySqlConnection.query(updatePasswordQuery, sqlCallback)

}