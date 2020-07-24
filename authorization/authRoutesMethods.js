let userDBHelper
const oauth = require('../oauthConfig')
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
    updatePassword: updatePassword,
    deleteUser: deleteUser
  }
}

function registerUser(req, res) {
  userDBHelper.validateIfAdminUser(req.body.admin_user, (error, result) => {
    let message;
    console.log(result)
    if (result && result.role.toLowerCase() === 'admin') {
      userDBHelper.doesUserExist(req.body.username, (sqlError, doesUserExist) => {

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
          userDBHelper.registerUserInDB(req.body.username, req.body.password, req.body.role, dataResponseObject => {
            //create message for the api response
            message = dataResponseObject.error === undefined ? "Registration was successful" : "Failed to register user"
            sendResponse(res, message, dataResponseObject.error)
          })
        }
      })
    }else {
      message = `You don't have permissions to regiter new users, please contact to Digital IT Manager`
      sendResponse(res, message, error ? error : true)
      return
    }
  }) 
}

function login(req, res, next) {
userDBHelper.getUserFromCrentials(req.body.username, req.body.password, (error, result) => {
  let current_date = new Date().toISOString();
  if (result){
    if (result.last_update === null ||   current_date > result.expiration_date) {
      sendResponse(res, 'Password most be update', error)
      return
    }
    next()
  }else {
    sendResponse(res, 'User credentials are invalid', error);
    return
  }   
  }) 
}

//Method reset user password
function resetPassword(req, res) {
  userDBHelper.getUserForResetPass(null, req.body.username, (error, result) => {
    let message = '';
    if (result) {
      var payload = {
        email: req.body.username
      }
      var secret = result.password + '-' + new Date(result.create_date).getTime()
      var token = jwt.encode(payload, secret)
      sendEmailWithNewToken(req.body.username, result.id, req.body.app_url, token, res);
    } else {
      message = 'User not registered';
      error = error;
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
    var secret = result.password + '-' + (new Date(result.create_date).getTime()).toString();
    if (error) {
      sendResponse(res, message, error)
    }
    try {
      var payload = jwt.decode(req.body.token, secret);
    } catch (error) {
      const message = 'You already use this token, please use another one'
      sendResponse(res, message, error.stack)
      return
    }

    if (payload.email != result.username) {
      message = `User is not valid`;
      error = true;
      sendResponse(res, message, error);
      return
    }

    //Getting all old's passwords used for the user

    pass.push(result.password);
    if (result.old_password) {
      let count = 0;
      for (let p of result.old_password) {
        pass.push(p['pass' + count]);
        count++
      }

    }
    var flag = pass.some(val => newPass.indexOf(val) !== -1);
    if (flag) {
      message = `Can't use this password, please choose one you have not used before`
      sendResponse(res, message, error);
      return
    } else {
      userDBHelper.updateUserOldPassword(result.username, result.password, callback => {
        userDBHelper.updateUserPassword(result.username, newPass, callback => {
          message = callback.error != undefined ? callback.error : 'Password was successfully updated';
          sendResponse(res, message, callback.error)
        });
      });
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
    from: process.env.EMAIL_USER,
    to: username,
    subject: 'Reinicion de Contraseña',
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

function deleteUser(req,res){
  userDBHelper.validateIfAdminUser(req.body.admin_user, (error, result) => {
    let message;
    if (result && result.role.toLowerCase() === 'admin') {
      userDBHelper.getUserForDelete(req.body.username, (err, user) => {
        if (user) {
          userDBHelper.deleteUser(user.id, (sqlError, results) => {
            if (!sqlError) {
              message = `User was successfully deleted`
              sendResponse(res, message, sqlError)
            }else {
              message = `Was an error during deletion of user`
              sendResponse(res, message, sqlError)
              return
            }
          })
        }else {
          message = `Please insert a valid user for delete`
          sendResponse(res, message, true)
          return
        }
      })
    }else {
      message = `You don't have permissions to delete users, please contact to Digital IT Manager`
      sendResponse(res, message, true)
      return
    }
  })
}