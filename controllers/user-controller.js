const bcrypt = require('bcryptjs')
const { User } = require('../models')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    if(req.body.password !== req.body.passwordCheck) throw new Error('密碼有誤，請重新輸入密碼')

    return User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if(user) throw new Error('信箱已被註冊，請重新輸入!')

        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash => User.create({
          name: req.body.name,
          email: req.body.email,
          password: hash
        }))
      .then(() => {
        req.flash('success_messages', '註冊成功!')
        return res.redirect('/signin')
      })
      .catch(err => next(err))
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res, next) => {
    req.flash('success_messages', '成功登入!')
    res.redirect('/records')
  },
  logout: (req, res) => {
    req.flash('success_messages', '成功登出!')
    req.logout(err => {
      if (err) {
        return next(err)
      }
      res.redirect('/signin')
    })
  }
}

module.exports = userController