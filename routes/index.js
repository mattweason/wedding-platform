var express = require('express');
var router = express.Router();
var mysql = require('mysql'); //bring in the mysql package
var sql = require('./../lib/sql'); //bring in the sql.js package of functions
var functions = require('./../lib/functions'); //bring in the functions.js
connection = sql.connect(mysql, sql.credentials);

//bring in all sub-routes
router.use('/vendor', require('./vendor'));

/* GET home page. */
router.get('/', function(req, res, next) {

    connection.query('SELECT * FROM vendor ORDER BY vendor_name ASC', function(err, vendor) {

        connection.query('SELECT * FROM vendor2category INNER JOIN category ON vendor2category.category_fid = category.category_id', function(err, category) {

            //Append categories as strings onto vendor object
            var vendorCategory = functions.vendorJoin(vendor, category);

            res.render('home', {
                title: 'Vendors on a Dime',
                vendor: vendor
            });
        });
    });
});

//Vendor Page
router.get('/vendor/:vendorName', function(req,res) {
    connection.query('SELECT * FROM vendor WHERE vendor.vendor_url = ?', req.params.vendorName, function (err, vendor) {

        connection.query('SELECT * FROM vendor2category INNER JOIN category ON vendor2category.category_fid = category.category_id', function (err, category) {

            //Append categories as strings onto vendor object
            var vendorCategory = functions.vendorJoin(vendor, category);

            res.render('vendor_single', {
                title: vendorCategory[0].vendor_name,
                vendor: vendorCategory
            });
        });
    });
});

module.exports = router;
