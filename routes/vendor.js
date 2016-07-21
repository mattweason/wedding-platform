var express = require('express');
var router = express.Router();
var multer = require('multer');
var functions = require('./../lib/functions'); //bring in all custom functions

//Set up multer
var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, '/uploads/');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});
var upload = multer({ storage : storage}).single('featured_image');

//---------------------ADDING NEW VENDOR------------------------
router.get('/add', function(req,res, next){

    connection.query("SELECT * FROM category ORDER BY category_id ASC", function(err, category){
        res.render('vendor_add', { title: 'Add New Vendor', category: category});
    });

});

//---------------------EDITING VENDOR------------------------
router.get('/:vendorName/edit', function(req,res, next){

    connection.query('SELECT * FROM vendor WHERE vendor.vendor_url = ?', req.params.vendorName, function (err, vendor) {

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

                    res.render('vendor_edit', { title: 'Update Vendor', vendor: vendor[0], category: category});
                });
            }
        });
    });

});

//----------------------STORING NEW VENDOR IN DATABASE-----------------------
router.post('/create', function(req, res){

    var dataCollection = {};

    upload(req,res,function(err) {
        if(err) {
            return res.end(err);
        } else {
            dataCollection['featured_image'] = req.file.path;
            console.log(req.file.path);
        }
    });

    //Get all basic form data (separate category)
    for (var propName in req.body) {
        if (req.body.hasOwnProperty(propName)) {
            if(propName == 'category') {
                var category = req.body[propName];
            } else if(propName == 'vendor_name') {
                dataCollection[propName] = req.body[propName];
                var str = req.body[propName];
                str = str.replace(/\s+/g, '_').toLowerCase();
                dataCollection['vendor_url'] = str;
            } else {
                dataCollection[propName] = req.body[propName];
            }
        }
    }

    var result = [];
    var query = `SELECT vendor_name FROM vendor WHERE vendor_name = "${dataCollection.vendor_name}"`;
    connection.query(query, function(err, rows) {
        if(err) {
            throw err;
        } else {
            setValue(rows);
        }
    });

    function setValue(value) {
        result = value;
        checkExists(result);
    }

    function checkExists(result) {
        if (result.length) {
            res.send({
                message: 'Duplicate entry: ' + dataCollection.vendor_name + ' already exists in the Vendor database.',
                status: 'failure'
            });
        } else {
            res.end();
            // insertVendor();
        }
    }

    //insert values into vendor table
    function insertVendor() {

        //create array of all values
        var dbValues = [];
        for (var key in dataCollection) {
            dbValues.push(dataCollection[key]);
        }

        var query1 = Object.keys(dataCollection).join(", ");
        var query2 = "'" + dbValues.join("','") + "'";
        var query = `INSERT INTO vendor (${query1}) VALUES (${query2})`;

        //execute the query
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

    var dataCollection = {};

    //Get all basic form data (separate category)
    for (var propName in req.body) {
        if (req.body.hasOwnProperty(propName)) {
            if(propName == 'category') {
                var category = req.body[propName];
            }
            else if(propName == 'vendor_name') {
                dataCollection[propName] = req.body[propName];
                var str = req.body[propName];
                str = str.replace(/\s+/g, '_').toLowerCase();
                dataCollection['vendor_url'] = str;
            } else {
                dataCollection[propName] = req.body[propName];
            }
        }
    }

    insertVendor();

    //insert values into vendor table
    function insertVendor() {

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