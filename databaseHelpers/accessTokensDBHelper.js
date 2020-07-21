let azureConnection

module.exports = injectedazureConnection => {

  azureConnection = injectedazureConnection

  return {
    saveAccessToken: saveAccessToken,
    getUserIDFromBearerToken: getUserIDFromBearerToken
  }
}

/**
 * Saves the accessToken against the user with the specified userID
 * It provides the results in a callback which takes 2 parameters:
 *
 * @param accessToken
 * @param userID
 * @param callback - takes either an error or null if we successfully saved the accessToken
 */
async function saveAccessToken(accessToken, userID, callback) {
  if (userID === 0 ){
    callback('')
  }
  const getUserQuery = `select * from c c where c.id= '${userID}'`
  try {
    let user = await azureConnection.container.items.query(getUserQuery).fetchAll();

    const { id, category } = user.resources[0];

    user.resources[0].access_token = accessToken;
    const { resource: updatedItem } = await azureConnection.container
      .item(id)
      .replace(user.resources[0]);

      callback(undefined)
  } catch (error) {
    console.log(error)
    callback(error)
  }
}

/**
 * Retrieves the userID from the row which has the spcecified bearerToken. It passes the userID
 * to the callback if it has been retrieved else it passes null
 *
 * @param bearerToken
 * @param callback - takes the user id we if we got the userID or null to represent an error
 */
async function getUserIDFromBearerToken(bearerToken, callback) {

  //create query to get the userID from the row which has the bearerToken
  const getUserIDQuery = `SELECT * FROM c c WHERE c.access_token = "${bearerToken}"`
  console.log(getUserIDQuery)
  //execute the query to get the userID
  try {
    let token = await azureConnection.container.items.query(getUserIDQuery).fetchAll();
    callback(token)
  }catch (error) {
    console.log(error)
    callback(error)
  }

}