const User = require('../models/user')

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

module.exports.registerUser = async (req, res) => {
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
}

module.exports.renderUserLogin = (req, res) => {
    res.render('users/login')
}

module.exports.loginUser = async (req, res) => {
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo
    req.flash('success', 'Welcome Back')
    res.redirect(redirectUrl)
}

module.exports.logoutUser = async (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err)
        }
        req.flash('success', 'Logged Out Successfully')
        res.redirect('/campgrounds')
    })
}