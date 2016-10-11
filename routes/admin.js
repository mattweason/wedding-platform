var express = require('express');
var router = express.Router();
var async = require('async');
var mysql = require('mysql'); //bring in the mysql package
var sql = require('./../lib/sql'); //bring in the sql.js package of functions
var functions = require('./../lib/functions'); //bring in all custom functions
connection = sql.connect(mysql, sql.credentials);

//----------------------------------ADMIN PAGE-----------------------------//
router.get('/', functions.ensureAuthenticated, functions.checkAdminAccess, function(req, res, next) {
    
    res.redirect('/admin/dashboard');
});

router.get('/dashboard', functions.ensureAuthenticated, functions.checkAdminAccess, function(req, res, next) {

    res.render('admin', {
        admin: req.admin
    });
});

//----------------------------------ADMIN VENDOR LIST-----------------------------//
router.get('/vendors', functions.ensureAuthenticated, functions.checkAdminAccess, function(req, res, next) {

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
            categories: categories,
            admin: req.admin
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

//------------------------------------PENDING VENDOR LIST----------------------------//
router.get('/pending', functions.ensureAuthenticated, functions.checkAdminAccess, function(req, res, next) {

    async.waterfall([
        getVendor,
        allCategories,
        getCategory,
        getCities
    ], function (err, vendor, cities, categories) {
        res.render('admin_pending_list', {
            title: 'Pending Vendor List',
            vendor: vendor,
            city: cities,
            categories: categories,
            admin: req.admin
        });
    });

    function getVendor (callback) {
        connection.query('SELECT * FROM vendor WHERE approved = 0 ORDER BY vendor_name ASC', function(err, vendor) {
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
router.get('/users', functions.ensureAuthenticated, functions.checkAdminAccess, function(req, res, next) {

    async.waterfall([
        getUsers,
        getReviewCount,
        getVendors,
        getOwnedVendors,
        getFreeVendors,
        vendorOwners
    ], function (err, users, vendors, owned, free) {
        res.render('admin_user_list', {
            admin: req.admin,
            users: users,
            vendor: vendors,
            free: free,
            owned: owned
        });
    });

    function getUsers (callback) {
        connection.query('SELECT * FROM user WHERE NOT user.admin = "1" ORDER BY name', function (err, users) {
            callback(null, users);
        });
    }
    function getReviewCount (users, callback) {
        connection.query('SELECT * FROM reviews', function (err, reviews) {
            var userReviews = functions.reviewUserJoin(users, reviews);
            callback(null, userReviews)
        });
    }
    function getVendors (users, callback) {
        connection.query('SELECT * FROM vendor ORDER BY vendor_name', function (err, vendors) {
            callback(null, users, vendors);
        });
    }
    function getOwnedVendors (users, vendors, callback) {
        connection.query('SELECT * FROM user2vendor INNER JOIN vendor ON user2vendor.vendor_fid = vendor.vendor_id GROUP BY vendor_fid', function (err, owned) {
            callback(null, users, vendors, owned);
        });
    }
    function getFreeVendors (users, vendors, owned, callback) {
        connection.query('SELECT * FROM vendor LEFT OUTER JOIN user2vendor ON vendor.vendor_id = user2vendor.vendor_fid WHERE user2vendor.vendor_fid IS NULL', function (err, free) {
            callback(null, users, vendors, owned, free);
        });
    }
    function vendorOwners (users, vendors, owned, free, callback) {
        connection.query('SELECT * FROM vendor INNER JOIN user2vendor ON vendor.vendor_id = user2vendor.vendor_fid', function (err, owners) {
            var usersFull = functions.ownerJoin(users, owners);
            callback(null, usersFull, vendors, owned, free);
        });
    }
});

//----------------------------------------APPROVE A PENDING VENDOR---------------------------//
router.get('/approve/:vendorID', function(req, res){
    connection.query('UPDATE vendor SET approved = 1 WHERE vendor_id = ?', req.params.vendorID, function(err){
        if (err)
            throw err;
        res.send({
            message: 'Vendor Approved',
            buttontext: 'Refresh Vendor List',
            url: '/admin/pending',
            status: "success"
        })
    });
});

//----------------------------------ASSIGN USER AS OWNER--------------------------//
router.post('/assignuser', function(req, res){
    var userID = req.body.user_id;
    var vendorID = req.body.vendor_assign_list;

    connection.query('INSERT INTO user2vendor (user_fid, vendor_fid) VALUES (?, ?)', [userID, vendorID], function(err){
        if (err)
            throw err;
        res.send({
            message: 'User Assigned',
            buttontext: 'Refresh User List',
            url: '/admin/users',
            status: "success"
        })
    });
});

// ----------------------------------UNASSIGN USER AS OWNER--------------------------//
router.post('/unassignuser', function(req, res){
    var userID = req.body.user_id;
    var vendorID = [];
        vendorID.push(req.body.user_owned);
    console.log(vendorID);
    if (vendorID.length == 1)
        connection.query('DELETE FROM user2vendor WHERE user_fid = ? AND vendor_fid = ?', [userID, vendorID], function(err) {
            if (err)
                throw err;
            res.send({
                message: 'User Unassigned',
                buttontext: 'Refresh User List',
                url: '/admin/users',
                status: "success"
            })
        });
    else
        for (var i = 0; i < vendorID.length; i++) {
            connection.query('DELETE FROM user2vendor WHERE user_fid = ? AND vendor_fid = ?', [userID, vendorID[i]], function(err){
                if (err)
                    throw err;
                if (i == vendorID.length)
                    res.send({
                        message: 'User Unassigned',
                        buttontext: 'Refresh User List',
                        url: '/admin/users',
                        status: "success"
                    })
            });
        }
});

module.exports = router;