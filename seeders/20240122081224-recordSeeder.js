'use strict';
const dayjs = require('dayjs')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const currentDate = dayjs()
    const categories = await queryInterface.sequelize.query(
      'SELECT id FROM categories;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )
    await queryInterface.bulkInsert('Records', 
      Array.from({ length: 30 }, (_, index) => index + 1).map(item => {
        return {
          name: `expense-${item}`,
          date: currentDate.format('YYYY/MM/DD'),
          amount: Math.floor(Math.random() * 1000 + 1),
          created_at: new Date(),
          updated_at: new Date(),
          category_id: categories[Math.floor(Math.random() * categories.length)].id,
          user_id: users[Math.floor(Math.random() * users.length)].id
        }
      })
    )
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Records', null)
  }
};
