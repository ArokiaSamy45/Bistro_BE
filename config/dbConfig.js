

const mongodb = require('mongodb')
require('dotenv').config()

const dbUrl = `${process.env.DB_URL}`;


module.exports = { mongodb, dbUrl};

