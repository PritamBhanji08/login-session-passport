if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const bcrypt = require('bcrypt')
const passport = require('passport')
const initializePassport = require('./passport-config')
const flash = require('express-flash')
const session = require('express-session')

initializePassport(passport, email => users.find(user => user.email === email),
  id => users.find(user => user.id === id))

const app = express()
const users = []
app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.get('/', checkAuthenticated, (req, resp) => {
  resp.render('index.ejs', { name: req.user.name })
})

app.get('/login', (req, resp) => {
  resp.render('login.ejs')
})

app.get('/register', (req, resp) => {
  resp.render('register.ejs')
})

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.post('/register', async (req, resp) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    console.log(users)
    resp.redirect('/login')
  } catch {
    resp.redirect('/register')
  }
  
})

function checkAuthenticated(req, resp, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  resp.redirect('/login')
}

app.listen(5000, ()=>{
  console.log('Server is runninng: 5000')
})