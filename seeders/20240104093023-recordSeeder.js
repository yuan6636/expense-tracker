'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.bulkInsert('Records', [{
      name: '午餐',
      date: '2019/4/23',
      amount: 60,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: '晚餐',
      date: '2019/4/23',
      amount: 60,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: '捷運',
      date: '2019/4/23',
      amount: 120,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: '電影：驚奇隊長',
      date: '2019/4/23',
      amount: 220,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: '租金',
      date: '2015/4/01',
      amount: 25000,
      created_at: new Date(),
      updated_at: new Date()
    }], {})
  },

  async down (queryInterface, Sequelize) {
    queryInterface.bulkDelete('Records', null, {})
  }
};
