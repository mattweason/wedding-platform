var express = require('express');
var router = express.Router();
var mysql = require('mysql'); //bring in the mysql package
var sql = require('./../lib/sql'); //bring in the sql.js package of functions
connection = sql.connect(mysql, sql.credentials);

//bring in all sub-routes
router.use('/vendor', require('./vendor'));

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('landing', { title: 'Express' });
});

module.exports = router;
