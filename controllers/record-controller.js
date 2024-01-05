const { Record } = require('../models')

const recordController = {
  getRecords: (req, res, next) => {
    return Record.findAll()
      .then((records) => res.send({ records }))
      .catch(err => res.status(422).json(err))
  }
}

module.exports = recordController