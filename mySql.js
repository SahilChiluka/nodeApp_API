const restify = require('restify');
const mysql2 = require('mysql2/promise');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { faker } = require('@faker-js/faker');
const moment = require('moment');
//moment().format();

dotenv.config();

const server = restify.createServer();

server.use(bodyParser.json());

const PORT = process.env.PORT;

const connection = mysql2.createPool({
    host     : process.env.HOST,
    user     : process.env.USER,
    password : process.env.PASSWORD,
    database : process.env.MYSQLDB
});

// function createTable() {
//     connection.query("CREATE TABLE users(id INTEGER PRIMARY KEY AUTO_INCREMENT,username varchar(255), email varchar(255), job varchar(255), logintime VARCHAR(255), logouttime VARCHAR(255))");
//     console.log("Table Created");
// }
// createTable();

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
let summaryData = [];
server.get('/mysql/summarizeData/:job', async function(req, res) {
    const job = req.params.job;
    let sqlQuery = "SELECT * FROM users WHERE job = ?";
    try {
        const result = await connection.query(sqlQuery,[job]);
        result[0].forEach((obj) => {
            summaryData.push({
                id: obj.id,
                username: obj.username,
                email: obj.email,
                job: obj.job,
                login: moment(parseInt(obj.logintime)).format("h:mm:ss A"),
                logout: moment(parseInt(obj.logouttime)).format("h:mm:ss A")
            });
        });
        console.log(summaryData);
        res.send(summaryData);
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});
  
server.listen(PORT, function () {
    console.log(`listening on port ${PORT}`);
});

// let bulkData = [];
// async function createFakeData() {
//     for(let i=0; i<100000; i++) {
//         bulkData.push([
//             (username = faker.internet.username()),
//             (email = faker.internet.email()),
//             (job = faker.person.jobType()),
//             (logintime = Date.now()),
//             (logouttime = Date.now() + 10000),
//         ]);
//     }
// }
// createFakeData();
// // console.log(bulkData);

// let chunk = 20;
// let chunkArray = [];

// for(let i=0; i<bulkData.length; i+=chunk) {
//     chunkArray = bulkData.slice(i, i+chunk);
//     insertIntoMySql(chunkArray);
// }

// function insertIntoMySql(chunkData) {
//     let sqlQuery = "INSERT INTO users (username, email, job, logintime, logouttime) VALUES ?";
//     connection.query(sqlQuery, [chunkData], (err) => {
//         if(err) throw err;
//         console.log("INSERTED DATA");
//     });
// }

// const time = 1736420294397.5645
const formattedTime = moment(1736420295099).format("h:mm A");
console.log(formattedTime);