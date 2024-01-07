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
      Record.sum('amount'),
      Category.findAll({raw: true})
    ])
      .then(([records, totalAmount, categories]) => {
        res.render('records', { 
        records,
        totalAmount, 
        categories
        })
      })
      .catch(err => res.status(422).json(err))
  },
  createRecord: (req, res, next) => {
    return Category.findAll({ raw: true })
    .then( categories => res.render('create-record', { categories }))
    .catch(err => next(err))
  },
  postRecord: (req, res, next) => {
    const { name, date, amount, categoryId } = req.body;

    return Record.create({
      name,
      date,
      amount,
      categoryId
    })
      .then(() => res.redirect('/records'))
      .catch(err => next(err))
  }
}

module.exports = recordController