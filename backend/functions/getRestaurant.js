const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');


dotenv.config();

const app = express();
app.use(cors());
const port = process.env.PORT || 3000;

const db = mysql.createConnection({
    host: process.env.dbHost,
    user: process.env.dbUser,
    password: process.env.dbPassword,
    database: process.env.dbName,
    
});

db.connect(err => {
    if (err) throw err;
    console.log('Database connected!');
});

app.get('/api/restaurants', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const sql = `SELECT * FROM restaurants LIMIT ${limit} OFFSET ${offset}`;
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
