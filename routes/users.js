const express = require('express')
const passport = require('passport')
const router = express.Router()

const User = require('../models/user')

const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')

router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', catchAsync(async (req, res) => {
    const { email, username, password } = req.body
    try {
        const user = await User.register(new User({ email, username }), password)
        req.login(user, function (err) {
            if (err) {
                return next(err);
            }
            req.flash('success', 'Successfully created an account')
            res.redirect('/campgrounds')
        });

    } catch (err) {
        req.flash('error', err.message)
        res.redirect('/register')
    }
}))

router.get('/login', (req, res) => {
    res.render('users/login')
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), async (req, res) => {
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo
    req.flash('success', 'Welcome Back')
    res.redirect(redirectUrl)
})

router.post('/logout', async (req, res, next) => {
    req.logout(function(err){
        if (err) {
            return next(err)
        }
        req.flash('success', 'Logged Out Successfully')
        res.redirect('/campgrounds')
    })
})

module.exports = router