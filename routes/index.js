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

/* GET home page. */
router.get('/', function(req, res, next) {

    connection.query('SELECT * FROM vendor ORDER BY vendor_name ASC', function(err, vendor) {

        connection.query("SELECT * FROM category ORDER BY category_id ASC", function(err, allCategories) {

            connection.query('SELECT * FROM vendor2category INNER JOIN category ON vendor2category.category_fid = category.category_id', function (err, category) {

                connection.query('SELECT * FROM vendor WHERE vendor.is_featured = 1', function (err, featured) {

                    connection.query('SELECT DISTINCT city FROM vendor ORDER BY city', function (err, cities) {

                        // Append categories as strings onto vendor object
                        var vendorCategory = functions.vendorJoin(vendor, category);

                        res.render('home', {
                            home: 1,
                            title: 'Vendors on a Dime',
                            vendor: vendorCategory,
                            featured: featured,
                            category: category,
                            city: cities,
                            categories: allCategories
                        });
                    });
                });
            });
        });
    });
});

/* Get add gallery page */
router.get('/vendor/:vendorName/gallery', functions.ensureAuthenticated, function(req, res) {
    connection.query('SELECT * FROM vendor WHERE vendor.vendor_url = ?', req.params.vendorName, function (err, vendor) {

        connection.query('SELECT * FROM vendorgallery WHERE vendorgallery.vendor_fid = ?', vendor[0].vendor_id, function (err, photos) {

            res.render('vendor_add_gallery', {
                title: vendor[0].vendor_name + ' Gallery Add',
                vendor: vendor[0],
                photos: photos
            });
        });
    });
});

//Vendor Page
router.get('/vendor/:vendorName', function(req,res) {
    
    async.waterfall([
        getVendor,
        getCategory,
        getGallery,
        checkAccess
    ], function (err, vendorCategory, gallery, access) {
        res.render('vendor_single', {
            access: access,
            title: vendorCategory[0].vendor_name,
            vendor: vendorCategory,
            gallery: gallery
        });
    });
    
    function getVendor (callback) {
        connection.query('SELECT * FROM vendor WHERE vendor.vendor_url = ?', req.params.vendorName, function (err, vendor) {
            callback(null, vendor);
        });
    }
    function getCategory (vendor, callback) {
        connection.query('SELECT * FROM vendor2category INNER JOIN category ON vendor2category.category_fid = category.category_id', function (err, category) {
            var vendorCategory = functions.vendorJoin(vendor, category);
            callback(null, vendorCategory);
        });
    }
    function getGallery (vendorCategory, callback) {
        connection.query('SELECT * FROM vendorgallery WHERE vendorgallery.vendor_fid = ?', vendorCategory[0].vendor_id, function (err, gallery) {
            callback(null, vendorCategory, gallery);
        });
    }
    function checkAccess (vendorCategory, gallery, callback) {
        var access = false;
        if (req.user) {
            var userLog = req.user[0];
            if (userLog.admin)
                access = true;
            else
                connection.query('SELECT * FROM user2vendor WHERE user_fid = ? AND vendor_fid = ?', [userLog.user_id, vendorCategory.vendor_id], function (err, userAccess) {
                    if (userAccess.length)
                        access = true;
                });
            callback(null, vendorCategory, gallery, access);
        }
        else
            callback(null, vendorCategory, gallery, access);
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
