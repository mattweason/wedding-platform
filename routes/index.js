var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var async = require('async');
var path = require('path');
var mysql = require('mysql'); //bring in the mysql package
var sql = require('./../lib/sql'); //bring in the sql.js package of functions
var functions = require('./../lib/functions'); //bring in the functions.js
connection = sql.connect(mysql, sql.credentials);

const fs = require('fs-extra');

//bring in all sub-routes
router.use('/vendor', require('./vendor'));
router.use('/admin', require('./admin'));

/* GET home page. */
router.get('/', function(req, res, next) {

    async.waterfall([
        getVendor,
        allCategories,
        getCategory,
        getFeatured,
        getCities,
        checkAdmin
    ], function (err, vendorFull, featured, cities, categories, admin) {
        res.render('home', {
            home: 1,
            admin: admin,
            title: 'Vendors on a Dime',
            vendor: vendorFull,
            featured: featured,
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

            callback(null, vendorFull, categories, category);
        });
    }
    function getFeatured (vendor, categories, category, callback) {
        connection.query('SELECT * FROM vendor WHERE vendor.is_featured = 1', function (err, featured) {

            // Append categories as strings onto vendor object
            var featuredFull = functions.vendorJoin(featured, category);

            callback(null, vendor, featuredFull, categories);
        });
    }
    function getCities (vendor, featured, categories, callback) {
        connection.query('SELECT DISTINCT city FROM vendor ORDER BY city', function (err, cities) {
            callback(null, vendor, featured, cities, categories);
        });
    }
    function checkAdmin (vendor, featured, cities, categories, callback) {
        var admin = false;
        if (req.user) {
            var userLog = req.user[0];
            if (userLog.admin)
                admin = true;
        }
        callback(null, vendor, featured, cities, categories, admin);
    }
});

//Upload photos and post to vendorgallery table
router.post('/uploadGallery', function(req,res){

    //Set up formidable
    var form = new formidable.IncomingForm();
    form.keepExtensions = true;
    var vendorPhotos = [];
    var vendorID;
    var vendorURL;
    var vendorEXT;

    form.multiples = true;

    form.uploadDir = __dirname + "/../uploads";

    form.parse(req, function(err, fields) {
        vendorID = fields.vendor_id;
        vendorURL = fields.vendor_url;
    });

    form.on('fileBegin', function(field, file) {
        console.log(file.name);
        vendorEXT = path.extname(file.name);
        console.log(vendorEXT);
        file.path = path.join(__dirname, '/../uploads/'+file.name);
        vendorPhotos.push(file.path);
        console.log(vendorPhotos);
    });

    form.on('end', function(){
        functions.addGallery(vendorID, vendorPhotos, 'Gallery successfully updated.', vendorURL, vendorEXT, res);
    });

});

//Upload photos and post to vendorgallery table
router.post('/gallerydelete', function(req,res){

    var vendorURL = req.body.vendor_url;
    var path = req.body.delete_photo;

    if (req.body.delete_photo) {
        functions.photoDelete(path, 'Photo(s) successfully deleted.', vendorURL, res);
    }

});

module.exports = router;
