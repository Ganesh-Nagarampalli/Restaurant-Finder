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
            con.query("DROP TABLE IF EXISTS restaurants", (err, result) => {
                if (err) {
                    return console.error('error: ' + err.message); 
                }
                console.log("Table 'restaurants' dropped if existed");

                // Create the table
                var createStatement = `
                            CREATE TABLE restaurants (
                                RestaurantID VARCHAR(10) PRIMARY KEY,
                                RestaurantName VARCHAR(255),
                                CountryCode VARCHAR(10),
                                City VARCHAR(255),
                                Address VARCHAR(500),
                                Locality VARCHAR(500),
                                LocalityVerbose VARCHAR(500),
                                Longitude DECIMAL(65,30),
                                Latitude DECIMAL(65,30),
                                Cuisines VARCHAR(255),
                                AverageCostForTwo INT,
                                Currency VARCHAR(50),
                                HasTableBooking VARCHAR(5),
                                HasOnlineDelivery VARCHAR(5),
                                IsDeliveringNow VARCHAR(5),
                                SwitchToOrderMenu VARCHAR(5),
                                PriceRange INT,
                                AggregateRating DECIMAL(3, 1),
                                RatingColor VARCHAR(20),
                                RatingText VARCHAR(100),
                                Votes INT
                            );`;

                con.query(createStatement, (err, result) => {
                    if (err) {
                        return console.error('error: ' + err.message); 
                    }
                    console.log("Table 'restaurant' created successfully");

                    // CSV file path
                    const fileName = path.join(__dirname,'..', 'data', 'zomato.csv');

                    // Load CSV data and insert into the table
                    csvtojson().fromFile(fileName).then(source => {
                        
                        source.forEach(row => {
                            
                            var insertStatement = `
                                INSERT INTO restaurants (
                                    RestaurantID, RestaurantName, CountryCode, City, Address,
                                    Locality, LocalityVerbose, Longitude, Latitude, Cuisines,
                                    AverageCostForTwo, Currency, HasTableBooking, HasOnlineDelivery,
                                    IsDeliveringNow, SwitchToOrderMenu, PriceRange, AggregateRating,
                                    RatingColor, RatingText, Votes
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    
                            var values = [
                                row['Restaurant ID'], row['Restaurant Name'], row['Country Code'],
                                row['City'], row['Address'], row['Locality'], row['Locality Verbose'],
                                row['Longitude'], row['Latitude'], row['Cuisines'], row['Average Cost for two'],
                                row['Currency'], row['Has Table booking'], row['Has Online delivery'],
                                row['Is delivering now'], row['Switch to order menu'], row['Price range'],
                                row['Aggregate rating'], row['Rating color'], row['Rating text'], row['Votes']
                            ];
                    
                            con.query(insertStatement, values, (err, result) => {
                                if (err) {
                                    console.error('Unable to insert row: ', err.message);
                                }
                            });
                            
                           
                        });
                        console.log("All items stored into 'restaurants' table successfully");
                    });
                });
            });
        });
    });
});