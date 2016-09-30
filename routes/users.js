var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var mysql = require('mysql');
var sql = require('./../lib/sql'); //bring in the sql.js package of functions
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
connection = sql.connect(mysql, sql.credentials);

/* GET users listing. */
router.get('/register', function(req, res, next) {
    res.render('register');
});

router.get('/login', function(req, res, next) {
    res.render('login');
});

router.post('/register', function(req,res){

    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;

    connection.query("SELECT * FROM user WHERE username = ?",username, function(err, usernameCheck){
        if (err) throw err;
        
        if (usernameCheck.length) {
            res.send({
                message: 'Username already taken. Please choose another username.',
                status: "usernameTaken"
            });
        } else {
            connection.query("SELECT * FROM user WHERE email = ?",email, function(err, emailCheck){
                if (err) throw err;

                if (emailCheck.length) {
                    res.send({
                        message: 'That email has already been registered. Please use another email.',
                        status: "emailTaken"
                    });
                } else {
                    bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(password, salt, function(err, hash) {
                            connection.query('INSERT INTO `user`(`username`, `password`, `email`, `name`) VALUES (?,?,?,?)',[username,hash,email,name],function(err, result){
                                if(err) throw err;
                                res.send({
                                    message: 'You have successfully registered! You may now log in.',
                                    buttontext: 'Login',
                                    url: '/users/login',
                                    status: "success"
                                });
                            });
                        });
                    });   
                }
            });
        }
    });
});

//local validation process for user
passport.use(new LocalStrategy(
    function(username, password, done) {
        connection.query("SELECT * FROM user WHERE username = ?",username, function(err, result){
            if(err) {return done(err)}
            //if username doesn't exist
            if(!result.length){
                return done(null, false, { message: 'No user found with this username.' });
            }
            bcrypt.compare(password, result[0].password, function(err, isMatch) {
                if(err) throw err;
                if(isMatch)
                    return done(null, result[0]);
                else
                    return done(null, false, {message: 'Invalid password'});
            });
        });
    }
));

//facebook validation process for user
passport.use(new FacebookStrategy({
    clientID: '1782792395331151',
    clientSecret: '5d416dcc01a0fca03860cc0944803214',
    callbackURL: "http://localhost:3000/users/auth/facebook/callback",
    profileFields: ["emails", "displayName"]
},
    function(token, refreshToken, profile, done) {
        var fbID = profile.id,
            fbToken = token,
            fbName = profile.displayName,
            fbUsername = fbName.replace(" ", ".");
            fbEmail = profile.emails[0].value;
        connection.query("SELECT * FROM user WHERE username = ?",fbID, function(err, result){
            if(err) {return done(err)}
            //if username doesn't exist
            if(result.length){
                return done(null, result);
            }
            else
                connection.query('INSERT INTO `user`(`username`, `facebook_token`, `email`, `name`) VALUES (?,?,?,?)',[fbUsername,fbToken,fbEmail,fbName],function(err, result){
                    return done(null, result);
                });
        });
    }
));

//serialize and deserialize (something about cookies and sessions)
passport.serializeUser(function(user, done) {
    done(null, {user_id: user.user_id});
});

passport.deserializeUser(function(id, done) {
    connection.query('SELECT * FROM user WHERE user_id = ?',id.user_id, function(err, user){
        if(err) throw err;
        done(err, user);
    });
});

//Login Route
router.post('/login',
    passport.authenticate('local', {successReturnToOrRedirect: '/', failureRedirect:'/users/login', failureFlash: true}));

//Facebook routes
// route for facebook authentication and login
router.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

// handle the callback after facebook has authenticated the user
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect : '/',
        failureRedirect : '/users/login'
    }));

//logout with a redirect and a flash msg
router.get('/logout', function(req,res){
    req.logout();
    req.flash('success_msg', "You have successfully logged out");
    res.redirect('/users/login');
});

module.exports = router;