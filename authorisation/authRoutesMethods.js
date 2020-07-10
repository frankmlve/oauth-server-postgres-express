let userDBHelper
let tokenDBHelper
const userExist_string = "User already exists";
var crypto = require("crypto");
const nodemailer = require('nodemailer');

const dotenv = require('dotenv');
dotenv.config();

module.exports = (injectedUserDBHelper) => {

  userDBHelper = injectedUserDBHelper

  return {
    registerUser: registerUser,
    login: login,
    resetPassword: resetPassword,
    sendEmailWithNewToken: sendEmailWithNewToken
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

//Method reset user password
function resetPassword(req, res) {
  userDBHelper.updateUserPassword(req.body.username, req.body.password, (callback) => {
    const message = callback.error === null ? "Password was updated" : "Failed to update password";
    sendEmailWithNewToken(req.body.username);
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

function sendEmailWithNewToken(username) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  var mailOptions = {
    from: process.env.EMAIL_APP,
    to: username,
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}