'use strict';
const bcryptjs = require('bcryptjs')
const { User } = require('../models')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const count = await User.count()

    if (count === 0) {
      await queryInterface.bulkInsert('Users', [{
        name: 'root',
        email: 'root@example.com',
        password: await bcryptjs.hash('12345678', 10),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'user1',
        email: 'user1@example.com',
        password: await bcryptjs.hash('12345678', 10),
        created_at: new Date(),
        updated_at: new Date()
      }])
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null)
  }
};
