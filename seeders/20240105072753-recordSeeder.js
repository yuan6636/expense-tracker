'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const categories = await queryInterface.sequelize.query(
      'SELECT id FROM categories;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )
    await queryInterface.bulkInsert('Records', [{
      name: '午餐',
      date: '2019/4/23',
      amount: 60,
      created_at: new Date(),
      updated_at: new Date(),
      category_id: categories[3].id
    }, {
      name: '晚餐',
      date: '2019/4/23',
      amount: 60,
      created_at: new Date(),
      updated_at: new Date(),
      category_id: categories[3].id
    }, {
      name: '捷運',
      date: '2019/4/23',
      amount: 120,
      created_at: new Date(),
      updated_at: new Date(),
      category_id: categories[1].id
    }, {
      name: '電影：驚奇隊長',
      date: '2019/4/23',
      amount: 220,
      created_at: new Date(),
      updated_at: new Date(),
      category_id: categories[2].id
    }, {
      name: '租金',
      date: '2015/4/01',
      amount: 25000,
      created_at: new Date(),
      updated_at: new Date(),
      category_id: categories[0].id
    }], {})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Records', null, {})
  }
};
