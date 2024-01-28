const express = require('express')
const router = express.Router()
const passport = require('../config/passport')

router.get('/login/google', passport.authenticate('google', { scope: ['email', 'profile']}))

router.get('/oauth2/redirect/google', passport.authenticate('google', {
      successRedirect: '/records',
      failureRedirect: '/login',
      failureFlash: true
}))

module.exports = router