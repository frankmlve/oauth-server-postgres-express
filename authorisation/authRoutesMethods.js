let userDBHelper
let tokenDBHelper
const userExist_string = "User already exists";
var crypto = require("crypto");
const { response } = require("express");
const { send } = require("process");

module.exports = (injectedUserDBHelper) => {

  userDBHelper = injectedUserDBHelper

  return {
    registerUser: registerUser,
    login: login,
    resetPassword: resetPassword
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

function login(req, res) {}

function resetPassword(req, res) {
  userDBHelper.updateUserPassword(req.body.username, (callback) => {
    const message = callback.error === null ? "Password was updated" : "Failed to update password"
    sendResponse(res, message, callback.error);
  });
}

//sends a response created out of the specified parameters to the client.
function sendResponse(res, message, error) {
  res.status(error !== null ? 400 : 200).json({
    message: message,
    error: error,
  });
}