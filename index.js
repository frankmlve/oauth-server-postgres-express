//MARK: --- REQUIRE MODULES
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.SERVER_PORT;
const app = require('./oauthConfig')
const azureConnection = require('./databaseHelpers/azureWrapper')
const userDBHelper = require('./databaseHelpers/userDBHelper')(azureConnection)

const express = require('express')
const expressApp = express()

const restrictedAreaRoutesMethods = require('./restrictedArea/restrictedAreaRoutesMethods.js')
const restrictedAreaRoutes = require('./restrictedArea/restrictedAreaRoutes.js')(express.Router(), app, restrictedAreaRoutesMethods)
const authRoutesMethods = require('./authorization/authRoutesMethods')(userDBHelper)
const authRoutes = require('./authorization/authRoutes')(express.Router(), app, authRoutesMethods)
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
expressApp.use(app.oauth.errorHandler())

//set the authRoutes for registration and & login requests
expressApp.use('/auth', authRoutes)

//set the restrictedAreaRoutes used to demo the accesiblity or routes that ar OAuth2 protected
expressApp.use('/restrictedArea', restrictedAreaRoutes)

//MARK: --- INITIALISE MIDDLEWARE & ROUTES

//init the server
expressApp.listen(process.env.PORT || 8080, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, expressApp.settings.env);
});
