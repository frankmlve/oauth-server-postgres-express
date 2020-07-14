//MARK: --- REQUIRE MODULES
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.SERVER_PORT;
const mySqlConnection = require('./databaseHelpers/mySqlWrapper')
const accessTokenDBHelper = require('./databaseHelpers/accessTokensDBHelper')(mySqlConnection)
const userDBHelper = require('./databaseHelpers/userDBHelper')(mySqlConnection)
const oAuthModel = require('./authorisation/accessTokenModel')(userDBHelper, accessTokenDBHelper)

const express = require('express')
const expressApp = express()

const oAuth2Server = require('node-oauth2-server')
expressApp.oauth = oAuth2Server({
  model: oAuthModel,
  grants: ['password'],
  debug: true
})

const restrictedAreaRoutesMethods = require('./restrictedArea/restrictedAreaRoutesMethods.js')
const restrictedAreaRoutes = require('./restrictedArea/restrictedAreaRoutes.js')(express.Router(), expressApp, restrictedAreaRoutesMethods)
const authRoutesMethods = require('./authorisation/authRoutesMethods')(userDBHelper)
const authRoutes = require('./authorisation/authRoutes')(express.Router(), expressApp, authRoutesMethods)
const bodyParser = require('body-parser')

//enable CORS
expressApp.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//set the bodyParser to parse the urlencoded post data
expressApp.use(bodyParser.urlencoded({ extended: true }))

//set the oAuth errorHandler
expressApp.use(expressApp.oauth.errorHandler())

//set the authRoutes for registration and & login requests
expressApp.use('/auth', authRoutes)

//set the restrictedAreaRoutes used to demo the accesiblity or routes that ar OAuth2 protected
expressApp.use('/restrictedArea', restrictedAreaRoutes)

//MARK: --- INITIALISE MIDDLEWARE & ROUTES

//init the server
expressApp.listen(process.env.SERVER_PORT || 5000)