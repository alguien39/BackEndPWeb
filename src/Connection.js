const mysql2 = require('mysql2');
const {DB_HOST, DB_USER, DB_PORT, DB_PASSWORD, DB_NAME} = require("./config.js");

const db = mysql2.createConnection({
    host: DB_HOST,
    user: DB_USER,
    port: DB_PORT,
    password: DB_PASSWORD,
    database: DB_NAME
});

module.exports = db;