const express = require('express')
const router = express.Router()
const userController = require('../controllers/user')
const isAuth = require('../middleware/is-auth')

router.get('/', isAuth, userController.getImages)

router.get('/search', isAuth, userController.searchImage)

router.post('/upload', isAuth, userController.uploadImage)

router.delete('/image/:imageName', isAuth, userController.deleteImage)

module.exports = router
