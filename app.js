const express = require('express')
const routes = require('./routes')

const app = express()
const port = process.env.PORT || 3000

app.use(routes)

app.listen(port, () => {
  console.info(`App is running on localhost:${port}`)
})