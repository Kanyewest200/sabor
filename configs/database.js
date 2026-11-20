require('dotenv').config();


const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host:process.env.DB_HOST||'localhost',
        port:process.env.DB_POST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    }

});

module.exports = knex;
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        



















































































    


