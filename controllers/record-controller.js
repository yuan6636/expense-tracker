const { Record, Category, sequelize } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const recordController = {
  getRecords: (req, res, next) => {
    const categoryId = Number(req.query.categoryId) || ''
    const userId = req.user.id
    const DEFAULT_LIMIT = 6
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const page = Number(req.query.page) || 1
    const offset = getOffset(limit, page)

    return Promise.all([
      Record.findAndCountAll({
        where: {
          ...(categoryId ? { categoryId } : {}),
          userId
        },
        attributes: [
          'id',
          'name',
          'date',
          'amount',
          [
            sequelize.literal(
              `(SELECT SUM(amount) FROM records 
                WHERE user_id = ${userId} 
                ${ categoryId ? `AND category_id = ${categoryId}` : '' })`
            ),
            'totalAmount'
          ]
        ],
        include: [Category],
        offset,
        limit,
        nest: true,
        raw: true
      }),
      Category.findAll({ raw: true })
    ])
      .then(([records, categories]) => {
        let totalAmount = records.rows.length > 0 ? records.rows[0].totalAmount : 0
        res.render('records', {
          records: records.rows,
          totalAmount,
          categories,
          categoryId,
          pagination: getPagination(limit, page, records.count)
        })

      })
      .catch(err => res.status(422).json(err))
  },
  createRecord: (req, res, next) => {
    return Category.findAll({ raw: true })
      .then(categories => res.render('create-record', { categories }))
      .catch(err => next(err))
  },
  postRecord: (req, res, next) => {
    const { name, date, amount, categoryId } = req.body
    const requiredFields = [name, date, amount, categoryId]
    const missingFields = requiredFields.filter((field) => !field)
    const userId = req.user.id

    if (missingFields.length > 0) throw new Error('請填寫所有欄位!')

    return Record.create({
      name,
      date,
      amount,
      categoryId,
      userId
    })
      .then(record => {
        if (!record) throw new Error('這筆支出不存在!')
        req.flash('success_messages', '成功建立一筆支出！')
        res.redirect('/records')
      })
      .catch(err => next(err))
  },
  editRecord: (req, res, next) => {
    return Promise.all([
      Category.findAll({ raw: true }),
      Record.findByPk(req.params.id, { raw: true }),
    ])
      .then(([categories, record]) => {
        if (!record) throw new Error('這筆支出不存在!')
        res.render('edit-record', {
          categories,
          record,
        })
      })
      .catch(err => next(err))
  },
  putRecord: (req, res, next) => {
    const { name, date, amount, categoryId } = req.body
    return Record.findByPk(req.params.id)
      .then(record => {
        if (!record) throw new Error('這筆支出不存在!')
        return record.update({
          name,
          date,
          amount,
          categoryId,
        })
      })
      .then(() => {
        req.flash('success_messages', '成功修改一筆支出！')
        res.redirect('/records')
      })
      .catch(err => next(err))
  },
  deleteRecord: (req, res, next) => {
    return Record.findByPk(req.params.id)
      .then(record => {
        if (!record) throw new Error('這筆支出不存在!')

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
