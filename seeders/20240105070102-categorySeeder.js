'use strict';
const { Category } = require('../models')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const count = await Category.count()

    if (count === 0) {
      await queryInterface.bulkInsert('Categories', 
        ['Home & Property', 'Transportation', 'Entertainment', 'Food & Beverage', 'Others']
          .map(item => {
            return {
              name: item,
              created_at: new Date(),
              updated_at: new Date()
            }
          })
      )
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null)
  }
};
