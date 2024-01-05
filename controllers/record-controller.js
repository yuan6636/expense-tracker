const { Record, Category } = require('../models')

const recordController = {
  getRecords: (req, res, next) => {
    return Promise.all([
      Record.findAll({
        attributes: ['id', 'name', 'date', 'amount'],
        include: [Category],
        raw: true,
        nest:true
      }),
      Category.findAll({raw: true})
    ])
      .then(([records, categories]) => {
        res.render('records', { records, categories })
      })
      .catch(err => res.status(422).json(err))
  }
}

module.exports = recordController