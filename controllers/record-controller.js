const { Record, Category, sequelize } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const recordController = {
  getRecords: async(req, res, next) => {
    try {
      const categoryId = Number(req.query.categoryId) || ''
      const userId = req.user.id
      const DEFAULT_LIMIT = 6
      const limit = Number(req.query.limit) || DEFAULT_LIMIT
      const page = Number(req.query.page) || 1
      const offset = getOffset(limit, page)

      const [records, categories] = await Promise.all([
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
                `(SELECT SUM(amount) FROM Records 
                  WHERE user_id = ${userId} 
                  ${ categoryId ? `AND category_id = ${categoryId}` : '' })`
              ),
              'totalAmount'
            ]
          ],
          include: [Category],
          order:[['createdAt', 'DESC']],
          offset,
          limit,
          nest: true,
          raw: true
        }),
        Category.findAll({ raw: true })
      ])
      let totalAmount = records.rows.length > 0 ? records.rows[0].totalAmount : 0
      res.render('records', {
        records: records.rows,
        totalAmount,
        categories,
        categoryId,
        pagination: getPagination(limit, page, records.count)
      })
    } catch (err) {
      return res.status(422).json(err)
    }
  },
  createRecord: async(req, res, next) => {
    try {
      const categories = await Category.findAll({ raw: true })
      res.render('create-record', { categories })
      
    } catch (err) {
      next(err)
    }
  },
  postRecord: async (req, res, next) => {
    try {
      const { name, date, amount, categoryId } = req.body
      const requiredFields = [name, date, amount, categoryId]
      const missingFields = requiredFields.filter((field) => !field)
      const userId = req.user.id

      if (missingFields.length > 0) throw new Error('請填寫所有欄位!')

      const record = await Record.create({
        name,
        date,
        amount,
        categoryId,
        userId
      })

      if (!record) throw new Error('這筆支出不存在!')
      req.flash('success_messages', '成功建立一筆支出！')
      res.redirect('/records')

    } catch (err) {
      next(err)
    }
  },
  editRecord: async (req, res, next) => {
    try {
      const [categories, record] = await Promise.all([
        Category.findAll({ raw: true }),
        Record.findByPk(req.params.id, { raw: true }),
      ])

      if (!record) throw new Error('這筆支出不存在!')

      res.render('edit-record', {
        categories,
        record,
      })
    } catch (err) {
      next(err)
    }
  },
  putRecord: async (req, res, next) => {
    try {
      const { name, date, amount, categoryId } = req.body
      const record = await Record.findByPk(req.params.id)

      if (!record) throw new Error('這筆支出不存在!')
      await record.update({
        name,
        date,
        amount,
        categoryId
      })
      req.flash('success_messages', '成功修改一筆支出！')
      res.redirect('/records')
    } catch (error) {
      next(err)
    }
  },
  deleteRecord: async (req, res, next) => {
    try {
      const record = await Record.findByPk(req.params.id)
      if (!record) throw new Error('這筆支出不存在!')
      await record.destroy()
      req.flash('success_messages', '成功刪除一筆支出！')
      res.redirect('/records')
      
    } catch (err) {
      next(err)
    }
  }
}

module.exports = recordController
