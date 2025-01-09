const restify = require('restify');
const {MongoClient} = require('mongodb');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { faker } = require('@faker-js/faker');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
uuidv4();

dotenv.config();

const server = restify.createServer();

server.use(bodyParser.json());

const PORT = process.env.PORT;
const URI = process.env.MONGOURI;
const MONGODB = process.env.MONGODB;

let db;

const client = new MongoClient(URI);

async function mongoConnection() {
    await client.connect();
    db = client.db(MONGODB);
    console.log("Mongo Connected");
}

mongoConnection();

server.get('/mongo/get', async function(req,res) {
    const result = await db.collection('users').find({}).toArray();
    res.send(result);
});

server.post('/mongo/create', async function (req, res) {
    const {name, email} = req.body;
    const userId = uuidv4();
    
    await db.collection('users').insertOne({name, email, userId});
    res.send("Data Inserted Sucessfully");
});

server.put('/mongo/update/:id', async function(req, res) {
    const id = req.params.id;
    await db.collection('users').updateOne({userId: id},{$set: req.body});
    res.send("Data Updated Sucessfully", id);
});

server.del('/mongo/delete/:id', async function(req, res) {
    const id = req.params.id;
    await db.collection('users').deleteOne({userId: id});
    res.send("Deleted Sucessfully", id); 
});

server.post('/mongo/insertBulk', async function(req, res) {
    try {
        await db.collection('users').insertMany(bulkData);
        res.send("Bulk Data Inserted Successfully");
    } catch (error) {
        console.log(error);
    } 
});

server.get('/mongo/report/:job', async function (req, res) {
    const job = req.params.job;
    try {
        const users = await db.collection('users').find({job: job}).toArray();

        const report = users.map(user => ({
            userId: user.userId,
            username: user.username,
            email: user.email,
            job: user.job,
            loginTime: moment(user.logintime).format('HH:mm:ss'),
            logoutTime: moment(user.logouttime).format('HH:mm:ss')
        }));
        res.send(report);
    } catch (error) {
        console.log(error);
    }
});

// let bulkData = [];
// async function createFakeData() {
//     for(let i=0; i<100000; i++) {
//         const loginTime = faker.date.recent(30).getTime(); 
//         const logoutTime = loginTime + (Math.floor(Math.random() * 60) + 1) * 60000; 

//         bulkData.push({
//             userId: uuidv4(),
//             username: faker.internet.username(),
//             email: faker.internet.email(),
//             job: faker.person.jobType(),
//             logintime: loginTime,
//             logouttime: logoutTime,
//             createdAt: new Date()
//         });
//     }
// }
// createFakeData();
// console.log(bulkData);

// let chunk = 20;
// let chunkArray = [];

// for(let i=0; i<bulkData.length; i+=chunk) {
//     chunkArray = bulkData.slice(i, i+chunk);
//     insertIntoMongo(chunkArray);
// }

server.listen(PORT, function () {
    console.log(`listening on port ${PORT}`);
});

