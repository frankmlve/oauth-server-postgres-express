let userDBHelper
const userExist_string = "User already exists";
var crypto = require("crypto");

const nodemailer = require('nodemailer');

const jwt = require('jwt-simple');
const dotenv = require('dotenv');
dotenv.config();

module.exports = (injectedUserDBHelper) => {

  userDBHelper = injectedUserDBHelper

  return {
    registerUser: registerUser,
    login: login,
    resetPassword: resetPassword,
    sendEmailWithNewToken: sendEmailWithNewToken,
    updatePassword: updatePassword
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
  userDBHelper.getUserForResetPass(req.body.username, (error, result) => {
    let message = '';
    if (result) {
      var payload = {
        email: req.body.username
      }
      var secret = result.password + '-' + result.created_date.getTime()
      var token = jwt.encode(payload, secret)
      sendEmailWithNewToken(req.body.username, req.body.app_url, token);
      message = 'We send you an email with the link to reset your password'
    } else {
      message = 'User not registered';
      error = 'Please insert a valid user';
    }

    sendResponse(res, message, error)
  });
}
var newPass;

function updatePassword(req, res) {
  newPass = crypto.createHash("sha256").update(req.body.password).digest("hex");
  userDBHelper.getUserForResetPass(req.body.username, (error, result) => {
    if (result && (newPass != result.password)) {
      userDBHelper.updateUserPassword(result.username, newPass, callback => {
        const message = callback.error != undefined ? callback.error : 'Password was update successfully';
        sendResponse(res, message, callback.error)
      })
    } else {
      const message = 'New password have to be different from the actual'
    }
  })
}
//sends a response created out of the specified parameters to the client.
function sendResponse(res, message, error) {
  res.status(error !== undefined ? 400 : 200).json({
    message: message,
    error: error,
  });
}

function sendEmailWithNewToken(username, app_url, token) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  var transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    debug: true,
    logger: true
  });

  var mailOptions = {
    from: process.env.EMAIL_USER,
    to: username,
    subject: 'Reset Password',
    html: '<p>Please go to this link to <a href="' + app_url + '/' + token + '"> reset your password</a></p>'
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}