'use strict';
const { Category } = require('../models')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const count = await Category.count()

    if (count === 0) {
      await queryInterface.bulkInsert('Categories', 
        ['家居物業', '交通出行', '休閒娛樂', '餐飲食品', '其他']
          .map(item => {
            return {
              name: item,
              created_at: new Date(),
              updated_at: new Date()
            }
          }
          ))
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null)
  }
};
