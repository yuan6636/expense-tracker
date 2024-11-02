const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const { generalErrorHandler } = require('../middleware/error-handler')
const recordController = require('../controllers/record-controller')
const userController = require('../controllers/user-controller')
const { authenticated } = require('../middleware/auth')
const oauth = require('./oauth')

router.use(oauth)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)

router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect:'/signin', failureFlash: true }), userController.signIn)
router.get('/logout', userController.logout)

router.use(authenticated)

router.get('/records/:id/edit', recordController.editRecord)
router.put('/records/:id', recordController.putRecord)
router.delete('/records/:id', recordController.deleteRecord)
router.get('/records', recordController.getRecords)
router.get('/records/create', recordController.createRecord)
router.post('/records', recordController.postRecord)

router.get('/health', (req, res) => res.send('ok'))

router.use('/', (req, res) => res.redirect('/records'))

router.use(generalErrorHandler)

module.exports = router