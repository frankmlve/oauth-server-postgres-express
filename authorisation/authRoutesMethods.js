let userDBHelper
const userExist_string = "User already exists";
var crypto = require("crypto");

const nodemailer = require('nodemailer');

const jwt = require('jwt-simple');
const dotenv = require('dotenv');
const { measureMemory } = require("vm");
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

function login(req, res) {}

//Method reset user password
function resetPassword(req, res) {
  userDBHelper.doesUserExist(req.body.username, (error, result) => {
    let message = '';
    if (result) {
      sendEmailWithNewToken(req.body.username, res);
      message = 'We send you an email with the link to reset your password'
    }

    sendResponse(res, message, error)
  });
}

//sends a response created out of the specified parameters to the client.
function sendResponse(res, message, error) {
  res.status(error !== undefined ? 400 : 200).json({
    message: message,
    error: error,
  });
}

function sendEmailWithNewToken(username, res) {
  var transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  var mailOptions = {
    from: process.env.EMAIL_USER,
    to: username,
    subject: 'Reset Password',
    html: 'Please go to this link to reset your password '+ process.env.APP_URL + '/auth/newPassword'
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}