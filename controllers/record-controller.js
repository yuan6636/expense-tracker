const { Record, Category, sequelize } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const { timeArray } = require('../helpers/time-helper')
const { Op } = require('sequelize')
const { setError, serverError, manageError } = require('../helpers/error-helper')
const errorTypes = require('../config/errorTypes')

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
      const SERVER_ERROR = errorTypes.SERVER_ERROR
      serverError(err, SERVER_ERROR, next)
    }
  },
  createRecord: async(req, res, next) => {
    try {
      const categories = await Category.findAll({ raw: true })
      res.render('create-record', { categories })
      
    } catch (err) {
      const SERVER_ERROR = errorTypes.SERVER_ERROR
      serverError(err, SERVER_ERROR, next)
    }
  },
  postRecord: async (req, res, next) => {
    try {
      const { name, date, amount, categoryId } = req.body
      const requiredFields = [name, date, amount, categoryId]
      const missingFields = requiredFields.filter((field) => !field)
      const userId = req.user.id

      if (missingFields.length > 0) {
        const status = 400
        const message = 'Please fill in all fields!'
        const err = setError(status, message)
        throw err
      }

      const record = await Record.create({
        name,
        date,
        amount,
        categoryId,
        userId
      })

      if (!record) {
        const status = 404
        const message = 'This record does not exist!'
        const err = setError(status, message)
        throw err
      }
      req.flash('success_messages', 'Successfully created a new record!')
      res.redirect('/records')

    } catch (err) {
      const SERVER_ERROR = errorTypes.SERVER_ERROR
      manageError(err, SERVER_ERROR, next)
    }
  },
  editRecord: async (req, res, next) => {
    try {
      const [categories, record] = await Promise.all([
        Category.findAll({ raw: true }),
        Record.findByPk(req.params.id, { raw: true }),
      ])

      if (!record) {
        const status = 404
        const message = 'This record does not exist!'
        const err = setError(status, message)
        throw err
      }

      res.render('edit-record', {
        categories,
        record,
      })
    } catch (err) {
      const SERVER_ERROR = errorTypes.SERVER_ERROR
      serverError(err, SERVER_ERROR, next)
    }
  },
  putRecord: async (req, res, next) => {
    try {
      const { name, date, amount, categoryId } = req.body
      const record = await Record.findByPk(req.params.id)

      if (!record) {
        const status = 404
        const message = 'This record does not exist!'
        const err = setError(status, message)
        throw err
      }

      await record.update({
        name,
        date,
        amount,
        categoryId
      })
      req.flash('success_messages', 'Successfully updated the record!')
      res.redirect('/records')
    } catch (err) {
      const SERVER_ERROR = errorTypes.SERVER_ERROR
      manageError(err, SERVER_ERROR, next)
    }
  },
  deleteRecord: async (req, res, next) => {
    try {
      const record = await Record.findByPk(req.params.id)
      if (!record) {
        const status = 404
        const message = 'This record does not exist!'
        const err = setError(status, message)
        throw err
      }
      await record.destroy()
      req.flash('success_messages', 'Successfully deleted the record!')
      res.redirect('/records')
      
    } catch (err) {
      const SERVER_ERROR = errorTypes.SERVER_ERROR
      manageError(err, SERVER_ERROR, next)
    }
  }
}

module.exports = recordController
