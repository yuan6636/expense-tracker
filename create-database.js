const { username: user, password, database, host } = require('./config/config').development

const mysql = require('mysql2')

// Create connection
const connection = mysql.createConnection({ host, user, password })

// Connect to MySQL server
connection.connect(err => {
  if (err) throw err
  console.log('Connected to MySQL server.')

  // Create database
  connection.query('USE ' + database, (err) => {
    if (err) {
      connection.query(
        `CREATE DATABASE IF NOT EXISTS ${database}`,
        (err) => {
          if (err) throw err
          console.log('Database created.')
          process.exit()
        }
      )
    } else {
      console.log('Database already exists.')
      process.exit()
    }
  })
})