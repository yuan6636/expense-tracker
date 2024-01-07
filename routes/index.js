const express = require('express')
const router = express.Router()
const recordController = require('../controllers/record-controller')

router.get('/records', recordController.getRecords)
router.get('/records/create', recordController.createRecord)
router.post('/records', recordController.postRecord)
router.use('/', (req, res) => res.redirect('/records'))

module.exports = router