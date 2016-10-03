const fs = require('fs-extra');

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
                            buttontextgal: 'Add Gallery',
                            url: '/vendor/' + url,
                            urlgal: '/vendor/' + url + '/gallery',
                            status: "success"
                        })
                    }
                }
            });
        }
    },

    //Append owned businesses to a user
    ownerJoin: function (users, owners) {
        for (var i = 0; i < users.length; i++) {

            var vendorsOwned = [];
            var business = {};
            for (var a = 0; a < owners.length; a++) {
                if (users[i].user_id == owners[a].user_fid) {
                    business.name = owners[a].vendor_name;
                    business.id = owners[a].vendor_id;
                    vendorsOwned.push(business);
                }
            }

            if (vendorsOwned)
                users[i].businesses = vendorsOwned;
            else
                users[i].businesses = '';
        }
        return users;
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

    //Append ratings vendor object
    vendorRating: function (vendor, review){
        for (var i = 0; i < vendor.length; i++) {
            var ratingTotal = 0;
            var rating;
            var counter = 0;

            for (var a = 0; a < review.length; a++) {

                if (review[a].vendor_fid == vendor[i].vendor_id) {
                    ratingTotal += review[a].rating;
                    counter++;
                }
            }

            rating = ratingTotal/counter;
            vendor[i].rating = rating;
        }

        return vendor;
    },

    //Delete vendor from vendor table and associated category listings in vendor2category
    vendorDelete: function (vendorID, message, res) {
        connection.query('DELETE FROM vendor WHERE vendor_id = ?', vendorID, function (err) {
            if (err) {
                throw err;
            } else {
                connection.query('DELETE FROM vendor2category WHERE vendor_fid = ?', vendorID, function (err) {
                    if (err) {
                        throw err;
                    } else {

                        connection.query('SELECT * FROM vendorgallery WHERE vendor_fid = ?', vendorID, function (err, gallery) {
                            if (err) {
                                throw err;
                            } else {
                                for (var a = 0; a < gallery.length; a++) {
                                    fs.unlinkSync(gallery[a]['photo_url']);
                                }
                                connection.query('DELETE FROM vendorgallery WHERE vendor_fid = ?', vendorID, function (err) {
                                    res.send({
                                        message: message,
                                        buttontext: 'View Vendors',
                                        url: '/',
                                        status: "success"
                                    });
                                });
                            }
                        });
                    }
                });
            }
        });
    },

    //Delete photo(s) from vendorgallery table
    photoDelete: function (path, message, vendorURL, res) {
        var pathString = path.toString();
        var pathFixed = "'" + pathString.replace(/,/g, "', '") + "'";
        var query = 'DELETE FROM vendorgallery WHERE photo_url IN (' + pathFixed + ')';

        if (path instanceof Array) {
            for (var i = 0; i < path.length; i++) {
                fs.unlinkSync(path[i]);
            }
        } else {
            fs.unlinkSync(path);
        }

        connection.query(query, function (err) {
            if (err) {
                throw err;
            } else {
                res.send({
                    message: message,
                    buttontext: 'View Vendor',
                    buttontextgal: 'Keep Editing Gallery',
                    url: '/vendor/' + vendorURL,
                    urlgal: '/vendor/' + vendorURL + '/gallery',
                    status: "success"
                })
            }
        });
    },
    
    //Add photos to vendorgallery table
    addGallery: function (vendorID, vendorPhotos, message, vendorURL, res) {
        var counter = 0;
        for (var i = 0; i < vendorPhotos.path.length; i++) {
            var uploadPath = 'uploads/' + vendorURL + '-' + Date.now() + i + vendorPhotos.ext[i];

            fs.rename(vendorPhotos.path[i], uploadPath);

            connection.query(`INSERT INTO vendorgallery(vendor_fid, photo_url) VALUES ( ${vendorID} , '${uploadPath}' )`, function (err) {
                if (err) {
                    throw err
                }
                else {
                    counter++;
                    if (counter == vendorPhotos.path.length) {
                        //update vendor category
                        res.send({
                            message: message,
                            buttontext: 'View Vendor',
                            buttontextgal: 'Add More Photos',
                            url: '/vendor/' + vendorURL,
                            urlgal: '/vendor/' + vendorURL + '/gallery',
                            status: "success"
                        });
                    }
                }
            });
        }
    },

    //Ensure authentication for various user locked pages
    ensureAuthenticated: function (req, res, next){
        req.session.url = req.url;
        if(req.isAuthenticated()){
            return next();
        }
        req.session.returnTo = req.originalUrl;
        console.log(req.originalUrl);
        res.redirect('/users/login');
    },

    //Check user level on admin and business level pages
    checkUser: function (req, res, next){
        connection.query('SELECT vendor_id FROM vendor WHERE vendor.vendor_url = ?', req.params.vendorName, function (err, vendorLog) {
            if (req.user) {
                var userLog = req.user[0];
                var vendorID = vendorLog[0].vendor_id;
                if (userLog.admin)
                    return next();
                else
                    connection.query('SELECT * FROM user2vendor WHERE user_fid = ? AND vendor_fid = ?', [userLog.user_id, vendorID], function (err, userAccess) {
                        if (userAccess.length)
                            return next();
                        else
                            res.redirect('/');
                    });
            }
            else
                res.redirect('/');
        });
    },

    //Check if user has admin access
    checkAdminAccess: function (req, res, next){
        if (req.user) {
            var userLog = req.user[0];
            if (userLog.admin)
                return next();
            else
                res.redirect('/');
        }
        else
            res.redirect('/');
    },

    //Check if user is admin
    checkAdmin: function (req, res, next){
        if (req.user) {
            var userLog = req.user[0];
            if (userLog.admin)
                req.admin = true;
                return next();
        }
        else {
            req.admin = false;
            return next();
        }
    }
};