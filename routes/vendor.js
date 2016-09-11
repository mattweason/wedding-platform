var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var async = require('async');
var path = require('path');
var mysql = require('mysql'); //bring in the mysql package
var sql = require('./../lib/sql'); //bring in the sql.js package of functions
var functions = require('./../lib/functions'); //bring in all custom functions
connection = sql.connect(mysql, sql.credentials);

const fs = require('fs-extra');

//---------------------ADDING NEW VENDOR------------------------//
router.get('/add', functions.ensureAuthenticated, function(req,res, next){

    connection.query("SELECT * FROM category ORDER BY category_id ASC", function(err, category){
        connection.query("SELECT * FROM ontariomunicipalities ORDER BY city", function(err, cities){
            res.render('vendor_add', {
                title: 'Add New Vendor',
                category: category,
                city: cities
            });
        });
    });

});

//---------------------VENDOR GALLERY EDIT-----------------------//
router.get('/:vendorName/review', functions.ensureAuthenticated, function(req, res) {
    connection.query('SELECT * FROM vendor WHERE vendor.vendor_url = ?', req.params.vendorName, function (err, vendor) {

        res.render('review', {
            title: vendor[0].vendor_name + ' Review',
            vendor: vendor[0]
        });
    });
});

//---------------------VENDOR GALLERY EDIT-----------------------//
router.get('/:vendorName/gallery', functions.ensureAuthenticated, function(req, res) {
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

//---------------------EDITING VENDOR------------------------//
router.get('/:vendorName/edit', functions.ensureAuthenticated, functions.checkUser, function(req,res, next){

    async.waterfall([
        getVendor,
        joinCategory,
        getCategory,
        getCities,
        checkAccess
    ], function (err, vendor, category, cities, access) {
        res.render('vendor_edit', {
            title: 'Update Vendor',
            vendor: vendor,
            category: category,
            city: cities,
            access: access
        });
    });

    function getVendor (callback) {
        connection.query('SELECT * FROM vendor WHERE vendor.vendor_url = ?', req.params.vendorName, function (err, vendor) {
            if(vendor[0].price == '$') {
                vendor[0].onedollar = true;
            } else if (vendor[0].price == '$$') {
                vendor[0].twodollar = true;
            } else if (vendor[0].price == '$$$') {
                vendor[0].threedollar = true;
            } else if (vendor[0].price == '$$$$') {
                vendor[0].fourdollar = true;
            }

            if(vendor[0].is_featured == 1) {
                vendor[0].featured = true;
            } else {
                vendor[0].notfeatured = true;
            }
            callback(null, vendor[0]);
        });
    }
    function joinCategory (vendor, callback) {
        connection.query('SELECT category_fid FROM vendor2category  WHERE vendor_fid = ?', vendor.vendor_id, function (err, categoryJoin) {
            if (err) {throw err;}

            else {

                //Take categories belonging to vendor and add the selected property
                var categorySelect = [];
                for (var i = 0; i < categoryJoin.length; i++) {
                    categorySelect.push(categoryJoin[i].category_fid);
                }
            }
            callback(null, vendor, categorySelect);
        });
    }
    function getCategory (vendor, categorySelect, callback) {
        connection.query("SELECT * FROM category ORDER BY category_id ASC", function(err, category) {
            for (var i = 0; i < category.length; i++) {
                if (categorySelect.indexOf(category[i].category_id) > -1) {
                    category[i].selected = true;
                }
            }
            callback(null, vendor, category);
        });
    }
    function getCities (vendor, category, callback) {
        connection.query("SELECT city FROM ontariomunicipalities ORDER BY city", function(err, cities) {
            for (var i = 0; i < cities.length; i++) {
                if (cities[i].city == vendor.city) {
                    cities[i].selected = true;
                }
            }
            callback(null, vendor, category, cities);
        });
    }
    function checkAccess (vendor, category, cities, callback) {
        var access = false;
        if (req.user) {
            var userLog = req.user[0];
            if (userLog.admin)
                access = true;
        }
        callback(null, vendor, category, cities, access);
    }
});

//---------------------VENDOR PAGE-----------------------------//
router.get('/:vendorName', function(req,res) {

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
            if (userLog.admin) {
                access = true;
                callback(null, vendorCategory, gallery, access);
            }
            else
                connection.query('SELECT * FROM user2vendor WHERE user_fid = ? AND vendor_fid = ?', [userLog.user_id, vendorCategory[0].vendor_id], function (err, userAccess) {
                    if (userAccess.length) {
                        access = true;
                        callback(null, vendorCategory, gallery, access);
                    }
                    else
                        callback(null, vendorCategory, gallery, access);
                });
        }
        else
            callback(null, vendorCategory, gallery, access);
    }
});

//----------------------STORING NEW REVIEW IN DATABASE-----------------------//
router.post('/leavereview', function(req, res){
    console.log(req.body);
    var userID = req.user[0].user_id;
    var vendorID = req.body.vendorID;
    var vendorName = req.body.vendorName;
    var rating = req.body.rating;
    var reviewTitle = req.body.reviewTitle;
    var reviewText = req.body.reviewText;

    var query = `INSERT INTO reviews (user_fid, vendor_fid, rating, title, review) VALUES (${userID}, ${vendorID}, ${rating}, '${reviewTitle}', '${reviewText}')`;

    // execute the query
    connection.query(query, function (err) {
        if (err)
            throw err;
    });

    res.send({
        message: 'Review Submitted',
        buttontext: 'Back to Vendor',
        url: '/vendor/' + vendorName,
        status: "success"
    })

});

//----------------------STORING NEW VENDOR IN DATABASE-----------------------//
router.post('/create', function(req, res){

    //Set up formidable
    var form = new formidable.IncomingForm();

    var dataCollection = {};
    var featuredImage;
    var category;

    form.uploadDir = __dirname + "/../uploads/featuredimage";

    form.parse(req, function(err, fields) {
        for (var propName in fields) {
            if (fields.hasOwnProperty(propName)) {
                if(propName == 'category') {
                    category = fields[propName];
                } else if(propName == 'vendor_name') {
                    dataCollection[propName] = fields[propName];
                    var str = fields[propName];
                    str = str.replace(/\s+/g, '_').toLowerCase();
                    dataCollection['vendor_url'] = str;
                } else {
                    dataCollection[propName] = fields[propName];
                }
            }
        }
    });

    form.on('fileBegin', function(field, file) {
        file.path = path.join(__dirname, '/../uploads/featuredimage/'+file.name);
        featuredImage = file.path;
    });

    form.on('end', function(){
        queryExisting();
    });

    //Get all basic form data (separate category)

    function queryExisting() {
        var query = `SELECT vendor_name FROM vendor WHERE vendor_name = "${dataCollection.vendor_name}"`;
        connection.query(query, function(err, result) {
            if(err) {
                throw err;
            } else {
                checkExists(result);
            }
        });
    }

    function checkExists(result) {
        if (result.length) {
            res.send({
                message: 'Duplicate entry: ' + dataCollection.vendor_name + ' already exists in the Vendor database.',
                status: 'failure'
            });
        } else {
            insertVendor();
        }
    }

    //insert values into vendor table
    function insertVendor() {

        //Rename file and add path to dataCollection
        var uploadPath = 'uploads/featuredimage/' + dataCollection.vendor_url + '-featured-image';

        fs.rename(featuredImage, uploadPath);

        dataCollection['featured_image'] = uploadPath;

        //create array of all values
        var dbValues = [];
        for (var key in dataCollection) {
            dbValues.push(dataCollection[key]);
        }

        var query1 = Object.keys(dataCollection).join(", ");
        var query2 = "'" + dbValues.join("','") + "'";
        var query = `INSERT INTO vendor (${query1}) VALUES (${query2})`;

        // execute the query
        connection.query(query, function (err, feedback) {
            if (err)
                throw err;
            else {
                connection.query('SELECT max(vendor_id) FROM vendor', function (err, vendor) {
                    functions.addCategory(vendor[0]['max(vendor_id)'], category, 'Vendor successfully added.', dataCollection.vendor_url, res);
                });
            }
        });
    }

});

//----------------------UPDATING VENDOR IN DATABASE-----------------------//
router.post('/update', function(req, res){

    //Set up formidable
    var form = new formidable.IncomingForm();

    var dataCollection = {};
    var featuredImage;
    var category;

    form.parse(req, function(err, fields) {
        for (var propName in fields) {
            if (fields.hasOwnProperty(propName)) {
                if(propName == 'category') {
                    category = fields[propName];
                } else if(propName == 'vendor_name') {
                    dataCollection[propName] = fields[propName];
                    var str = fields[propName];
                    str = str.replace(/\s+/g, '_').toLowerCase();
                    dataCollection['vendor_url'] = str;
                } else {
                    dataCollection[propName] = fields[propName];
                }
            }
        }
    });

    form.on('fileBegin', function(field, file) {
        file.path = path.join(__dirname, '/../uploads/featuredimage/'+file.name);
    });

    form.on('file', function (name, file) {
        console.log(file.name);
        featuredImage = file.path;
    });

    form.on('end', function(){
        insertVendor();
    });

    //insert values into vendor table
    function insertVendor() {

        //Rename file and add path to dataCollection
        var uploadPath = 'uploads/featuredimage/' + dataCollection.vendor_url + '-featured-image';

        if(typeof featuredImage !== "undefined") {
            fs.rename(featuredImage, uploadPath); //Rename file in uploads/featuredimage folder
            dataCollection['featured_image'] = uploadPath; //Add featured_image key and value to dataCollection
        }
        
        //create array of all values
        var vendorValues = [];
        for(var key in dataCollection) {
            vendorValues.push(dataCollection[key]);
        }
        var vendorKeys = Object.keys(dataCollection);
        var sqlQuery = '';
        for (var i = 0; i < vendorKeys.length; i++) {
            if (i == vendorKeys.length - 1) {
                sqlQuery += vendorKeys[i] + ' = ' + "'" + vendorValues[i] + "'";
            }
            else {
                sqlQuery += vendorKeys[i] + ' = ' + "'" + vendorValues[i] + "'" + ',';
            }
        }
        var query = `UPDATE vendor SET ${sqlQuery} WHERE vendor_id = '${dataCollection.vendor_id}';`;
        // execute the query
        connection.query(query, function(err,feedback){
            if (err)
                throw err;
            else{
                connection.query(`DELETE FROM vendor2category WHERE vendor_fid = ${dataCollection.vendor_id}`, function (err, output) {
                    functions.addCategory(dataCollection.vendor_id, category, 'Vendor successfully edited.', dataCollection.vendor_url, res);
                });
            }
        });
    }
});

//-------------------------------------DELETING VENDOR FROM DATABASE--------------------------------------------------////
router.post('/delete', function(req, res){
    var vendorID;

    for (var propName in req.body) {
        if(propName == 'vendor_id') {
            vendorID = req.body[propName];
        }
    }
    
    functions.vendorDelete(vendorID, 'Vendor successfully deleted', res);
});

module.exports = router;