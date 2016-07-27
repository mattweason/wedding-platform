var express = require('express');
var router = express.Router();
var multer = require('multer');
var mysql = require('mysql'); //bring in the mysql package
var sql = require('./../lib/sql'); //bring in the sql.js package of functions
var functions = require('./../lib/functions'); //bring in the functions.js
connection = sql.connect(mysql, sql.credentials);

const fs = require('fs');

//bring in all sub-routes
router.use('/vendor', require('./vendor'));

/* GET home page. */
router.get('/', function(req, res, next) {

    connection.query('SELECT * FROM vendor ORDER BY vendor_name ASC', function(err, vendor) {

        connection.query('SELECT * FROM vendor2category INNER JOIN category ON vendor2category.category_fid = category.category_id', function(err, category) {

            connection.query('SELECT * FROM vendor WHERE vendor.is_featured = 1', function(err, featured) {

                var featuredID = [];
                for (var i = 0; i < featured.length; i++) {
                    featuredID.push(featured[i].vendor_id);
                }
                var featuredString = featuredID.toString();
                // var pathFixed = "'" + pathString.replace(/,/g, "', '") + "'";
                
                connection.query('SELECT * FROM vendor2category WHERE vendor2category.vendor_fid = ?', featured[0].vendor_id, function(err, featuredCat) {

                    // Append categories as strings onto vendor object
                    var vendorCategory = functions.vendorJoin(featured, featuredCat);
                    console.log(vendorCategory);

                    res.render('home', {
                        home: 1,
                        title: 'Vendors on a Dime',
                        vendor: vendor,
                        featured: vendorCategory
                    });
                });
            });
        });
    });
});

/* Get add gallery page */
router.get('/vendor/:vendorName/gallery', function(req, res) {
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
    connection.query('SELECT * FROM vendor WHERE vendor.vendor_url = ?', req.params.vendorName, function (err, vendor) {

        connection.query('SELECT * FROM vendor2category INNER JOIN category ON vendor2category.category_fid = category.category_id', function (err, category) {

            connection.query('SELECT * FROM vendorgallery WHERE vendorgallery.vendor_fid = ?', vendor[0].vendor_id, function (err, gallery) {

                //Append categories as strings onto vendor object
                var vendorCategory = functions.vendorJoin(vendor, category);

                res.render('vendor_single', {
                    title: vendorCategory[0].vendor_name,
                    vendor: vendorCategory,
                    gallery: gallery
                });
            });
        });
    });
});

//Upload photos and post to vendorgallery table
router.post('/api/photo', function(req,res){

    //Set up multer
    var storage =   multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, './uploads/');
        },
        filename: function (req, file, callback) {
            callback(null, req.body.vendor_url + '-' + Date.now());
        }
    });
    var upload = multer({ storage : storage}).array('upl');

    upload(req,res,function(err) {
        if(err) {
            return res.end(err);
        } else {
            var vendorID = req.body.vendor_id;
            var vendorURL = req.body.vendor_url;
            var vendorPhotos = [];
            for (var i = 0; i < req.files.length; i++) {
                var photoPath = req.files[i].path;
                var photoPathFixed = photoPath.replace("\\", "/");
                vendorPhotos.push(photoPathFixed);
            }
            functions.addGallery(vendorID, vendorPhotos, 'Gallery successfully updated.', vendorURL, res);
        }
    });
});

//Upload photos and post to vendorgallery table
router.post('/gallerydelete', function(req,res){

    var vendorURL = req.body.vendor_url;
    var path = req.body.delete_photo;

    functions.photoDelete(path, 'Photo(s) successfully deleted.', vendorURL, res);

});

module.exports = router;
