let userDBHelper
let expressApp = require('../index')
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
    if (sqlError !== undefined || doesUserExist) {
      const message = sqlError !== undefined ? "Operation unsuccessful" : userExist_string
      const error = sqlError !== undefined ? sqlError : userExist_string;
      sendResponse(res, message, sqlError)
      return
    }
    //register the user in the db
    userDBHelper.registerUserInDB(req.body.username, req.body.password, dataResponseObject => {
      //create message for the api response
      const message = dataResponseObject.error === undefined ? "Registration was successful" : "Failed to register user"
      sendResponse(res, message, dataResponseObject.error)
    })
  })
}

function login(req, res) {
  userDBHelper.getUserFromCrentials(req.body.username, req.body.password, (sqlError, doesUserExist) => {
    if (doesUserExist) {
      if (doesUserExist.last_update === undefined ) {
        const message = 'Password most be update';
        sendResponse(res, message, sqlError)
        return
      }else {
        expressApp.oauth.grant()
      }
    }
  })
}

//Method reset user password
function resetPassword(req, res) {
  userDBHelper.updateUserPassword(req.body.username, req.body.password, (callback) => {
    const message = callback.error === undefined ? "Password was updated" : "Failed to update password";
    sendEmailWithNewToken(req.body.username);
    sendResponse(res, message, callback.error);
  });
}

//sends a response created out of the specified parameters to the client.
function sendResponse(res, message, error) {
  res.status(error !== undefined ? 400 : 200).json({
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
