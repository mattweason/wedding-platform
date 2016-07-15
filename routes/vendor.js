var express = require('express');
var router = express.Router();
var functions = require('./../lib/functions'); //bring in all custom functions

//---------------------ADDING NEW VENDOR------------------------
router.get('/add', function(req,res, next){

    connection.query("SELECT * FROM category ORDER BY category_id ASC", function(err, category){
        res.render('vendor_add', { title: 'Add New Vendor', category: category});
    });

});

//---------------------EDITING VENDOR------------------------
router.get('/:vendorName/edit', function(req,res, next){

    connection.query('SELECT * FROM vendor WHERE vendor.vendor_url = ?', req.params.vendorName, function (err, vendor) {

        connection.query('SELECT * FROM vendor2category INNER JOIN category ON vendor2category.category_fid = category.category_id', function (err, categoryJoin) {
            if (err) {throw err;}

            else {
                //Append categories as strings onto vendor object
                var vendorCategory = functions.vendorJoin(vendor, categoryJoin);
                console.log(vendorCategory[0]);

                connection.query("SELECT * FROM category ORDER BY category_id ASC", function(err, category){
                    res.render('vendor_edit', { title: 'Update Vendor', vendor: vendorCategory[0], category: category});
                });
            }
        });
    });

});

//----------------------STORING NEW VENDOR IN DATABASE-----------------------
router.post('/create', function(req, res){

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
            }
            else {
                dataCollection[propName] = req.body[propName];
            }
        }
    }
    
    insertVendor();

    //insert values into vendor table
    function insertVendor() {

        //create array of all values
        var dbValues = [];
        for(var key in dataCollection) {
            dbValues.push(dataCollection[key]);
        }

        var query1 = Object.keys(dataCollection).join(", ");
        var query2 = "'"+dbValues.join("','")+"'";
        var query = `INSERT INTO vendor (${query1}) VALUES (${query2})`;

        //execute the query
        connection.query(query, function(err,feedback){
            if (err)
                throw err;
            else{
                connection.query('SELECT max(vendor_id) FROM vendor', function(err,vendor){
                    custom.addCategory(vendor[0]['max(vendor_id)'], category, 'Vendor successfully added',res);
                });
            }
        });
    }

});

module.exports = router;