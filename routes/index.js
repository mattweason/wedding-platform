var express = require('express');
var router = express.Router();
var mysql = require('mysql'); //bring in the mysql package
var sql = require('./../lib/sql'); //bring in the sql.js package of functions
connection = sql.connect(mysql, sql.credentials);

//bring in all sub-routes
router.use('/vendor', require('./vendor'));

/* GET home page. */
router.get('/', function(req, res, next) {

    connection.query('SELECT * FROM vendor ORDER BY vendor_name ASC', function(err, vendor) {

        connection.query('SELECT * FROM vendor2category INNER JOIN category ON vendor2category.category_fid = category.category_id', function(err, category) {

            for (var i = 0; i < vendor.length; i++) {

                var categoryNames = [];

                for (var a = 0; a < category.length; a++) {

                    if (vendor[i].vendor_id == category[a].vendor_fid) {
                        categoryNames.push(category[a].category_name);
                    }
                }

                vendor[i].category = categoryNames.join(', ');
            }

            res.render('home', {
                title: 'Vendors on a Dime',
                vendor: vendor
            });
        });
    });
});

//Subcategory Page
router.get('/vendor/:vendorName', function(req,res) {
    connection.query('SELECT * FROM vendor WHERE vendor.vendor_url = ?', req.params.vendorName, function (err, vendor) {
        console.log(req.params.vendorName);

        connection.query('SELECT * FROM vendor2category INNER JOIN category ON vendor2category.category_fid = category.category_id', function (err, category) {

            for (var i = 0; i < vendor.length; i++) {

                var categoryNames = [];

                for (var a = 0; a < category.length; a++) {

                    if (vendor[i].vendor_id == category[a].vendor_fid) {
                        categoryNames.push(category[a].category_name);
                    }
                }

                vendor[i].category = categoryNames.join(', ');
            }

            res.render('vendor_single', {
                title: 'Vendors on a Dime',
                vendor: vendor,
                category: category
            });
            console.log(category);
        });
    });
});

module.exports = router;
