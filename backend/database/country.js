require('dotenv').config();
// Importing mysql and csvtojson packages 
const csvtojson = require('csvtojson'); 
const mysql = require("mysql2"); 
const path = require('path');

// Database credentials 
const hostname = process.env.dbHost, 
    username = process.env.dbUser, 
    password = process.env.dbPassword;

// Establish connection to the MySQL server 
let con = mysql.createConnection({ 
    host: hostname, 
    user: username, 
    password: password, 
});

con.connect((err) => { 
    if (err) {
        return console.error('error: ' + err.message); 
    }
    console.log("Connected to MySQL server");

    // Create database if it doesn't exist
    con.query(`CREATE DATABASE IF NOT EXISTS zomato;`, (err, result) => {
        if (err) {
            return console.error('error: ' + err.message); 
        }
        console.log("Database created or already exists");

        // Switch to the new database
        con.changeUser({database: 'zomato'}, (err) => {
            if (err) {
                return console.error('error: ' + err.message); 
            }
            console.log("Switched to database 'zomato'");

            // Drop the table if it already exists
            con.query("DROP TABLE IF EXISTS country", (err, result) => {
                if (err) {
                    return console.error('error: ' + err.message); 
                }
                console.log("Table 'country' dropped if existed");

                // Create the table
                var createStatement = `
                            CREATE TABLE country (
                                CountryCode INT PRIMARY KEY,
                                Country VARCHAR(255)
                            )`;

                con.query(createStatement, (err, result) => {
                    if (err) {
                        return console.error('error: ' + err.message); 
                    }
                    console.log("Table 'country' created successfully");

                    // CSV file path
                    const fileName = path.join(__dirname,'..', 'data', 'countryCode.csv');

                    // Load CSV data and insert into the table
                    csvtojson().fromFile(fileName).then(source => {
                        
                        source.forEach(row => {
                            
                            var insertStatement = `
                                INSERT INTO country (
                                    CountryCode, Country
                                ) VALUES (?, ?)`;
                                
                            var values = [
                                row['Country Code'],row['Country']
                            ];
                            console.log('Inserting row with values:', values);
                            con.query(insertStatement, values, (err, result) => {
                                if (err) {
                                    console.error('Unable to insert row: ', err.message);
                                }
                            });
                            
          
                        });
                        console.log("All items stored into 'country' table successfully");
                    });
                });
            });
        });
    });
});