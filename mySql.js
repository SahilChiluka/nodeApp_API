const restify = require('restify');
const mysql2 = require('mysql2/promise');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { faker } = require('@faker-js/faker');
const moment = require('moment');
//moment().format();
const { v4: uuidv4 } = require('uuid');
uuidv4();

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
//     connection.query("CREATE TABLE users(id INTEGER PRIMARY KEY AUTO_INCREMENT,username varchar(255), email varchar(255), job varchar(255), logintime VARCHAR(255), logouttime VARCHAR(255), createdAt VARCHAR(255))");
//     console.log("Table Created");
// }
// createTable();

// function createLoggerTable() {
//     connection.query("CREATE TABLE logger_table(id INTEGER PRIMARY KEY AUTO_INCREMENT,agentName VARCHAR(255),campaignName VARCHAR(255),processName VARCHAR(255),leadsetID VARCHAR(255),referenceUUID VARCHAR(255),customerUUID VARCHAR(255),callType VARCHAR(255),ringing VARCHAR(255),callTime VARCHAR(255),hold VARCHAR(255),mute VARCHAR(255),transfer VARCHAR(255),conference VARCHAR(255),duration VARCHAR(255),disposeTime VARCHAR(255),disposeType VARCHAR(255),datetime DATETIME(6))");
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

let callData = [];

let callType = ['dispose', 'missed', 'autoFailed', 'autoDrop'];

let disposeType = ['callback', 'dnc', 'etx'];

let disposeName = ['followUp', 'do not call', 'external transfer'];

let reasons = ['busy everywhere', 'decline', 'not reachable'];

let noAgentFound = 'noAgentFound';

let callTypeMap = {};

function getCallType(call) {
    // console.log(call);
    if(call === callType[0]) {
        callTypeMap['disposeType'] = 'dispose';
        callTypeMap['disposeName'] = faker.helpers.arrayElement(disposeName);
        if(callTypeMap['disposeName'] === 'followUp') {
            callTypeMap['disposeType'] = disposeType[0];
        } else if(callTypeMap['disposeName'] === 'do not call') {
            callTypeMap['disposeType'] = disposeType[1];
        } else {
            callTypeMap['disposeType'] = disposeType[2];
        }
    } else if(call === callType[1]) {
        callTypeMap['disposeType'] = 'missed';
        callTypeMap['disposeName'] = noAgentFound;
        callTypeMap['disposeType'] = '';
        callTypeMap['ringing'] = 5 + (Math.floor(Math.random()*30)+1);
    } else if(call === callType[2]){
        callTypeMap['disposeType'] = 'autoFailed';
        callTypeMap['disposeName'] = faker.helpers.arrayElement(reasons);
        callTypeMap['disposeType'] = '';
        callTypeMap['ringing'] = 5 + (Math.floor(Math.random()*30)+1);
    } else {
        callTypeMap['disposeType'] = 'autoDrop';
        callTypeMap['disposeName'] = noAgentFound;
        callTypeMap['disposeType'] = '';
        callTypeMap['ringing'] = 5 + (Math.floor(Math.random()*30)+1);
    }
    return callTypeMap;
}
getCallType(faker.helpers.arrayElement(callType));
// console.log(callTypeMap);

let states = ['hold', 'mute', 'transfer', 'conference', ' '];
let callState = 'call';
let ringingState = 'ringing';
let randomStates = [];

let getStateTime;
function randomState(state) {
    callTypeMap['ringing'] = 5 + (Math.floor(Math.random()*30)+1);
    console.log(state);
    if(state == 'hold') {
        callTypeMap[state] = 10 + (Math.floor(Math.random()*30)+1);
        callTypeMap['mute'] = 0;
        callTypeMap['transfer'] = 0;
        callTypeMap['conference'] = 0;
    } else if(state == 'mute') {
        callTypeMap[state] = 10 + (Math.floor(Math.random()*30)+1);
        callTypeMap['hold'] = 0;
        callTypeMap['transfer'] = 0;
        callTypeMap['conference'] = 0;
    } else if(state == 'transfer') {
        callTypeMap[state] = 10 + (Math.floor(Math.random()*60)+1);
        callTypeMap['hold'] = 0;
        callTypeMap['mute'] = 0;
        callTypeMap['conference'] = 0;
    } else if(state == 'conference'){
        callTypeMap[state] = 30 + (Math.floor(Math.random()*100)+1);
        callTypeMap['hold'] = 0;
        callTypeMap['mute'] = 0;
        callTypeMap['transfer'] = 0;
    } 
    callTypeMap['call'] = 50 + (Math.floor(Math.random()*100)+1);
    return callTypeMap;
}
if(callTypeMap.disposeName == 'followUp' || callTypeMap.disposeName == 'do not call') {
    if(callTypeMap.disposeName == 'external transfer') {
        randomState('transfer');
        callTypeMap['disposeTime'] = 10 + (Math.floor(Math.random()*30)+1);
    }
    randomState(faker.helpers.arrayElement(states));
    callTypeMap['disposeTime'] = 10 + (Math.floor(Math.random()*30)+1);
} 


callTypeMap['duration'] = (callTypeMap.call + callTypeMap.hold + callTypeMap.mute + callTypeMap.transfer + callTypeMap.conference);
callData.push(callTypeMap);
console.log(callData);

// for(let i=0; i<3; i++) {
//     const result = getCallType(faker.helpers.arrayElement(callType));
//     console.log(result);
//     callData.push(callTypeMap);
//     console.log(callData);
// }
// console.log(getStateTime);

// let j = Math.floor(Math.random() * 2)+1;
// for(let i=1; i <= j; i++) {
//     randomStates.push(faker.helpers.arrayElement(states));
// }
// randomStates.push(ringingState);
// randomStates.push(callState);
// console.log(randomStates);

// let bulkData = [];
// async function createFakeData() {
//     for(let i=0; i<3; i++) {
        // bulkData.push([
        //     (agentname = faker.helpers.arrayElement(['Sahil','Rohit', 'Anupam','Ajay','Harish','Laksh','Pradeep','Akash'])),
        //     (campaignName = faker.helpers.arrayElement(['sales','insurance','marketing','finance'])),
        //     (processName = faker.helpers.arrayElement(['process1', 'process2', 'process3', 'process4', 'process5'])),
        //     (leadsetID = Math.floor(Math.random()*10)+1),
        //     (referenceUUID = uuidv4()),
        //     (customerUUID = uuidv4()),
        //     (ringing = (callData[i].ringing ? callData[i].ringing : 0)),
        //     (callTime = (callData[i].call ? callData[i].call : 0)),
        //     (hold = (callData[i].hold ? callData[i].hold : 0)),
        //     (mute = (callData[i].mute ? callData[i].mute : 0)),
        //     (transfer = (callData[i].transfer ? callData[i].transfer : 0)),
        //     (conference = (callData[i].conference ? callData[i].conference : 0)),
        //     (duration = (callData[i].duration ? callData[i].duration : 0)),
        //     (disposeTime = (callData[i].disposeTime ? callData[i].disposeTime : 0)),
        //     (disposeType = callData[i].disposeType),
        //     (disposeName = callData[i].disposeName),
        //     (datetime = new Date())
        // ]);
//     }
// }
// createFakeData();
// console.log(bulkData);

// let chunk = 20;
// let chunkArray = [];

// for(let i=0; i<bulkData.length; i+=chunk) {
//     chunkArray = bulkData.slice(i, i+chunk);
//     insertIntoMySql(chunkArray);
// }

// function insertIntoMySql(chunkData) {
//     let sqlQuery = "INSERT INTO users (username, email, job, logintime, logouttime, createdAt) VALUES ?";
//     connection.query(sqlQuery, [chunkData], (err) => {
//         if(err) throw err;
//         console.log("INSERTED DATA");
//     });
// }

// const time =  uuidv4();
// const formattedTime = moment(1736420295099).format("h:mm A");
// console.log(time);

server.listen(PORT, function () {
    console.log(`listening on port ${PORT}`);
});