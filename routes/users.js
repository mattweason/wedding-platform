var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var mysql = require('mysql');
var async = require('async');
var sql = require('./../lib/sql'); //bring in the sql.js package of functions
var passport = require('passport');
var crypto = require('crypto');
var nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
var xoauth2 = require('xoauth2');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    auth: {
        xoauth2: xoauth2.createXOAuth2Generator({
            user: 'matt@oasiscode.com',
            clientId: '870779677249-lalq2b1sp4i6sjphqfjf5n6ofoqn4nuh.apps.googleusercontent.com',
            clientSecret: '76y0n0NrVa5_Z-Ytch4YrwTI',
            refreshToken: '1/EkeX6lqlkVDXOnPpE3W75NLUce-vuhUHq3RyvOsiDAgsqLpFgUrAIq1xgNhJnSKz',
            accessToken: 'ya29.GlvcA99bI9sbrMVL3Usm2I2Cv2uF1m5fWfwn5dh9w-V9gLY5p3NezmLcZJ1AkSRWHL_yKBmWqwF__x78z_5fSKiow2hEwZaziyeiljNKm64mrxFtphr2f0SobIXN'
        })
    }
}));
connection = sql.connect(mysql, sql.credentials);

/* GET users listing. */
router.get('/register', function(req, res, next) {
    res.render('register');
});

router.get('/login', function(req, res, next) {
    res.render('login');
});

router.get('/forgot', function(req, res, next) {
    res.render('forgot');
});

router.get('/reset/:token', function(req, res) {
    connection.query('SELECT * FROM user WHERE token = ?', req.params.token, function(err, user) {
        if (!user.length || user.token_expire > Date.now()) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            res.redirect('/users/forgot');
        } else {
            res.render('reset', {
                user: user,
                token: req.params.token
            });
        }
    })
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
            fbUsername = fbName.replace(" ", "_"),
            fbEmail = profile.emails[0].value;
        connection.query("SELECT * FROM user WHERE facebook_id = ?",fbID, function(err, result){
            if(err) {return done(err)}
            //if username doesn't exist
            if(result.length){
                return done(null, result);
            }
            else
                connection.query('INSERT INTO `user`(`username`, `facebook_id`, `facebook_token`, `email`, `name`) VALUES (?,?,?,?,?)',[fbUsername,fbID,fbToken,fbEmail,fbName],function(err, result){
                    return done(null, result);
                });
        });
    }
));

//serialize and deserialize (something about cookies and sessions)
passport.serializeUser(function(user, done) {
    console.log(user);
    if (user.user_id == null) //Checks if the user variable is an object or an array. Facebook is an object of one array, and regular sign in is just an array.
        done(null, user[0].user_id);
    else
        done(null, user.user_id);
});

passport.deserializeUser(function(id, done) {
    console.log(id);
    connection.query('SELECT * FROM user WHERE user_id = ?',id, function(err, user){
        if(err) throw err;
        done(err, user);
    });
});

//Login Route
router.post('/login',
    passport.authenticate('local', {successReturnToOrRedirect: '/', failureRedirect:'/users/login', failureFlash: true}));

//Forgot Route
router.post('/forgot', function(req, res, next) {
    var userEmail = req.body.useremail,
        userName;

    async.waterfall([
        createToken,
        checkUser,
        sendEmail
    ], function(err) {
        if (err) return next(err);
        req.flash('success_msg', 'An e-mail has been sent to ' + userEmail + ' with further instructions.');
        res.redirect('/users/forgot');
    });

    function createToken (callback) {
        crypto.randomBytes(20, function(err, buf) {
            var token = buf.toString('hex');
            callback(null, token);
        });
    }

    function checkUser (token, callback) {
        connection.query('SELECT * FROM user WHERE email = ?',userEmail, function(err, user){
            userName = user[0].username;
            if(err) throw err;
            if (!user.length || user[0].admin > 0) {
                req.flash('error', 'No account with that email address exists.');
                res.redirect('/users/forgot');
            } else if (user[0].facebook_id) {
                req.flash('error', 'The account associated with the email address you have provided is a Facebook account. Please use the Facebook login.');
                return res.redirect('/users/forgot');
            } else {

                var tokenExpire = Date.now() + 3600000;
                connection.query('UPDATE user SET token= ?, token_expire= ? WHERE email = ?', [token, tokenExpire, userEmail], function(err, result) {
                    if (err) throw err;
                    callback(null, token);
                });
            }
        });
    }

    function sendEmail (token, callback) {
        var mailOptions={
            from : 'noreply@vendoronadime.com',
            to : userEmail,
            subject : 'Vendor on a Dime Password Reset',
            text : 'You are receiving this because you (or someone else) have requested the reset of the password for your account:\n\n' +
                'Username: ' + userName + '\n' +
                'Email: ' + userEmail + '\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        transporter.sendMail(mailOptions, function(err){
            if(err) {
                req.flash('error', 'There was an issue sending the email.');
                res.redirect('/users/forgot');
            }
            else{
                callback(null);
            }
        });
    }
});

//Reset password route
router.post('/reset/:token', function(req, res) {
    var token = req.params.token,
        password = req.body.newpass,
        userEmail,
        userName;

    async.waterfall([
        checkToken,
        updatePassword,
        sendConfirmEmail
    ], function(err) {
        if (err) return next(err);
        req.flash('success_msg', 'Success! Your password has been changed.');
        res.redirect('/users/login');
    });

    function checkToken (callback) {
        connection.query('SELECT * FROM user WHERE token = ?', req.params.token, function(err, user) {
            userEmail = user[0].email;
            userName = user[0].username;
            if (!user.length || user.token_expire > Date.now()) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                res.redirect('/users/forgot');
            } else
                callback(null);
        });
    }

    function updatePassword (callback) {
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(password, salt, function(err, hash) {
                connection.query('UPDATE user SET password = ? WHERE username = ?',[hash,userName],function(err, result){
                    if(err) throw err;
                    callback(null);
                });
            });
        });
    }

    function sendConfirmEmail (callback) {
        var mailOptions={
            from : 'noreply@vendoronadime.com',
            to : userEmail,
            subject : 'Your Vendor on a Dime password has changed.',
            text : 'This is a confirmation that the password for your account with the username: ' + userName + ', has just been changed.\n'
        };
        transporter.sendMail(mailOptions, function(err){
            if(err) {
                req.flash('error', 'There was an issue sending the email.');
                res.redirect('/users/forgot');
            }
            else{
                callback(null);
            }
        });
    }
});

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