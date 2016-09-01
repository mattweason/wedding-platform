module.exports = {

    //database credentials
    credentials:{
        host: 'localhost',
        user: 'root',
        password: 'Oasis-c0d3',
        database: 'wedding-platform'
    },

    //make SQL connection
    connect: function(mysql, credentials) {

        return mysql.createConnection({
            host: credentials.host,
            user: credentials.user,
            password: credentials.password,
            database: credentials.database
        });
    }
    
};