const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const userRoutes = require('./routes/user')
const authRoutes = require('./routes/auth')
const isAuth = require('./middleware/is-auth')
const path = require('path')
const errorController = require('./controllers/error')
const multer = require('multer')
const shortid = require('shortid')
const readGeneral = require('./util/general').readGeneral

const MONGO_URI = 'mongodb+srv://abhinit:WEQYFdXxNxWYUE2P@cluster0-9oa3q.mongodb.net/main?retryWrites=true'

const UserModel = require('./models/user')

// protect against csrf attacks
const csrf = require('csurf')

const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)

const app = express()

// initialize a session store
const store = new MongoDBStore({
    uri: MONGO_URI,
    collection: 'sessions'
})
const csrfProtection = csrf()

const fileStorage = multer.diskStorage({
    destination: (request, file, cb) => {
        cb(null, 'images')
    },
    filename: (request, file, cb) => {
        cb(null, shortid.generate() + '-' + file.originalname)
    }
})

const fileFilter = (request, file, cb) => {
    // accept only jpg files since our classifier can only work with that
    if (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg')
        cb(null, true)
    else 
        cb(null, false)
}

// use the pug templating engine
app.set('view engine', 'pug')

app.use(bodyParser.urlencoded({ extended: false }))
// handle file uploads using multer
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))

// serve static css
app.use(express.static(path.join(__dirname, 'public')))

// setup the middleware for sessions
app.use(session({secret: "secret key", resave: false, saveUninitialized: false, store: store}))

app.use('/images', isAuth, express.static(path.join(__dirname, 'images')))

app.use(csrfProtection)

app.use((request, response, next) => {

    if (request.session.user) {
        UserModel.findById(request.session.user._id)
        .then(user => {
            request.user = user
            next()
        })
        .catch()
    }
    else next()
})

app.use((request, response, next) => {
    // add the data that should be included in each and every view
    response.locals.csrfToken = request.csrfToken()
    next()
})

app.use(userRoutes)
app.use(authRoutes)
app.use(errorController.pageNotFound)

mongoose.connect(MONGO_URI, {useNewUrlParser: true})
    .then(result => {
        console.log('Connected')

        // read the general json file
        readGeneral()

        app.listen(8000)
        
    })
    .catch(error => {
        console.log(error)
    })
