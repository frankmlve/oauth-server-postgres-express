let userDBHelper
let tokenDBHelper
const userExist_string = "User already exists";
var crypto = require("crypto");

module.exports = (injectedUserDBHelper, injectedAccessTokensDBHelper) => {

  userDBHelper = injectedUserDBHelper
  tokenDBHelper = injectedAccessTokensDBHelper

  return {
    registerUser: registerUser,
    login: login,
    saveAccessToken: saveAccessToken
  }
}

function registerUser(req, res) {
  userDBHelper.doesUserExist(req.body.username, (sqlError, doesUserExist) => {
    //check if the user exists
    if (sqlError !== null || doesUserExist) {
      const message = sqlError !== null ? "Operation unsuccessful" : userExist_string
      const error = sqlError !== null ? sqlError : userExist_string
      sendResponse(res, message, sqlError)
      return
    }
    //register the user in the db
    userDBHelper.registerUserInDB(req.body.username, req.body.password, dataResponseObject => {
      //create message for the api response
      const message = dataResponseObject.error === null ? "Registration was successful" : "Failed to register user"

      sendResponse(res, message, dataResponseObject.error)
    })
  })
}

function login(req, res) {
  userDBHelper.getUserFromCrentials(req.body.username, req.body.password, (error, dbResponse) => {
    /* if (dbResponse.last_Update === null || dbResponse.last_Update === undefined) {
      const message = 'Password most be update'
      sendResponse(res, message, error)
      return
    } */
    var shaPass = crypto.createHash("sha256").update(dbResponse.password).digest("hex");
    var expires = new Date(new Date()).toISOString().slice(0,19).replace('T',' ');
    saveAccessToken(shaPass,dbResponse.id, expires, dbResponse, callback);

  })
}
/* saves the accessToken along with the userID retrieved the specified user */
function saveAccessToken(accessToken, clientID, expires, user, callback){
  //save the accessToken along with the user.id
  tokenDBHelper.saveAccessToken(accessToken, user.id, callback)
}
//sends a response created out of the specified parameters to the client.
function sendResponse(res, message, error) {
  res.status(error !== null ? 400 : 200).json({
    message: message,
    error: error,
  });
}