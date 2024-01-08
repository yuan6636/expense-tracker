const express = require('express')
const router = express.Router()
const { generalErrorHandler } = require('../middleware/error-handler')
const recordController = require('../controllers/record-controller')

router.get('/records/:id/edit', recordController.editRecord)
router.put('/records/:id', recordController.putRecord)
router.delete('/records/:id', recordController.deleteRecord)
router.get('/records', recordController.getRecords)
router.get('/records/create', recordController.createRecord)
router.post('/records', recordController.postRecord)

router.use('/', (req, res) => res.redirect('/records'))

router.use(generalErrorHandler)

module.exports = router