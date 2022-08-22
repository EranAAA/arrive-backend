var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'us-cdbr-east-06.cleardb.net',
    port: 3306,
    user: 'b6039f404295f5',
    password: '017ac88e',
    database: 'heroku_b8b55fff6ba3d4c',
    insecureAuth: true
});

// CLEARDB_DATABASE_URL
// mysql://b6039f404295f5:017ac88e@us-cdbr-east-06.cleardb.net/heroku_b8b55fff6ba3d4c?

// var connection = mysql.createConnection({
//     host: 'localhost',
//     port: 3306,
//     user: 'root',
//     password: 'Ctu0Ctu0',
//     database: 'gtfs_db',
//     insecureAuth: true
// });

// connection.connect(err => {
//     console.log('err: ',err)
//     // if (err) console.log('PROTOCOL_CONNECTION_LOST - 27')
//     if (err) throw new Error('mySql failed connection')

//     console.log('connected to SQL server')
// })


var db_config = {
    host: 'us-cdbr-east-06.cleardb.net',
    port: 3306,
    user: 'b6039f404295f5',
    password: '017ac88e',
    database: 'heroku_b8b55fff6ba3d4c',
    insecureAuth: true
};

var connection;

function handleDisconnect() {
    connection = mysql.createConnection(db_config); // Recreate the connection, since
    // the old one cannot be reused.

    connection.connect(function (err) {              // The server is either down
        if (err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        } else {
            console.log('connected to SQL server')
        }                                   // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
    // If you're also serving http, display a 503 error.
    connection.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();



function runSQL(sqlCommand) {
    return new Promise((resolve, reject) => {
        connection.query(sqlCommand, (error, results, fields) => {
            // if (error.code === "PROTOCOL_CONNECTION_LOST") console.log('PROTOCOL_CONNECTION_LOST - 38');
            if (error) reject('error', error);
            else resolve(results);


        });
    })
}

// connection.end();
module.exports = {
    runSQL
}
