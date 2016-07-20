module.exports = {

//--------------------INSERT VENDOR CATEGORIES----------------
    addCategory: function (id, category, message, url, res) {
        var counter = 0;
        for (var i = 0; i < category.length; i++) {
            //record vendor2category links
            connection.query(`INSERT INTO vendor2category(vendor_fid, category_fid) VALUES ( ${id} , ${category[i]} )`, function (err, output) {
                if (err) {
                    throw err
                }
                else {
                    counter++;
                    if (counter == category.length) {
                        //update vendor category
                        res.send({
                            message: message,
                            buttontext: 'View Vendor',
                            url: '/vendor/' + url,
                            status: "success"
                        })
                    }
                }
            });
        }
    },

    //Append categories as strings onto vendor object
    vendorJoin: function (vendor, category){
        for (var i = 0; i < vendor.length; i++) {

            var categoryNames = [];

            for (var a = 0; a < category.length; a++) {

                if (vendor[i].vendor_id == category[a].vendor_fid) {
                    categoryNames.push(category[a].category_name);
                }
            }

            vendor[i].category = categoryNames.join(', ');
        }
        
        return vendor;
    },

    //Delete vendor from vendor table and associated category listings in vendor2category
    vendorDelete: function (vendorID, message, res) {
        connection.query('DELETE FROM vendor WHERE vendor_id = ?', vendorID, function (err, output) {
            if (err) {
                throw err;
            } else {
                connection.query('DELETE FROM vendor2category WHERE vendor_fid = ?', vendorID, function (err, output) {
                    if (err) {
                        throw err;
                    } else {
                        res.send({
                            message: message,
                            buttontext: 'View Vendors',
                            url: '/',
                            status: "success"
                        })
                    }
                });
            }
        });
    },

    //Delete photo(s) from vendorgallery table
    photoDelete: function (path, message, vendorURL, res) {
        var counter = 0;
        for (var i = 0; i < path.length; i++) {
            
        }
        connection.query('DELETE FROM vendorgallery WHERE photo_url = ?', path[i], function (err) {
            if (err) {
                throw err;
            } else {
                counter++;
                if (counter == path.length) {
                    res.send({
                        message: message,
                        buttontext: 'View Vendor',
                        url: '/vendor/' + vendorURL,
                        status: "success"
                    }) 
                }
            }
        });
    },
    
    //Add photos to vendorgallery table
    addGallery: function (vendorID, vendorPhotos, message, vendorURL, res) {
        var counter = 0;
        for (var i = 0; i < vendorPhotos.length; i++) {

            connection.query(`INSERT INTO vendorgallery(vendor_fid, photo_url) VALUES ( ${vendorID} , '${vendorPhotos[i]}' )`, function (err) {
                if (err) {
                    throw err
                }
                else {
                    counter++;
                    if (counter == vendorPhotos.length) {
                        //update vendor category
                        res.send({
                            message: message,
                            buttontext: 'View Vendor',
                            url: '/vendor/' + vendorURL,
                            status: "success"
                        });
                    }
                }
            });
        }
    }
};