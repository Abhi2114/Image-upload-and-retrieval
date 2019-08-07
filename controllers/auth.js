const UserModel = require('../models/user')
const bcrypt = require('bcryptjs')

exports.getLogin = (request, response, next) => {

    response.render('login', {
        pageTitle: 'Login'
    })

}

exports.postLogin = (request, response, next) => {

    const email = request.body.email
    const password = request.body.password

    // get the dummy user information
    UserModel.findOne({email: email})   
        .then(user => {

            if (user) {
                // user with email exists
                // now we check the password
                return Promise.all([bcrypt.compare(password, user.password), user])
            }
            // user with given email does not exist
            return null
        })
        .then(result => {

            if (result && result[0] === true) {
                
                // login succes: create session and save
                request.session.isLoggedIn = true
                request.session.user = result[1]

                request.session.save(error => {
                    response.redirect('/')
                })
            }
            else {
                // wrong email or password
                response.redirect('/login')
            }

        })
        .catch(error => {
            console.log(error)
            response.redirect('/login')
        })

}

exports.getSignUp = (request, response, next) => {
    response.render('signup', {pageTitle: 'Sign Up'})
}

exports.postSignUp = (request, response, next) => {
    // save a new user
    const email = request.body.email
    const password = request.body.password
    const confirmPassword = request.body.confirmPassword

    // do some primitive validation
    if (password !== confirmPassword)
        return response.redirect('/signup')
    
    // check if user with same email exists or not
    UserModel.findOne({email: email})
        .then(result => {
            if (result) {
                // user with email exists
                return null
            }
            // hash the user password before storing it
            return bcrypt.hash(password, 12)
        })
        .then(hashedPassword => {

            if (hashedPassword){
                // create a new user
                return new UserModel({
                    email: email,
                    password: hashedPassword,
                    images: []
                }).save()

            }
            
            return null
        })
        .then(result => {

            if (result)
                return response.redirect('/login')

            return response.redirect('/signup')
        })
        .catch(error => {
            console.log(error)
        })
}

exports.postLogout = (request, response, next) => {
    // destroy the session
    request.session.destroy((error) => {
        // called after the session has been destroyed
        console.log(error)
        response.redirect('/login')
    })
}
