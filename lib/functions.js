var _ = require('underscore');
const fs = require('fs-extra');
var gm = require('gm');

module.exports = {

//--------------------INSERT VENDOR CATEGORIES----------------
    addCategory: function (id, category, message, url, guest, res) {
        var counter = 0;
        for (var i = 0; i < category.length; i++) {
            //record vendor2category links
            connection.query(`INSERT INTO vendor2category(vendor_fid, category_fid) VALUES ( ${id} , ${category[i]} )`, function (err, output) {
                if (err) {
                    throw err
                }
                else {
                    counter++;
                    var buttonUrl;
                    var buttonText;
                    if (guest) {
                        buttonUrl = '/';
                        buttonText = 'Back to Home';
                    } else {
                        buttonUrl = '/vendor/' + url;
                        buttonText = 'View Vendor';
                    }
                    if (counter == category.length) {
                        //update vendor category
                        res.send({
                            message: message,
                            buttontext: buttonText,
                            buttontextgal: 'Add Gallery',
                            url: buttonUrl,
                            urlgal: '/vendor/' + url + '/gallery',
                            guest: guest,
                            status: "success"
                        })
                    }
                }
            });
        }
    },

    //Append owned businesses to a user
    ownerJoin: function (users, ownedVendor) {
        for (var i = 0; i < users.length; i++) {

            var vendorsOwned = _.filter(ownedVendor, function(value){ return users[i].user_id == value.user_fid });

            if (vendorsOwned.length) {
                var vendorsOwnedMeta = [];
                for (var a = 0; a < vendorsOwned.length; a++) {
                    vendorsOwnedMeta.push({name: vendorsOwned[a].vendor_name, id: vendorsOwned[a].vendor_id})
                }
                users[i].businesses = vendorsOwnedMeta;
            }
            else
                users[i].businesses = '';
        }
        return users;
    },

    //Append number of reviews to user object
    reviewUserJoin: function (users, reviews) {
        for (var i = 0; i < users.length; i++) {
            var reviewCount = 0;
            for (var a = 0; a < reviews.length; a++) {
                if (users[i].user_id == reviews[a].user_fid) {
                    reviewCount++;
                }
            }
            users[i].review_count = reviewCount;
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

    //Append favorite vendors onto vendors object
    vendorFavorites: function (vendor, favorites){
        for (var i = 0; i < vendor.length; i++) {
            for (var a = 0; a < favorites.length; a++){
                if (vendor[i].vendor_id == favorites[a].vendor_fid) {
                    vendor[i].favorite = 1;
                }
            }
        }
        return vendor;
    },

    //Append ratings onto vendor object
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
            if (counter > 1) {
                vendor[i].ratingCount = counter;
            }
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
                    buttontextgal: 'Keep Editing',
                    url: '/vendor/' + vendorURL,
                    urlgal: '/vendor/' + vendorURL + '/gallery',
                    status: "success"
                })
            }
        });
    },

    //Rename and resize photos for gallery uploads
    renameResizeImage: function (oldPath, newPath){
        fs.rename(oldPath, newPath, function(err){
            if (err) {throw err;}

            gm(newPath).size(function (err, size) {
                if (err)
                    console.log(err);
                else if (size.width > 1000)
                    gm(newPath)
                        .resize(1000)
                        .noProfile()
                        .write(newPath, function (err) {
                            if (!err) console.log('done');
                        });
            });
        });
    },

    //Ensure authentication for various user locked pages
    ensureAuthenticated: function (req, res, next){
        req.session.url = req.url;
        if(req.isAuthenticated()){
            return next();
        }
        req.session.returnTo = req.originalUrl;
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
    },

    //Change line breaks in SQL results to br tags for html
    nl2br: function (str, is_xhtml){
        var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
    }
};