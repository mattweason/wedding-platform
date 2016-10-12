var express = require('express');
var router = express.Router();
var async = require('async');
var _ = require('underscore');
var mysql = require('mysql'); //bring in the mysql package
var sql = require('./../lib/sql'); //bring in the sql.js package of functions
var functions = require('./../lib/functions'); //bring in all custom functions
connection = sql.connect(mysql, sql.credentials);

//----------------------CLAIMING BUSINESS API CALL-------------------------//
router.get('/business/:vendorID', function(req, res, next){
    connection.query('SELECT * FROM vendor WHERE vendor_id = ?', req.params.vendorID, function(err, vendor){
        console.log(vendor);
        res.send({
            name: vendor[0].vendor_name,
            phone: vendor[0].phone_number,
            address1: vendor[0].address + ", " + vendor[0].address_2,
            address2: vendor[0].city + ", " + vendor[0].province + ", " + vendor[0].postal_code
        })
    });
});

module.exports = router;