const { Record, Category } = require('../models')
const assert = require('assert')

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
    const { name, date, amount, categoryId } = req.body
    const requiredFields = [ name, date, amount, categoryId ]
    const missingFields = requiredFields.filter(field => !field)

    if (missingFields.length > 0) throw new Error('請填寫所有欄位!')

    return Record.create({
      name,
      date,
      amount,
      categoryId
    })
      .then((record) => {
        assert(record, '這筆支出不存在!')
        req.flash('success_messages', '成功建立一筆支出！')
        res.redirect('/records')
      })
      .catch(err => next(err))
  },
  editRecord: (req, res, next) => {
    return Promise.all([
      Category.findAll({ raw: true }),
      Record.findByPk(req.params.id, { raw: true })
    ])
      .then( ([categories, record]) => {
        assert(record, '這筆支出不存在!')
        res.render('edit-record', { 
        categories,
        record 
      })})
      .catch(err => next(err))
  },
  putRecord: (req, res, next) => {
    const { name, date, amount, categoryId } = req.body
    return Record.findByPk(req.params.id)
      .then(record => {
        assert(record, '這筆支出不存在!')
        record.update({
        name,
        date,
        amount,
        categoryId
      })})
      .then(() => {
        req.flash('success_messages', '成功修改一筆支出！')
        res.redirect('/records')
      })
      .catch(err => next(err))
  },
  deleteRecord: (req, res, next) => {
    return Record.findByPk(req.params.id)
      .then(record => {
        assert(record, '這筆支出不存在!')
        
        record.destroy()
      })
      .then(() => {
        req.flash('success_messages', '成功刪除一筆支出！')
        res.redirect('/records')
      })
      .catch(err => next(err))
  }
}

module.exports = recordController