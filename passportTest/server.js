if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
// const { constants } = require('buffer');
const express = require('express');
const expressHand = require('express-handlebars');
// const path = require('path');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');


const initializePassport = require('./passport-config');
// Two things are passed to initializePassport: 
initializePassport(
    // This is the passport that is being configured 
    passport, 
    // This is the function to find the user based on the email
    email => {users.find(user => user.email === email)
});

const app = express();
// This is not required with a database
let users = []

// var PORT = process.env.PORT || 3306;

app.engine('handlebars', expressHand({
    defaultLayout: 'main'
}));

app.use(express.urlencoded({extended:false}));

app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'handlebars');

// app.set('views', path.join(__dirname, 'views/'));

app.get('/hello', (req, res) => {
    res.render('index', {name:"nick"})
});

app.get('/login', (req, res) => {
    res.render('login')
    console.log("hello")
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    // This line allows the failure message that is set as the third parameter 
    // for any failed done() function in passport-config
    failureFlash: true
}));

app.get('/register', (req, res) => {
    res.render('register');
    // console.log('failed')
});


app.post('/register', async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        // This is not required with DB
        users.push({
            // This ID is automatically generated with a DB 
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login');
    } catch{
        res.redirect('/register')
    }
    console.log(users)
});

app.listen(3000, () => {
    console.log("running")
});
