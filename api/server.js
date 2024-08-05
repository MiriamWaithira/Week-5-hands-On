const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

//initiate the app
const app = express();

//setting up the middleware
app.use(express.json());
app.use(cors());
dotenv.config();

//creating a connection to the database server
const dbConnect = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

//connect to the database server
dbConnect.connect((err) =>{
    if(err) return console.log(err);
    console.log('Connected to the DB Server.');
    
    //create a database
    dbConnect.query('CREATE DATABASE IF NOT EXISTS class_db', (err) =>{
        if(err) return console.log(err);
        console.log('DB: class_db successfully created.');

        //select the created database
        dbConnect.query('USE class_db', (err) => {
            if(err) return console.log(err);
            console.log('class_db selected for use');
        });
    
        //create table
        const query = 'CREATE TABLE IF NOT EXISTS users(id INT AUTO_INCREMENT PRIMARY KEY,email VARCHAR(50) NOT NULL UNIQUE,username VARCHAR(50) NOT NULL UNIQUE,password VARCHAR(255) NOT NULL)';
        
        dbConnect.query(query, (err) => {
            if(err) return console.log(err);
            console.log('Table users created successfully.');
        });
    });
});


//user registration route
app.post('/api/user/register', async (req, res) => {
    try{
        //Hash the password
        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(req.body.password, saltRounds);
        
        const users = 'SELECT * FROM users WHERE email = ?'
        //check if user exists
        dbConnect.query(users, [req.body.email], (err, data) =>{
            if(err) return console.log(err);
            //if we find user with same email in database
            if(data.length > 0) return res.status(409).json("User already exists");    

            //query to create new user
            const newUser = 'INSERT INTO users(email, username, password) VALUES (?)'
            
            value = [ req.body.email, req.body.username, hashPassword]

            dbConnect.query(newUser, [value], (err) => {
                if(err) return console.log(err);
                return res.status(201).json("User created successfully")
            })
        })
    }
    catch(err){
        console.log(err);
        res.status(500).json("Internal Server Error");
    }
});

app.listen(5000, () => {
    console.log('Server is Running');
});

