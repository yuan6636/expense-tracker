const express = require('express')
const { engine } = require('express-handlebars')
const handlebarsHelpers = require('./helpers/handlebars-helper')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const session = require('express-session')
const messageHandler = require('./middleware/message-handler')
const routes = require('./routes')

const app = express()
const port = process.env.PORT || 3000

if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

app.engine('.hbs', engine({ extname: '.hbs', helpers: handlebarsHelpers }))
app.set('view engine', '.hbs')
app.set('views', './views')

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }))
app.use(flash())

app.use(messageHandler)

app.use(routes)

app.listen(port, () => {
  console.info(`App is running on localhost:${port}`)
})