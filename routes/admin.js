var express = require('express');
var router = express.Router();
var async = require('async');
var mysql = require('mysql'); //bring in the mysql package
var sql = require('./../lib/sql'); //bring in the sql.js package of functions
var functions = require('./../lib/functions'); //bring in all custom functions
connection = sql.connect(mysql, sql.credentials);

//----------------------------------ADMIN PAGE-----------------------------//
router.get('/', functions.ensureAuthenticated, functions.checkAdmin, function(req, res, next) {
    
    res.redirect('/admin/dashboard');
});

router.get('/dashboard', functions.ensureAuthenticated, functions.checkAdmin, function(req, res, next) {

    res.render('admin');
});

//----------------------------------ADMIN VENDOR LIST-----------------------------//
router.get('/vendors', functions.ensureAuthenticated, functions.checkAdmin, function(req, res, next) {

    async.waterfall([
        getVendor,
        allCategories,
        getCategory,
        getCities
    ], function (err, vendor, cities, categories) {
        res.render('admin_vendor_list', {
            title: 'Admin Vendor List',
            vendor: vendor,
            city: cities,
            categories: categories
        });
    });

    function getVendor (callback) {
        connection.query('SELECT * FROM vendor ORDER BY vendor_name ASC', function(err, vendor) {
            callback(null, vendor);
        });
    }
    function allCategories (vendor, callback) {
        connection.query("SELECT * FROM category ORDER BY category_id ASC", function(err, categories) {
            callback(null, vendor, categories);
        });
    }
    function getCategory (vendor, categories, callback) {
        connection.query('SELECT * FROM vendor2category INNER JOIN category ON vendor2category.category_fid = category.category_id', function (err, category) {

            // Append categories as strings onto vendor object
            var vendorFull = functions.vendorJoin(vendor, category);

            callback(null, vendorFull, categories);
        });
    }
    function getCities (vendor, categories, callback) {
        connection.query('SELECT DISTINCT city FROM vendor ORDER BY city', function (err, cities) {
            callback(null, vendor, cities, categories);
        });
    }
});

//----------------------------------ADMIN USER LIST-----------------------------//
router.get('/users', functions.ensureAuthenticated, functions.checkAdmin, function(req, res, next) {

    res.render('admin_user_list');
});

module.exports = router;