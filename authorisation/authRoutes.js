module.exports =  (router, expressApp, authRoutesMethods) => {

    //route for registering new users
    router.post('/register',expressApp.oauth.authorise(), authRoutesMethods.registerUser)

    //route for allowing existing users to login
    router.post('/login', expressApp.oauth.grant(), authRoutesMethods.login)

    //router for reset password
    router.post('/reset-pass', authRoutesMethods.resetPassword)

    //router for update password
    router.post('/newPassword', authRoutesMethods.updatePassword)

    //router for delete user
    router.delete('/deleteUser',expressApp.oauth.authorise(), authRoutesMethods.deleteUser)
    
    return router
}
