const express = require('express')

const authController = require('../controllers/auth')

const router = express.Router()

router.get('/login', authController.getLogin)

router.get('/signup', authController.getSignUp)

router.post('/signup', authController.postSignUp)

router.post('/login', authController.postLogin)

router.post('/logout', authController.postLogout)

module.exports = router
