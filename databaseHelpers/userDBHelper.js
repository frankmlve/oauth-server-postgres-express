let mySqlConnection;

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
let current_date = new Date().toISOString().slice(0, 19).replace('T', ' ');

function registerUserInDB(username, password, registrationCallback) {

  //create query using the data in the req.body to register the user in the db
  const registerUserQuery = `INSERT INTO "users" (username, password, created_date) VALUES ('${username}', SHA('${password}'), '${current_date}')`
console.log('Query para insert= '+registerUserQuery)
  //execute the query to register the user
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

  //create query using the data in the req.body to register the user in the db
  const getUserQuery = `SELECT * FROM "users" WHERE username = '${username}' AND password = SHA('${password}')`

  //execute the query to get the user
  mySqlConnection.query(getUserQuery, (dataResponseObject) => {
    //pass in the error which may be null and pass the results object which we get the user from if it is not null
    callback(false, dataResponseObject.results !== null && dataResponseObject.results.length === 1 ? dataResponseObject.results[0] : null)
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
  const sqlCallback = (dataResponseObject) => {
    const doesUserExist = dataResponseObject.results !== null ? dataResponseObject.results.length > 0 ? true : false : null
    callback(dataResponseObject.error, doesUserExist)
  }
  mySqlConnection.query(doesUserExistQuery, sqlCallback)
}


//Updating user password last_update
function updateUserPassword(userName, password, sqlCallback) {
  let current_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const updatePasswordQuery = `UPDATE "users" set password = SHA('${password}'), last_update = '${current_date}' WHERE username = '${userName}';`
  mySqlConnection.query(updatePasswordQuery, sqlCallback)

}
