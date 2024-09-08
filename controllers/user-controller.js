const bcrypt = require('bcryptjs')
const { User } = require('../models')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: async (req, res, next) => {
    try {
      const { name, email, password, passwordCheck } = req.body
      if(!name || !email || !password) throw new Error('請輸入姓名、信箱、密碼')
      if(password !== passwordCheck) throw new Error('密碼有誤，請重新輸入密碼')

      const user = await User.findOne({ where: { email: req.body.email } })
      if(user) throw new Error('信箱已被註冊，請重新輸入!')

      const hash = await bcrypt.hash(req.body.password, 10)

      await User.create({
        name: req.body.name,
        email: req.body.email,
        password: hash
      })
      req.flash('success_messages', '註冊成功!')
      return res.redirect('/signin')
      
    } catch (err) {
      next(err)
    }
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