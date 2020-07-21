module.exports = (router, oauth, restrictedAreaRoutesMethods) => {

    //route for entering into the restricted area.
    router.get('/enter', oauth.oauth.authorise(), restrictedAreaRoutesMethods.accessRestrictedArea)

    return router
}