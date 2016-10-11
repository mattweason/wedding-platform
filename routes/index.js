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

router.use(functions.checkAdmin);

//bring in all sub-routes
router.use('/vendor', require('./vendor'));
router.use('/admin', require('./admin'));

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.user)
        var userID = req.user[0].user_id;

    async.waterfall([
        getVendor,
        getFavorites,
        allCategories,
        getCategory,
        vendorRating,
        getFeatured,
        getFeaturedFavorites,
        featuredRating,
        getCities
    ], function (err, vendorFull, featured, cities, categories) {
        res.render('home', {
            home: 1,
            admin: req.admin,
            title: 'Vendors on a Dime',
            vendor: vendorFull,
            featured: featured,
            city: cities,
            categories: categories
        });
    });

    function getVendor (callback) {
        connection.query('SELECT * FROM vendor WHERE vendor.approved = 1 ORDER BY vendor_name ASC ', function(err, vendor) {
            callback(null, vendor);
        });
    }
    function getFavorites (vendor, callback) {
        if (userID)
            connection.query('SELECT * FROM favoritevendors WHERE user_fid = ?', userID, function(err, favorites) {
                var vendorFavorited = functions.vendorFavorites(vendor, favorites);
                console.log(vendorFavorited);
                callback(null, vendorFavorited);
            });
        else
            callback(null, vendor);
    }
    function allCategories (vendor, callback) {
        connection.query("SELECT * FROM category ORDER BY category_id ASC", function(err, categories) {
            callback(null, vendor, categories);
        });
    }
    function getCategory (vendor, categories, callback) {
        connection.query('SELECT * FROM vendor2category INNER JOIN category ON vendor2category.category_fid = category.category_id', function (err, category) {

            // Append categories as strings onto vendor object
            var vendorCat = functions.vendorJoin(vendor, category);

            callback(null, vendorCat, categories, category);
        });
    }
    function vendorRating (vendor, categories, category, callback) {
       connection.query('SELECT * FROM reviews ORDER BY vendor_fid ASC', function(err, reviews) {
           var vendorFull = functions.vendorRating(vendor, reviews);
           callback(null, vendorFull, categories, category);
       });
    }
    function getFeatured (vendor, categories, category, callback) {
        connection.query('SELECT * FROM vendor WHERE vendor.is_featured = 1 AND vendor.approved = 1', function (err, featured) {

            // Append categories as strings onto vendor object
            var featuredCat = functions.vendorJoin(featured, category);

            callback(null, vendor, featuredCat, categories);
        });
    }
    function getFeaturedFavorites (vendor, featured, categories, callback) {
        if (userID)
            connection.query('SELECT * FROM favoritevendors', function(err, favorites) {
                var featuredFavorited = functions.vendorFavorites(featured, favorites);
                console.log(featuredFavorited);
                callback(null, vendor, featuredFavorited, categories);
            });
        else
            callback(null, vendor, featured, categories);
    }
    function featuredRating (vendor, featured, categories, callback) {
        connection.query('SELECT * FROM reviews ORDER BY vendor_fid ASC', function (err, reviews) {
            var featuredFull = functions.vendorRating(featured, reviews);
            callback(null, vendor, featuredFull, categories);
        } );
    }
    function getCities (vendor, featured, categories, callback) {
        connection.query('SELECT DISTINCT city FROM vendor WHERE vendor.approved = 1 ORDER BY city', function (err, cities) {
            callback(null, vendor, featured, cities, categories);
        });
    }
});

/*Get user profile page. */
router.get('/profile/:userID', functions.ensureAuthenticated, function(req, res) {

    async.waterfall([
        getUserProfile,
        getFavorites,
        getCategory,
        getReviews,
        getReviewPhotos,
        getUserGallery
    ], function (err, profile, favorites, reviews, userGallery) {
        res.render('user_profile', {
            profile: profile[0],
            favorite: favorites,
            review: reviews,
            userGallery: userGallery
        });
    });

    function getUserProfile (callback) {
        connection.query('SELECT * FROM user WHERE user.user_id = ?', req.params.userID, function (err, profile) {
            callback(null, profile);
        });
    }
    function getFavorites (profile, callback) {
        connection.query('SELECT * FROM vendor INNER JOIN favoritevendors ON vendor.vendor_id = favoritevendors.vendor_fid WHERE favoritevendors.user_fid = ? AND vendor.approved = 1', req.params.userID, function (err, favorites) {
            for (var i = 0; i < favorites.length; i++) {
                favorites[i].favorite = 1;
            }
            callback(null, profile, favorites);
        });
    }
    function getCategory (profile, favorites, callback) {
        connection.query('SELECT * FROM vendor2category INNER JOIN category ON vendor2category.category_fid = category.category_id', function (err, category) {
            var favoriteCategory = functions.vendorJoin(favorites, category);
            callback(null, profile, favoriteCategory);
        });
    }
    function getReviews (profile, favorites, callback) {
        connection.query(`SELECT * FROM reviews INNER JOIN vendor ON reviews.vendor_fid = vendor.vendor_id WHERE reviews.user_fid = ? AND vendor.approved = 1`, req.params.userID, function (err, reviews) {
            callback(null, profile, favorites, reviews);
        });
    }
    function getReviewPhotos (profile, favorites, reviews, callback) {
        connection.query('SELECT * FROM `usergallery` WHERE user_fid = ?', req.params.userID, function (err, photos) {
            for (var i = 0; i < reviews.length; i++) {
                for (var x = 0; x < photos.length; x++) {
                    if (reviews[i].id == photos[x].review_fid) {
                        if (reviews[i].photos == null)
                            reviews[i].photos = [];
                        reviews[i].photos.push(photos[x].photo_url);
                    }
                }
            }
            console.log(reviews);
            callback(null, profile, favorites, reviews);
        });
    }
    function getUserGallery (profile, favorites, reviews, callback) {
        connection.query('SELECT * FROM usergallery WHERE usergallery.user_fid = ?', req.params.userID, function (err, userGallery) {
            callback(null, profile, favorites, reviews, userGallery);
        });
    }

});

//Upload photos and post to vendorgallery table
router.post('/uploadGallery', function(req,res){
    //Set up formidable
    var form = new formidable.IncomingForm();
    form.keepExtensions = true;
    var vendorPhotos = {};
        vendorPhotos.path = [];
        vendorPhotos.ext = [];
    var vendorID;
    var vendorURL;

    form.multiples = true;

    form.uploadDir = __dirname + "/../uploads";

    form.parse(req, function(err, fields) {
        vendorID = fields.vendor_id;
        vendorURL = fields.vendor_url;
    });

    form.on('fileBegin', function(field, file) {
        vendorPhotos.ext.push(path.extname(file.name));
        file.path = path.join(__dirname, '/../uploads/'+file.name);
        vendorPhotos.path.push(file.path);
    });

    form.on('end', function(){
        functions.addGallery(vendorID, vendorPhotos, 'Gallery successfully updated.', vendorURL, res);
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
