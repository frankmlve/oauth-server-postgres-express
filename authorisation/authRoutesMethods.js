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
    let message;
    let error;
    //check if the user exists
    if (sqlError !== undefined || doesUserExist) {
      message = sqlError !== undefined ? "Operation unsuccessful" : userExist_string
      error = sqlError !== undefined ? sqlError : userExist_string;
      sendResponse(res, message, sqlError)
      return
    }
    if (req.body.password == null || req.body.password == '') {
      message = 'Please insert a password';
      sendResponse(res, message, sqlError)
      return
    } else {
      //register the user in the db
      userDBHelper.registerUserInDB(req.body.username, req.body.password, dataResponseObject => {
        //create message for the api response
        message = dataResponseObject.error === undefined ? "Registration was successful" : "Failed to register user"
        sendResponse(res, message, dataResponseObject.error)
      })
    }

  })
}

function login(req, res) {}

//Method reset user password
function resetPassword(req, res) {
  userDBHelper.getUserForResetPass(null, req.body.username, (error, result) => {
    let message = '';
    if (result) {
      var payload = {
        email: req.body.username
      }
      var secret = result[0].password + '-' + result[0].created_date.getTime()
      var token = jwt.encode(payload, secret)
      console.log(token + '- id= ' + result[0].id)
      sendEmailWithNewToken(req.body.username, result[0].id, req.body.app_url, token, res);
    } else {
      message = 'User not registered';
      error = 'Please insert a valid user';
      sendResponse(res, message, error)
      return
    }
  });
}
var newPass;

function updatePassword(req, res) {
  newPass = crypto.createHash("sha256").update(req.body.password).digest("hex");

  userDBHelper.getUserForResetPass(req.query.id, null, (error, result) => {
    let message = '';
    let pass = [];
    if (result) {
      var secret = result[0].password + '-' + result[0].created_date.getTime()
      try {
        var payload = jwt.decode(req.body.token, secret);
      } catch (error) {
        message = error.message
        sendResponse(res, message, error)
        return
      }
      //Getting all old's passwords used for the user
      for (let element of result) {
        pass.push(element.password);
        if (element.old_password) pass.push(element.old_password);
      }
      var flag = pass.some(val => newPass.indexOf(val) !== -1);
      if (flag) {
        message = `Can't use this password, please choose one you have not used before`
        sendResponse(res, message, error);
        return
      } else {
        userDBHelper.updateUserOldPassword(result[0].username, result[0].password, callback => {
          userDBHelper.updateUserPassword(result[0].username, newPass, callback => {
            message = callback.error != undefined ? callback.error : 'Password was successfully updated';
            sendResponse(res, message, callback.error)
          });
        });
      }
    } else {
      message = `Something went worng`;
      error = true;
      sendResponse(res, message, error);
      return
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

function sendEmailWithNewToken(username, user_id, app_url, token, res) {
  var transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  var mailOptions = {
    from: `"Portal de Accionistas GIHSA" <${process.env.EMAIL_USER}>` ,
    to: username,
    subject: 'Reinicio de contraseña Portal accionista GIHSA',
    html: '<p>Por favor dirijase a este link para <a href="' + app_url + '?token=' + token + '&id=' + user_id + '">reiniciar su contraseña</a></p>'
  };
  console.log(mailOptions.html)
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      const message = 'The email could not be sent'
      sendResponse(res, message, error)
      return
    } else {
      console.log('Email sent: ' + info.response);
      const message = 'We send you an email with the link to reset your password'
      error = undefined
      sendResponse(res, message, error)
      return
    }
  });
}