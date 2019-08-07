
// middleware to check if the user is logged in or not
module.exports = (request, response, next) => {
    if (!request.session.isLoggedIn) {
        return response.redirect('/signup')
    }
    // user is logged in, so proceed to the next middleware now
    next()
}
