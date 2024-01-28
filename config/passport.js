const passport = require('passport')
const LocalStrategy = require('passport-local')
const GoogleStrategy = require('passport-google-oauth2').Strategy
const bcrypt = require('bcryptjs')
const { User } = require('../models')

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  (req, email, password, cb) => {
    return User.findOne({ 
      attributes: ['id', 'name', 'email', 'password'],
      where: { email },
      raw: true 
    })
      .then(user => {
        if(!user) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤!'))

        bcrypt.compare(password, user.password).then(res => {
          if (!res) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤!'))
          return cb(null, user)
        })
      })
      .catch(err => {
        req.flash('error_messages', '登入失敗!')
        cb(err)
      })
  }
))

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
  }, 
  (req, accessToken, refreshToken, profile, cb) => {
    const email = profile.email
    const name = profile.displayName
    
    return User.findOne({ 
      attributes: ['id', 'name', 'email'],
      where: { email },
      raw: true
    })
      .then(user => {
        if (user) return cb(null, user)

        const randomPwd = Math.random().toString(36).slice(-8)
        return bcrypt.hash(randomPwd, 10)
          .then(hash => User.create({name, email, password: hash}))
          .then(user => cb(null, {id: user.id, name: user.name, email: user.email}))
      })
      .catch(err => {
        req.flash('error_messages', '登入失敗!')
        cb(err)
      })
  }
))

passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
passport.deserializeUser((id, cb) => {
  return User.findByPk(id)
    .then(user => cb(null, user.toJSON()))
    .catch(err => cb(err))
})

module.exports = passport