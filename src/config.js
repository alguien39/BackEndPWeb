const PORT = process.env.PORT || 3030;
const DB_HOST =  process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || 'Joham';
const DB_PASSWORD = process.env.DB_PASSWORD || '22100166';
const DB_NAME = process.env.DB_NAME || 'PeliculasDB';

module.exports = {
    PORT,
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME
};