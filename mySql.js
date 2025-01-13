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
// const data = JSON.parse(bulkData);
// const b = JSON.stringify(data);
// console.log(b);

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
        date(datetime) as date,
        time(datetime) as hour, 
        count(id) as total_calls,
        sum(duration) as total_duration,
        sum(callTime) as total_call_time, 
        sum(hold) as total_hold_time, 
        sum(mute) as total_mute_time, 
        sum(transfer) as total_transfer_time, 
        sum(conference) as total_conference_time,
        sum(ringing) as total_ringing_time 
        from logger_table
        group by 
        hour(datetime);
        `);
        res.send(results);
    } catch (error) {
        console.log(error);
    }
});

// let summaryData = [];
// server.get('/mysql/report/:job', async function(req, res) {
//     const job = req.params.job;
//     let sqlQuery = "SELECT * FROM users WHERE job = ?";
//     try {
//         const result = await connection.query(sqlQuery,[job]);
//         result[0].forEach((obj) => {
//             summaryData.push({
//                 id: obj.id,
//                 username: obj.username,
//                 email: obj.email,
//                 job: obj.job,
//                 login: moment(parseInt(obj.logintime)).format("h:mm:ss A"),
//                 logout: moment(parseInt(obj.logouttime)).format("h:mm:ss A")
//             });
//         });
//         console.log(summaryData);
//         res.send(summaryData);
//     } catch (error) {
//         console.log(error);
//         res.send(error);
//     }
// });

server.listen(PORT, function () {
    console.log(`listening on port ${PORT}`);
});

module.exports = connection;