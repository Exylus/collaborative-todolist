const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
});

module.exports = db;