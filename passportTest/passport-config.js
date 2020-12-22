const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById){
    // For the authenticateUser function, you would typically
    // pass username, password and done. In this case, we have set the
    // usernameField to email, so it is email. 
    // What does done do? 
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email);
        if(user == null) {
            return done(null, false, {message: 'No user with that email'})
            console.log("user == null CASE")
        }

        try{
            if (await bcrypt.compare(password || user.password)){
                return done(null, user)
            }else{
                return done(null, false, {message: 'Password Incorrect'})
            }
        }catch(e){
            return(e)
        }
    }
//     // For this line and (passportTest) example, you would also perhaps 
//     // pass the "passwordField" into the localStrategy, but
//     // in this case it is already password. Similarly, 
//     // usernameField defaults to 'username'. So, usernameField
//     // and passwordField are keys to the username and password
//     // parameters that localStrategy expects to find credentials for
//     // by default.
    passport.use(new localStrategy({usernameField: 'email'}, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id));
    });
};

module.exports = initialize;

