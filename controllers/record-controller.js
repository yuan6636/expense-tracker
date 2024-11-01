const { Record, Category, sequelize } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const { timeArray } = require('../helpers/time-helper')
const { Op } = require('sequelize')

const recordController = {
  getRecords: async(req, res, next) => {
    try {
      const userId = req.user.id
      const DEFAULT_LIMIT = 6
      const categoryId = parseInt(req.query.categoryId) || null
      const limit = parseInt(req.query.limit) || DEFAULT_LIMIT
      const page = parseInt(req.query.page) || 1
      const year = parseInt(req.query.year) || null
      const month = parseInt(req.query.month) || null
      const offset = getOffset(limit, page)

      // 設定年、月的搜尋條件
      const getDateCondition = (year, month) => {
        if (year && month) {
          return {
            [Op.and]: [
              sequelize.where(sequelize.fn('YEAR', sequelize.col('date')), year),
              sequelize.where(sequelize.fn('MONTH', sequelize.col('date')), month)
            ]
          }
        } else if (year) {
          return {
            [Op.and]: [
              sequelize.where(sequelize.fn('YEAR', sequelize.col('date')), year)
            ]
          }
        } else {
          return {}
        }
      }
      const dateCondition = getDateCondition(year, month)
      
      const [records, categories] = await Promise.all([
        Record.findAndCountAll({
          where: {
            ...(categoryId ? { categoryId } : {}),
            userId,
            ...dateCondition
          },
          attributes: ['id', 'name', 'date', 'amount' ],
          include: [Category],
          order:[['createdAt', 'DESC']],
          offset,
          limit,
          nest: true,
          raw: true
        }),
        Category.findAll({ attributes: ['id', 'name'], raw: true })
      ])

      // 查出各類別總額及所有支出總額
      const [categoryTotals, totalAmountData] = await Promise.all([
        Record.findAll({
          where: {
            ...(categoryId ? { categoryId } : {}),
            userId,
            ...dateCondition
          },
          attributes: [
            'categoryId',
            [sequelize.fn('SUM', sequelize.col('amount')), 'categoryTotalAmount']
          ],
          group: 'categoryId',
          order: [['categoryId']],
          raw: true
        }),
        Record.findOne({
          where: {
            ...(categoryId ? { categoryId } : {}),
            userId,
            ...dateCondition
          },
          attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']],
          raw: true
        })
      ])
      
      // 產生對應 categoryAmounts 陣列的 categoryNames 陣列
      const categoryMap = new Map(categories.map(category => [category.id, category.name]))
      const categoryNames = categoryTotals.map(category => categoryMap.get(category.categoryId))
      const categoryAmounts = categoryTotals.map(category => Number(category.categoryTotalAmount))

      const chartData = { labels: categoryNames, data: categoryAmounts}

      const totalAmount = totalAmountData?.totalAmount || 0
      const timeData = timeArray()
      
      res.render('records', {
        records: records.rows,
        totalAmount,
        chartData: JSON.stringify(chartData),
        chartDataLength: chartData.data.length,
        categories,
        categoryId,
        pagination: getPagination(limit, page, records.count),
        years: timeData.yearArray,
        months: timeData.monthArray,
        year,
        month
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
