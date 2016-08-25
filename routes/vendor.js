var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var path = require('path');
var mysql = require('mysql'); //bring in the mysql package
var sql = require('./../lib/sql'); //bring in the sql.js package of functions
var functions = require('./../lib/functions'); //bring in all custom functions
connection = sql.connect(mysql, sql.credentials);

const fs = require('fs-extra');

//---------------------ADDING NEW VENDOR------------------------
router.get('/add', function(req,res, next){

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

//---------------------EDITING VENDOR------------------------
router.get('/:vendorName/edit', function(req,res, next){

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

        connection.query('SELECT category_fid FROM vendor2category  WHERE vendor_fid = ?', vendor[0].vendor_id, function (err, categoryJoin) {
            if (err) {throw err;}

            else {

                //Take categories belonging to vendor and add the selected property
                var selectedCategoryArray = [];
                for (var i = 0; i < categoryJoin.length; i++) {
                    selectedCategoryArray.push(categoryJoin[i].category_fid);
                }

                connection.query("SELECT * FROM category ORDER BY category_id ASC", function(err, category){
                    for (var i = 0; i < category.length; i++) {
                        if (selectedCategoryArray.indexOf(category[i].category_id) > -1){
                            category[i].selected = true;
                        }
                    }

                    connection.query("SELECT city FROM ontariomunicipalities ORDER BY city", function(err, cities){
                        for (var i = 0; i < cities.length; i++) {
                            if (cities[i].city == vendor[0].city){
                                cities[i].selected = true;
                            }
                        }

                        res.render('vendor_edit', {
                            title: 'Update Vendor',
                            vendor: vendor[0],
                            category: category,
                            city: cities
                        });
                    });
                });
            }
        });
    });

});

//----------------------STORING NEW VENDOR IN DATABASE-----------------------
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

//----------------------UPDATING VENDOR IN DATABASE-----------------------
router.post('/update', function(req, res){

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

//-------------------------------------DELETING VENDOR FROM DATABASE--------------------------------------------------//
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