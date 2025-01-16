const restify = require('restify');
const mysql2 = require('mysql2/promise');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { faker } = require('@faker-js/faker');
const moment = require('moment');
const bulkData = require('./utils');
const { v4: uuidv4 } = require('uuid');
uuidv4();


dotenv.config();

const server = restify.createServer();

server.use(bodyParser.json());

const PORT = process.env.PORT;

// async function mysqlConnection() {
const connection = mysql2.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.MYSQLDB,
});
//    console.log("MYSQL Connected");
//     return connection;
// }

// mysqlConnection();

// function createTable() {
//     connection.query("CREATE TABLE users(id INTEGER PRIMARY KEY AUTO_INCREMENT,username varchar(255), email varchar(255), job varchar(255), logintime VARCHAR(255), logouttime VARCHAR(255), createdAt VARCHAR(255))");
//     console.log("Table Created");
// }
// createTable();

// function createLoggerTable() {
//     connection.query("CREATE TABLE logger_table(id INTEGER PRIMARY KEY AUTO_INCREMENT,agentName VARCHAR(255),campaignName VARCHAR(255),processName VARCHAR(255),leadsetID VARCHAR(255),referenceUUID VARCHAR(255),customerUUID VARCHAR(255),callType VARCHAR(255),ringing VARCHAR(255),callTime VARCHAR(255),hold VARCHAR(255),mute VARCHAR(255),transfer VARCHAR(255),conference VARCHAR(255),duration VARCHAR(255),disposeTime VARCHAR(255),disposeType VARCHAR(255),disposeName VARCHAR(255), datetime DATETIME(6))");
//     console.log("Table Created");
// }
// createLoggerTable();

server.get('/mysql/get', async function(req, res) {
    const result = await connection.query("SELECT * FROM users");
    res.send(result[0]);
});

server.post('/mysql/create', async function(req, res) {
    const {name, email} = req.body;
    await connection.query("INSERT INTO users (name, email) VALUES (?, ?)",[name, email]);
    res.send('Data Inserted sucessfully');
});

server.put('/mysql/update/:id', async function(req, res) {
    const id = req.params.id;
    await connection.query("UPDATE users SET ? WHERE id = ?",[req.body, id]);
    res.send('Data Updated successfully', id);
});

server.del('/mysql/delete/:id', async function(req, res) {
    const id = req.params.id;
    await connection.query("DELETE FROM users WHERE id = ?",[id]);
    res.send('Data Deleted sucessfully', id);
});

server.post('/mysql/insertBulk',async function (req,res) {
    try {
        await connection.query("INSERT INTO logger_table (agentName, campaignName, processName, leadsetID, referenceUUID, customerUUID,callType, ringing,callTime, hold, mute, transfer, conference, duration,disposeTime, disposeType, disposeName,  datetime) VALUES ?",[bulkData]);
        res.send("Bulk Data Inserted Successfully");
    } catch (error) {
        console.log(error);
    } 
});

server.get('/mysql/get/overallReport', async function(req, res) {
    try {
        const [result] = await connection.query("SELECT * FROM logger_table LIMIT 10");
        res.send(result);
    } catch (error) {
        console.log(error);
    } 
});

server.get('/mysql/get/hourlyReport', async function(req, res) {
    try {
        const [results] = await connection.query(`SELECT
        hour(datetime) as hour, 
        count(id) as call_count,
        sum(ringing) as total_ringing,
        sum(callTime) as total_calltime,
        sum(hold) as total_hold, 
        sum(mute) as total_mute, 
        sum(transfer) as total_transfer, 
        sum(conference) as total_conference,
        sum(duration) as total_duration
        from logger_table
        group by 
        hour(datetime);
        `);
        res.send(results);
    } catch (error) {
        console.log(error);
    }
});

server.get('/mysql/filter', async function(req, res) {
    try {
        
    } catch (error) {
        console.log(error);
    }
});    

server.listen(PORT, function () {
    console.log(`listening on port ${PORT}`);
});

module.exports = connection;