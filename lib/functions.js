module.exports = {

//--------------------INSERT VENDOR CATEGORIES----------------
    addCategory: function (id, category, message, res) {
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
                            buttontext: 'View Vendors',
                            url: '/vendor/',
                            status: "success"
                        })
                    }
                }
            });
        }
    }
};