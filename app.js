const express = require('express')
const { engine } = require('express-handlebars')
const handlebarsHelpers = require('./helpers/handlebars-helper')
const routes = require('./routes')

const app = express()
const port = process.env.PORT || 3000

app.engine('.hbs', engine({ extname: '.hbs', helpers: handlebarsHelpers }))
app.set('view engine', '.hbs')
app.set('views', './views')

app.use(routes)

app.listen(port, () => {
  console.info(`App is running on localhost:${port}`)
})