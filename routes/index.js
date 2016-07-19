var express = require('express');
var router = express.Router();
var multer = require('multer');
var mysql = require('mysql'); //bring in the mysql package
var sql = require('./../lib/sql'); //bring in the sql.js package of functions
var functions = require('./../lib/functions'); //bring in the functions.js
connection = sql.connect(mysql, sql.credentials);

//Set up multer
var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});
var upload = multer({ storage : storage}).array('upl');

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

router.get('/vendor/:vendorName/gallery', function(req, res) {
    connection.query('SELECT * FROM vendor WHERE vendor.vendor_url = ?', req.params.vendorName, function (err, vendor) {
        res.render('vendor_add_gallery', {
            title: vendor[0].vendor_name + ' Gallery Add',
            vendor: vendor[0]
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

//Multer test
router.post('/api/photo', function(req,res){

    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        } else {
            var vendorID = req.body.vendor_id;
            var vendorURL = req.body.vendor_url;
            var vendorPhotos = [];
            for (var i = 0; i < req.files.length; i++) {
                vendorPhotos.push(req.files[i].path);
            }
            var query = `INSERT INTO vendorgallery(vendor_fid, photo_url) VALUES ( ${vendorID} , '${vendorPhotos[0]}' )`;
            console.log(query);
            // functions.addGallery(vendorID, vendorPhotos, 'Gallery successfully updated.', vendorURL, res);
            console.log(vendorPhotos);
            console.log(vendorID);
            res.status(204).end();
        }
    });
});

module.exports = router;
