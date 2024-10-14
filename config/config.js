module.exports = {
  development: {
    username: 'root',
    password: 'password',
    database: 'record',
    host: process.env.DB_HOST,
    dialect: 'mysql'
  },
  test: {
    username: 'root',
    password: 'null',
    database: 'database_test',
    host: '127.0.0.1',
    dialect: 'mysql'
  },
  production: {
    use_env_variable: 'DATABASE_URL'
  }
}
