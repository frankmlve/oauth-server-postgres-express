const express = require('express')
const expressApp = express()
const azureConnection = require('./databaseHelpers/azureWrapper')
const accessTokenDBHelper = require('./databaseHelpers/accessTokensDBHelper')(azureConnection)
const userDBHelper = require('./databaseHelpers/userDBHelper')(azureConnection)
const oAuthModel = require('./authorization/accessTokenModel')(userDBHelper, accessTokenDBHelper)

const oAuth2Server = require('node-oauth2-server')
const oauth = expressApp.oauth = oAuth2Server({
  model: oAuthModel,
  grants: ['password'],
  debug: true
})
module.exports.oauth = oauth;