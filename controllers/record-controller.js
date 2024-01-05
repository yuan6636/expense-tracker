const { Record } = require('../models')

const recordController = {
  getRecords: (req, res, next) => {
    return Record.findAll({
      attributes: ['id', 'name', 'date', 'amount'],
      raw: true
    })
      .then((records) => res.render('records', { records }))
      .catch(err => res.status(422).json(err))
  }
}

module.exports = recordController