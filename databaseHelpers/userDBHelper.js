let azureConnection;
var crypto = require("crypto");
let current_date = new Date().toISOString();


module.exports = injectedAzureConnection => {

  azureConnection = injectedAzureConnection

  return {

    registerUserInDB: registerUserInDB,
    getUserFromCrentials: getUserFromCrentials,
    doesUserExist: doesUserExist,
    updateUserPassword: updateUserPassword,
    getUserForResetPass: getUserForResetPass,
    updateUserOldPassword: updateUserOldPassword
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

  const newUser = {};
  console.log('Query para insert= ' + registerUserQuery)
  azureConnection.query(registerUserQuery, registrationCallback)
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
  azureConnection.query(getUserQuery, (dataResponseObject) => {
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
  const doesUserExistQuery = `SELECT * FROM c c WHERE c.user = "${username}"`
  console.log(doesUserExistQuery)
  /*   const sqlCallback = (dataResponseObject) => {

      const doesUserExist = dataResponseObject.results !== undefined ? dataResponseObject.results.rowCount > 0 ? true : false : null
      callback(dataResponseObject.error, doesUserExist)
    } */
  const {
    resources: items
  } = await container.items
    .query(querySpec)
    .fetchAll();

    console.log(items)
}

function getUserForResetPass(user_id, username, callback) {
  const getUserQuery = user_id != null ? `SELECT * FROM "users" u WHERE u.id = '${user_id}'` : `SELECT * FROM "users" u WHERE u.username = '${username}'`
  const sqlCallback = (dataResponseObject) => {
    const userExist = dataResponseObject.results !== undefined ? dataResponseObject.results.rows : null
    callback(dataResponseObject.error, userExist)
  }
  azureConnection.query(getUserQuery, sqlCallback)
}
//Updating user password last_update
function updateUserPassword(userName, password, sqlCallback) {
  let date = new Date().setMonth(new Date().getMonth() + parseInt(process.env.PASSWORD_EXPIRE_DATE))
  let expiration_date = new Date(date).toISOString()
  const updatePasswordQuery = `UPDATE "users" set password = '${password}', last_update = '${current_date}', expiration_date= '${expiration_date}' WHERE username = '${userName}';`
  azureConnection.query(updatePasswordQuery, sqlCallback)

}

function updateUserOldPassword(username, old_password, sqlCallback) {
  //var shaPass = crypto.createHash("sha256").update(old_password).digest("hex");
  const updateOldPasswordQuery = `INSERT INTO "old_passwords"  (username, old_password) VALUES ('${username}', '${old_password}');`;
  azureConnection.query(updateOldPasswordQuery, sqlCallback);
}