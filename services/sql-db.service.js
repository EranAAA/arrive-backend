var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Ctu0Ctu0',
    database: 'gtfs_db',
    insecureAuth: true
});

connection.connect(err => {
    console.log(err)
    // if (err) throw new Error('mySql failed connection');
    console.log('connected to SQL server');
})


function runSQL(sqlCommand) {
    return new Promise((resolve, reject) => {
        connection.query(sqlCommand, (error, results, fields) => {
            if (error) reject(error);
            else resolve(results);
        });
    })
}

// connection.end();
module.exports = {
    runSQL
}