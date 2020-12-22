// loading in environment variables 
// NOT
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
// 
const express = require('express');
const expressHand = require('express-handlebars');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
// method-override lets you override the method youre using  
// so we can call the method DELETE on a form
const methodOverride = require('method-override');
var db = require("./models");

var initializePassport = require('./passport-config');
// Two things are passed to initializePassport: 
initializePassport(
    // This is the passport that is being configured 
    passport, 
    // This is the function to find the user based on the email
    email => {return users.find(user => user.email === email)},
    id => {return users.find(user => user.id === id)}
);

const app = express();
// This is not required with a database
let users = []

// var PORT = process.env.PORT || 3306;

app.engine('handlebars', expressHand({
    defaultLayout: 'main'
}));
// NOT
app.use(express.urlencoded({extended:false}));
// 
app.use(flash())
// NOT
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
// 
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.set('view engine', 'handlebars');

// app.set('views', path.join(__dirname, 'views/'));
// NOT
app.get('/hello', checkAuthenticated, (req, res) => {
    // important to note about req.user.name: 
    // session with passport will make it so that the req.user
    // is always sent to the user that is authenticated for that
    // moment
    res.render('index', {name:req.user.name})
});
// 
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login')
    console.log("hello")
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/hello',
    failureRedirect: '/login',
    // This line allows the failure message that is set as the third parameter 
    // for any failed done() function in passport-config
    failureFlash: true
}));

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register');
    // console.log('failed')
});


app.post('/register', checkNotAuthenticated, async (req, res) => {
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
        db.User.create({
            email: req.body.email,
            password: req.body.password
        })
            .then(function(data) {
                console.log(data)
            })
        res.redirect('/login');
    } catch{
        res.redirect('/register')
    }
    console.log(users)
});

app.delete('/logout', (req, res) =>{
    // logOut set up by passport
    req.logOut();
    res.redirect('/login');
});

function checkAuthenticated(req, res, next){
    // isAuthenticated set up by passport
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login')
}

function checkNotAuthenticated (req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/hello')
    }
    next()
}

db.sequelize.sync().then(function () {
    app.listen(3000, function () {
        console.log("running")
    });
})
