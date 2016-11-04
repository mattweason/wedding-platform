var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var async = require('async');
var _ = require('underscore');
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
                city: cities,
                admin: req.admin
            });
        });
    });

});

//---------------------------------------FAVORITING AND UNFAVORITING A VENDOR--------------------------------------------//
router.get('/favorite/:action/:vendorID', function(req, res){
    var userID = req.user[0].user_id;
    var vendorID = req.params.vendorID;
    var action = req.params.action;

    if (action == 'add') {
        connection.query(`INSERT INTO favoritevendors (user_fid, vendor_fid) VALUES (?, ?)`, [userID, vendorID], function(err) {
            if (err)
                throw err;
            else
                res.send({
                    status: "success"
                })
        });
    }
    else if (action == 'remove') {
        connection.query(`DELETE FROM favoritevendors WHERE user_fid = ? AND vendor_fid = ?`, [userID, vendorID], function(err) {
            if (err)
                throw err;
            res.send({
                status: "success"
            })
        });
    }
});

//---------------------VENDOR REVIEW FORM-----------------------//
router.get('/:vendorName/review', functions.ensureAuthenticated, function(req, res) {
    connection.query('SELECT * FROM vendor WHERE vendor.vendor_url = ? AND vendor.approved = 1', req.params.vendorName, function (err, vendor) {

        res.render('review', {
            title: vendor[0].vendor_name + ' Review',
            vendor: vendor[0],
            admin: req.admin
        });
    });
});

//---------------------VENDOR GALLERY EDIT-----------------------//
router.get('/:vendorName/gallery', functions.ensureAuthenticated, function(req, res) {
    connection.query('SELECT * FROM vendor WHERE vendor.vendor_url = ? AND vendor.approved = 1', req.params.vendorName, function (err, vendor) {

        connection.query('SELECT * FROM vendorgallery WHERE vendorgallery.vendor_fid = ?', vendor[0].vendor_id, function (err, photos) {

            res.render('vendor_add_gallery', {
                title: vendor[0].vendor_name + ' Gallery Add',
                vendor: vendor[0],
                photos: photos,
                admin: req.admin
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
            access: access,
            admin: req.admin
        });
    });

    function getVendor (callback) {
        connection.query('SELECT * FROM vendor WHERE vendor.vendor_url = ? AND vendor.approved = 1', req.params.vendorName, function (err, vendor) {
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

//---------------------EDITING PENDING VENDOR------------------------//
router.get('/:vendorName/pending/edit', functions.ensureAuthenticated, functions.checkAdminAccess, function(req,res, next){

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
            access: access,
            admin: req.admin
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
router.get('/:vendorName/pending', functions.ensureAuthenticated, functions.checkAdminAccess, function(req,res) {

    async.waterfall([
        getVendor,
        getCategory,
        getGallery,
        getUserGallery,
        getReviews,
        getReviewPhotos,
        checkAccess
    ], function (err, vendorCategory, gallery, userGallery, reviews, rating, access) {
        res.render('vendor_single_pending', {
            access: access,
            title: vendorCategory[0].vendor_name,
            vendor: vendorCategory[0],
            review: reviews,
            rating: rating,
            gallery: gallery,
            userGallery: userGallery,
            admin: req.admin
        });
    });

    function getVendor (callback) {
        connection.query('SELECT * FROM vendor WHERE vendor.vendor_url = ? AND vendor.approved = 0', req.params.vendorName, function (err, vendor) {
            console.log(vendor);
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
    function getUserGallery (vendorCategory, gallery, callback) {
        connection.query('SELECT * FROM usergallery WHERE usergallery.vendor_fid = ?', vendorCategory[0].vendor_id, function (err, userGallery) {
            callback(null, vendorCategory, gallery, userGallery);
        });
    }
    function getReviews (vendorCategory, gallery, userGallery, callback) {
        connection.query('SELECT reviews.*, user.username FROM `reviews` INNER JOIN user ON reviews.user_fid = user.user_id WHERE vendor_fid = ? ORDER BY timestamp DESC', vendorCategory[0].vendor_id, function (err, reviews) {
            var ratingCounter = 0;
            var ratingTotal = 0;
            for (var i = 0; i < reviews.length; i++) {
                var mysqlTime = reviews[0].timestamp.toString();
                var time = mysqlTime.split(/[- :]/);
                var date = time[1] + ' ' + time[2] + ', ' + time[3];
                ratingTotal += reviews[i].rating;
                reviews[i].date = date;
                ratingCounter++;
            }
            function round(value, precision) {
                var multiplier = Math.pow(10, precision || 1);
                return Math.round(value * multiplier) / multiplier;
            }
            var rating = round(ratingTotal / ratingCounter);
            callback(null, vendorCategory, gallery, userGallery, reviews, rating);
        });
    }
    function getReviewPhotos (vendorCategory, gallery, userGallery, reviews, rating, callback) {
        connection.query('SELECT * FROM `usergallery` WHERE vendor_fid = ?', vendorCategory[0].vendor_id, function (err, photos) {
            for (var i = 0; i < reviews.length; i++) {
                for (var x = 0; x < photos.length; x++) {
                    if (reviews[i].id == photos[x].review_fid) {
                        if (reviews[i].photos == null)
                            reviews[i].photos = [];
                        reviews[i].photos.push(photos[x].photo_url);
                    }
                }
            }
            callback(null, vendorCategory, gallery, userGallery, reviews, rating);
        });
    }
    function checkAccess (vendorCategory, gallery, userGallery, reviews, rating, callback) {
        var access = false;
        if (req.user) {
            var userLog = req.user[0];
            if (userLog.admin) {
                access = true;
                callback(null, vendorCategory, gallery, userGallery, reviews, rating, access);
            }
            else
                connection.query('SELECT * FROM user2vendor WHERE user_fid = ? AND vendor_fid = ?', [userLog.user_id, vendorCategory[0].vendor_id], function (err, userAccess) {
                    if (userAccess.length) {
                        access = true;
                        callback(null, vendorCategory, gallery, userGallery, reviews, rating, access);
                    }
                    else
                        callback(null, vendorCategory, gallery, userGallery, reviews, rating, access);
                });
        }
        else
            callback(null, vendorCategory, gallery, userGallery, reviews, rating, access);
    }
});

//---------------------VENDOR PAGE-----------------------------//
router.get('/:vendorName', function(req,res) {
    if (req.user)
        var userID = req.user[0].user_id;

    async.waterfall([
        getVendor,
        getFavorites,
        getCategory,
        getGallery,
        getUserGallery,
        getReviews,
        getReviewPhotos,
        getUser,
        checkAccess
    ], function (err, vendor, gallery, userGallery, reviews, userLog, access) {
        res.render('vendor_single', {
            access: access,
            title: vendor[0].vendor_name,
            vendor: vendor[0],
            vendorDesc: functions.nl2br(vendor[0].description),
            review: reviews,
            gallery: gallery,
            userGallery: userGallery,
            user: userLog,
            admin: req.admin
        });
    });

    function getVendor (callback) {
        connection.query('SELECT * FROM vendor WHERE vendor.vendor_url = ? AND vendor.approved = 1', req.params.vendorName, function (err, vendor) {
            callback(null, vendor);
        });
    }
    function getFavorites (vendor, callback) {
        if (userID)
            connection.query('SELECT * FROM favoritevendors', function(err, favorites) {
                var vendorFavorited = functions.vendorFavorites(vendor, favorites);
                console.log(vendorFavorited);
                callback(null, vendorFavorited);
            });
        else
            callback(null, vendor);
    }
    function getCategory (vendor, callback) {
        connection.query('SELECT * FROM vendor2category INNER JOIN category ON vendor2category.category_fid = category.category_id', function (err, category) {
            var vendorCategory = functions.vendorJoin(vendor, category);
            callback(null, vendorCategory);
        });
    }
    function getGallery (vendor, callback) {
        connection.query('SELECT * FROM vendorgallery WHERE vendorgallery.vendor_fid = ?', vendor[0].vendor_id, function (err, gallery) {
            callback(null, vendor, gallery);
        });
    }
    function getUserGallery (vendor, gallery, callback) {
        connection.query('SELECT * FROM usergallery WHERE usergallery.vendor_fid = ?', vendor[0].vendor_id, function (err, userGallery) {
            callback(null, vendor, gallery, userGallery);
        });
    }
    function getReviews (vendor, gallery, userGallery, callback) {
        connection.query('SELECT reviews.*, user.username FROM `reviews` INNER JOIN user ON reviews.user_fid = user.user_id WHERE vendor_fid = ? ORDER BY timestamp DESC', vendor[0].vendor_id, function (err, reviews) {
            var vendorRating = functions.vendorRating(vendor, reviews);
            callback(null, vendorRating, gallery, userGallery, reviews);
        });
    }
    function getReviewPhotos (vendor, gallery, userGallery, reviews, callback) {
        connection.query('SELECT * FROM `usergallery` WHERE vendor_fid = ?', vendor[0].vendor_id, function (err, photos) {
           for (var i = 0; i < reviews.length; i++) {
               for (var x = 0; x < photos.length; x++) {
                   if (reviews[i].id == photos[x].review_fid) {
                       if (reviews[i].photos == null)
                           reviews[i].photos = [];
                       reviews[i].photos.push(photos[x].photo_url);
                   }
               }
           }
            callback(null, vendor, gallery, userGallery, reviews);
        });
    }
    function getUser (vendor, gallery, userGallery, reviews, callback) {
        var userLog = false;
        if (req.user) {
            userLog = req.user[0];
        }
        callback(null, vendor, gallery, userGallery, reviews, userLog);
    }
    function checkAccess (vendor, gallery, userGallery, reviews, userLog, callback) {
        var access = false;
        if (userLog) {
            if (userLog.admin) {
                access = true;
                callback(null, vendor, gallery, userGallery, reviews, userLog, access);
            }
            else
                connection.query('SELECT * FROM user2vendor WHERE user_fid = ? AND vendor_fid = ?', [userLog.user_id, vendor[0].vendor_id], function (err, userAccess) {
                    if (userAccess.length) {
                        access = true;
                        callback(null, vendor, gallery, userGallery, reviews, userLog, access);
                    }
                    else
                        callback(null, vendor, gallery, userGallery, reviews, userLog, access);
                });
        }
        else
            callback(null, vendor, gallery, userGallery, reviews, userLog, access);
    }
});

//----------------------STORING NEW REVIEW IN DATABASE-----------------------//
router.post('/leavereview', function(req, res){
    //Set up formidable
    var form = new formidable.IncomingForm();
    var dataCollection = {userID: req.user[0].user_id};
    var userPhotos = {};
        userPhotos.path = [];
        userPhotos.ext = [];

    async.waterfall([
        uploadImages,
        insertReview,
        insertImages
    ], function(err, fields) {
        res.send({
            message: 'Review Submitted',
            buttontext: 'Back to Vendor',
            url: '/vendor/' + fields.vendorName,
            status: "success"
        })
    });

    function uploadImages (callback) {
        form.multiples = true;

        form.uploadDir = __dirname + "/../uploads/useruploads";

        form.parse(req, function(err, fields) {
            for (var propName in fields) {
                if (fields.hasOwnProperty(propName)) {
                    dataCollection[propName] = fields[propName];
                }
            }
        });

        form.on('fileBegin', function(field, file) {
            if (file.name) {
                userPhotos.ext.push(path.extname(file.name));
                file.path = path.join(__dirname, '/../uploads/useruploads/'+file.name);
                userPhotos.path.push(file.path);
            }

        });

        form.on('end', function(){
            callback(null, userPhotos, dataCollection);
        });
    }
    function insertReview (userPhotos, fields, callback) {
        var query = `INSERT INTO reviews (user_fid, vendor_fid, rating, title, review) VALUES (?, ?, ?, ?, ?)`;

        // execute the query
        connection.query(query, [fields.userID, fields.vendorID, fields.rating, fields.reviewTitle, fields.reviewText], function (err, result) {
            if (err)
                throw err;
            else {
                var reviewID = result.insertId;
                callback(null, userPhotos, fields, reviewID);
            }
        });
    }
    function insertImages (userPhotos, fields, reviewID, callback) {
        if (userPhotos.ext.length) {
            var counter = 0;
            for (var i = 0; i < userPhotos.path.length; i++) {
                var uploadPath = 'uploads/useruploads/' + fields.vendorName + fields.userID + '-' + Date.now() + i + userPhotos.ext[i];

                fs.rename(userPhotos.path[i], uploadPath);

                connection.query(`INSERT INTO usergallery(review_fid, user_fid, vendor_fid, photo_url) VALUES ( ?, ?, ?, ?)`, [reviewID, fields.userID, fields.vendorID, uploadPath], function (err) {
                    if (err) {
                        throw err
                    }
                    else {
                        counter++;
                        if (counter == userPhotos.path.length) {
                            //update vendor category
                            callback(null, fields);
                        }
                    }
                });
            }
        }
        else
            callback(null, fields);
    }
});

//----------------------STORING NEW REVIEW IN DATABASE-----------------------//
router.post('/deletereview', function(req, res){

    var reviewID = req.body.review;
    var vendorName = req.body.vendorName;

    async.waterfall([
        deleteReviewDB,
        selectPhotos,
        deletePhotosDB,
        deletePhotos
    ], function(err) {
        if (err)
            console.log(err);
        else
            res.send({
                message: 'Review Deleted',
                buttontext: 'Refresh Vendor',
                url: '/vendor/' + vendorName,
                status: "success"
            })
    });

    function deleteReviewDB (callback) {
        connection.query('DELETE FROM `reviews` WHERE `id` = ?', reviewID, function (err) {
            if (err)
                throw err;
            else {
                callback(null);
            }
        });
    }
    function selectPhotos (callback) {
        connection.query('SELECT photo_url FROM `usergallery` WHERE `review_fid` = ?', reviewID, function (err, allPhotos) {
            if (err)
                throw err;
            else {
                callback(null, allPhotos);
            }
        });
    }
    function deletePhotosDB (allPhotos, callback) {
        if (allPhotos.length)
            connection.query('DELETE FROM `usergallery` WHERE `review_fid` = ?', reviewID, function (err) {
                if (err)
                    throw err;
                else {
                    callback(null, allPhotos);
                }
            });
        else
            callback(null, allPhotos);

    }
    function deletePhotos (allPhotos, callback) {
        if (allPhotos.length) {
            for (var i=0; i < allPhotos.length; i++) {
                fs.unlinkSync(allPhotos[i].photo_url);
            }
            callback(null);
        }
        else
            callback(null);

    }
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
        var query = `SELECT vendor_name FROM vendor WHERE vendor_name = "${dataCollection.vendor_name}" AND vendor.approved = 1`;
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

        if (req.admin) {
            dataCollection.approved = 1;
        }

        //create array of all values
        var dbValues = [];
        for (var key in dataCollection) {
            dbValues.push(dataCollection[key]);
        }

        var query1 = Object.keys(dataCollection).join(", ");
        var query2 = "'" + dbValues.join("','") + "'";
        var query = `INSERT INTO vendor (${query1}) VALUES (${query2})`;

        console.log(query1);
        console.log(query2);

        //set the message for admin or user
        var message;
        var guest = 0;
        if (req.user[0].admin) {
            message = 'Vendor successfully added.';
        } else {
            message = 'Thank you for your submission! It will be reviewed by our staff for approval.';
            guest = 1;
        }

        // execute the query
        connection.query(query, function (err, feedback) {
            if (err)
                throw err;
            else {
                connection.query('SELECT max(vendor_id) FROM vendor', function (err, vendor) {
                    functions.addCategory(vendor[0]['max(vendor_id)'], category, message, dataCollection.vendor_url, guest, res);
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
        if (file.name) {
            file.path = path.join(__dirname, '/../uploads/featuredimage/'+file.name);
        }
    });

    form.on('file', function (name, file) {
        if(file.name) {
            featuredImage = file.path;
        }
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
                    functions.addCategory(dataCollection.vendor_id, category, 'Vendor successfully edited.', dataCollection.vendor_url, 0, res);
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