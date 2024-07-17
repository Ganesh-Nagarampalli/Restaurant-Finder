const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
app.use(bodyParser.json());
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

app.get('/api/restaurants/:id', (req, res) => {
    const restaurantID = req.params.id;
    const sql = `SELECT * FROM restaurants WHERE RestaurantID = ?`;
    db.query(sql, [restaurantID], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).json({ message: 'Restaurant not found' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
