const restify = require('restify');
const {MongoClient} = require('mongodb');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { faker } = require('@faker-js/faker');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
uuidv4();
const mongoData = require('./utils');

dotenv.config();

const server = restify.createServer();

server.use(bodyParser.json());

// const PORT = process.env.PORT;
const URI = process.env.MONGOURI;
const MONGODB = process.env.MONGODB;

let db;

const client = new MongoClient(URI);

const mongoConnection = async () => {
    await client.connect();
    db = client.db(MONGODB);
    console.log("Mongo Connected");
    return db;
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
// const data = JSON.stringify(bulkData);
// console.log(data);

server.post('/mongo/insertBulk', async function(req, res) {
    try {
        await db.collection('loggerTable').insertMany(bulkData);
        res.send("Bulk Data Inserted Successfully");
    } catch (error) {
        console.log(error);
    } 
});

server.get('/mongo/get/overallReport', async function(req, res) {
  try {
      const result =  await db.collection('loggerTable').find({}).limit(10).toArray();
      res.send(result);
  } catch (error) {
      console.log(error);
  }
});

server.get('/mongo/get/hourlyReport', async function(req, res) {
    try {
        const result = await db.collection('loggerTable').aggregate([
            {
              "$group": {
                "_id": {
                    "hour": { "$hour": "$datetime" },
                },
                "call_count": { "$sum": 1 },
                "total_duration": { "$sum": "$duration" },
                "total_calltime": { "$sum": "$callTime" },
                "total_hold": { "$sum": "$hold" },
                "total_mute": { "$sum": "$mute" },
                "total_transfer": { "$sum": "$transfer" },
                "total_conference": { "$sum": "$conference" },
                "total_ringing": { "$sum": "$ringing" },
              }
            },
            {
              "$project": {
                "hour": "$_id.hour",
                "call_count": 1,
                "total_ringing": 1,
                "total_calltime": 1,
                "total_hold": 1,
                "total_mute": 1,
                "total_transfer": 1,
                "total_conference": 1,
                "total_duration": 1,
              }
            },
            {
              "$sort": { 
                "hour": 1
              }
            }
          ]).toArray()

          
          // console.log(result);
          let docs = [];
          result.forEach((doc) => {
              docs.push({
                  'hour' : doc.hour,
                  'call_count': doc.call_count,
                  'total_ringing': doc.total_ringing,
                  'total_calltime': doc.total_calltime,
                  'total_hold': doc.total_hold,
                  'total_mute': doc.total_mute,
                  'total_transfer': doc.total_transfer,
                  'total_conference': doc.total_conference,
                  'total_duration': doc.total_duration,
              });
          });
          // console.log(docs);
          res.send(docs);
    } catch (error) {
        console.log(error);
    }
})

server.get('/mongo/report/:job', async function (req, res) {
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

server.listen(5000, function () {
    console.log(`listening on port 5000`);
});

// const response= await collection.aggregate([
//     {
//       "$group": {
//         "_id": {
//             "hour": { "$hour": "$date_time" },
//             "type": "$type",
//             "campaign_name": "$campaign_name",
//             "process_name": "$process_name"
//         },
//         "call_count": { "$sum": 1 },
//         "total_duration": { "$sum": "$duration" },
//         "total_hold": { "$sum": "$hold" },
//         "total_mute": { "$sum": "$mute" },
//         "total_ringing": { "$sum": "$ringing" },
//         "total_transfer": { "$sum": "$transfer" },
//         "total_conference": { "$sum": "$conference" },
//         "unique_calls": { "$addToSet": "$reference_uuid" }
//       }
//     },
//     {
//       "$project": {
//         "hour": "$_id.hour",
//         "type": "$_id.type",
//         "campaign_name": "$_id.campaign_name",
//         "process_name": "$_id.process_name",
//         "call_count": 1,
//         "total_duration": 1,
//         "total_hold": 1,
//         "total_mute": 1,
//         "total_ringing": 1,
//         "total_transfer": 1,
//         "total_conference": 1,
//         "unique_calls": { "$size": "$unique_calls" }
//       }
//     },
//     {
//       "$sort": { 
//         "hour": 1
//       }
//     }
//   ]).toArray()

module.exports = {mongoConnection};

