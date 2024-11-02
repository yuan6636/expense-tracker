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
  async (req, email, password, cb) => {
    try {
      const user = await User.findOne({
        attributes: ['id', 'name', 'email', 'password'],
        where: { email },
        raw: true
      })

      if (!user) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤!'))

      const result = await bcrypt.compare(password, user.password)
      if (!result) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤!'))
      return cb(null, user)

    } catch (err) {
      req.flash('error_messages', '登入失敗!')
      return cb(err)
    }
  }
))

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
  }, 
  async (req, accessToken, refreshToken, profile, cb) => {
    try {
      const email = profile.email
      const name = profile.displayName

      const user = await User.findOne({
        attributes: ['id', 'name', 'email'],
        where: { email },
        raw: true
      })

      if (user) return cb(null, user)

      const randomPwd = Math.random().toString(36).slice(-8)
      const hash = await bcrypt.hash(randomPwd, 10)
      const userProfile = await User.create({ name, email, password: hash })
      return cb(null, { id: userProfile.id, name: userProfile.name, email: userProfile.email })

    } catch (err) {
      req.flash('error_messages', '登入失敗!')
      return cb(err)
    }
  }
))

passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
passport.deserializeUser(async(id, cb) => {
  try {
    const user = await User.findByPk(id)
    if (!user) return cb(new Error('找不到使用者'))
    cb(null, user.toJSON())

  } catch (error) {
    cb(err)
  }
})

module.exports = passport