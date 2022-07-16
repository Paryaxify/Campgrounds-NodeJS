const express = require('express')
const passport = require('passport')
const router = express.Router()

const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')

const users = require('../controllers/users')

router.get('/register', users.renderRegister)

router.post('/register', catchAsync(users.registerUser))

router.get('/login', users.renderUserLogin)

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), users.loginUser)

router.post('/logout', users.logoutUser)

module.exports = router