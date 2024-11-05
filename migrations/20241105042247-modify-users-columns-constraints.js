'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.changeColumn('Users', 'name', {
        type: Sequelize.STRING,
        allowNull: false
      }, { transaction: t })

      await queryInterface.changeColumn('Users', 'email', {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true

      }, { transaction: t })

      await queryInterface.changeColumn('Users', 'password', {
        type: Sequelize.STRING,
        allowNull: false
      }, { transaction: t })

      await t.commit()
    } catch (error) {
      await t.rollback()
    }
  },

  async down (queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction()

    try {
      await queryInterface.changeColumn('Users', 'name', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction: t })

      await queryInterface.changeColumn('Users', 'email', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false

      }, { transaction: t })

      await queryInterface.changeColumn('Users', 'password', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction: t })

      await t.commit()
    } catch (error) {
      await t.rollback()
    }
  }
};
