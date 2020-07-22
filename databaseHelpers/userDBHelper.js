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


async function registerUserInDB(username, password, registrationCallback) {
  var shaPass = crypto.createHash("sha256").update(password).digest("hex");
  let user_id = await azureConnection.container.items.query(`select max(c.id) from c c`).fetchAll();
  let max_id = user_id.resources[0].$1 == undefined ? 0 : user_id.resources[0].$1;
  const newUser = {
    id: (parseInt(max_id) + 1).toString(),
    category: 'users',
    username: username,
    password: shaPass,
    create_date: current_date,
    last_update: null,
  };
  try {
    const {
      resource: createdItem
    } = await azureConnection.container.items.create(newUser);
    let response = {

    }
    registrationCallback(response)
  } catch (e) {
    e.error = true;
    registrationCallback(e)
  }


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
async function getUserFromCrentials(username, password, callback) {

  var shaPass = crypto.createHash("sha256").update(password).digest("hex");
  const getUserQuery = `SELECT * FROM c c WHERE c.username = '${username}' AND c.password = '${shaPass}'`
  console.log(getUserQuery)

  //execute the query to get the user
  try {
    let user = await azureConnection.container.items.query(getUserQuery).fetchAll();
    console.log(user.resources[0])
    callback(user.resources[0] == undefined ? 'Username or password not match with our database' : false, user.resources !== undefined && user.resources.length === 1 ? user.resources[0] : undefined)

  } catch (error) {
    console.log(error)
    callback(true, error)
  }

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
async function doesUserExist(username, callback) {
  const doesUserExistQuery = `SELECT * FROM c c WHERE c.username = "${username}"`

  console.log(doesUserExistQuery)
  const {
    resources: items
  } = await azureConnection.container.items
    .query(doesUserExistQuery)
    .fetchAll();

  if (items.length == 0) {
    callback(undefined, false)
  } else {
    callback('User already exist!', true)
  }
}

async function getUserForResetPass(user_id, username, callback) {
  const getUserQuery = user_id != null ? `SELECT * FROM c c WHERE c.id = '${user_id}'` : `SELECT * FROM c c WHERE c.username = '${username}'`
  try {
    let user = await azureConnection.container.items.query(getUserQuery).fetchAll();
    callback(undefined, user.resources[0])
  } catch (error) {
    console.log(error)
    callback(error, false)
  }
}
//Updating user password last_update
async function updateUserPassword(userName, password, sqlCallback) {
  let date = new Date().setMonth(new Date().getMonth() + parseInt(process.env.PASSWORD_EXPIRE_DATE))
  let expiration_date = new Date(date).toISOString()

  let getUserQuery = `select * from c c where c.username= '${userName}'`
  try {
    let user = await azureConnection.container.items.query(getUserQuery).fetchAll();
    user.resources[0].last_update = current_date;
    user.resources[0].expiration_date = expiration_date;
    user.resources[0].password = password;
    const {
      id
    } = user.resources[0];
    const {
      resource: updatedItem
    } = await azureConnection.container
      .item(id)
      .replace(user.resources[0]);
    sqlCallback()
  } catch (error) {
    console.log(error)
    sqlCallback(error)
  }

}

async function updateUserOldPassword(username, old_password, sqlCallback) {
  let getUserQuery = `select * from c c where c.username= '${username}'`
  try {
    let user = await azureConnection.container.items.query(getUserQuery).fetchAll();
    let pass_length = Object.keys(user.resources[0].old_password).length
    let newKey = 'pass' + pass_length
    user.resources[0].old_password.push({[newKey] : old_password })
    const {
      id
    } = user.resources[0];
    const {
      resource: updatedItem
    } = await azureConnection.container
      .item(id)
      .replace(user.resources[0]);
    sqlCallback()
  } catch (error) {
    console.log(error)
    sqlCallback(error)
  }

}