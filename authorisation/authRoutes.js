module.exports = (router, expressApp, authRoutesMethods) => {

    //route for registering new users
    router.post('/register', authRoutesMethods.registerUser)

    //route for allowing existing users to login
     router.post('/login', authRoutesMethods.login, expressApp.oauth.grant())
    //router.post('/login', authRoutesMethods.login)

    //router for reset password
    router.post('/reset-pass', authRoutesMethods.resetPassword)

    router.post('/newPassword', authRoutesMethods.updatePassword)

    return router
}