const MongoClient = require('mongodb').MongoClient
var config;

if (process.env.NODE_ENV === 'production') {
   config = { 'dbURL': '' }
} else {
   config = { 'dbURL': 'mongodb://localhost:27017' }
}

// Database Name
const dbName = 'gtfs_db'
var dbConn = null

async function getCollection(collectionName) {
   try {
      const db = await connect()
      const collection = await db.collection(collectionName)
      return collection
   } catch (err) {
      logger.error('Failed to get Mongo collection', err)
      throw err
   }
}

async function connect() {
   if (dbConn) return dbConn
   try {
      const client = await MongoClient.connect(config.dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
      const db = client.db(dbName)
      dbConn = db
      return db
   } catch (err) {
      logger.error('Cannot Connect to DB', err)
      throw err
   }
}

module.exports = {
   getCollection
}


