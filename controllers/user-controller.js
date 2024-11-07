const bcrypt = require('bcryptjs')
const { User } = require('../models')
const { setError, serverError, manageError } = require('../helpers/error-helper')
const errorTypes = require('../config/errorTypes')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: async (req, res, next) => {
    try {
      const { name, email, password, passwordCheck } = req.body
      if (!name || !email || !password) {
        const status = 400
        const message = 'Please enter your name, email, and password.'
        const err = setError(status, message)
        throw err
      }

      if (password !== passwordCheck) {
        const status = 400
        const message = 'Password is incorrect, please re-enter your password.'
        const err = setError(status, message)
        throw err
      }

      const user = await User.findOne({ where: { email: req.body.email } })
      if (user) {
        const status = 400
        const message = 'Email is already registered, please use a different email!'
        const err = setError(status, message)
        throw err
      }

      const hash = await bcrypt.hash(req.body.password, 10)

      await User.create({
        name: req.body.name,
        email: req.body.email,
        password: hash
      })
      req.flash('success_messages', 'Registration successful!')
      return res.redirect('/signin')
      
    } catch (err) {
      const SERVER_ERROR = errorTypes.SERVER_ERROR
      manageError(err, SERVER_ERROR, next)
    }
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res, next) => {
    req.flash('success_messages', 'Login successful!')
    res.redirect('/records')
  },
  logout: (req, res) => {
    req.logout(err => {
      if (err) {
        const SERVER_ERROR = errorTypes.SERVER_ERROR
        serverError(err, SERVER_ERROR, next)
      }
      req.flash('success_messages', 'Logout successful!')
      res.redirect('/signin')
    })
  }
}

module.exports = userController