const connection = require('./mySql');
const {mongoConnection} = require('./mongo');
const client = require('./elasticSearch');
const {mongoData, mysqlData, elasticData} = require('./utils');

async function insertIntoAllDB() {
        // Insert data into MongoDB
        const db = await mongoConnection();
        const insertMongo = await db.collection('loggerTable').insertMany(mongoData);
        if(insertMongo) {
            console.log('Inserted in Mongo Successfully');
        } else {
            console.log('Error inserting into Mongo');
        }

         // Insert data into MySQL
        const insertMysql = await connection.query("INSERT INTO logger_table (agentName, campaignName, processName, leadsetID, referenceUUID, customerUUID,callType, ringing,callTime, hold, mute, transfer, conference, duration,disposeTime, disposeType, disposeName,  datetime) VALUES ?",[mysqlData]);
        if(insertMysql) {
            console.log('Inserted in MySQL Successfully');
        } else {
            console.log('Error inserting into MySQL');
        }
        
        // Insert data into ElasticSearch
        const insertElastic = await client.bulk({
            index: 'sahil_logger',
            body : elasticData,
          });
        if(insertElastic) {
            console.log('Inserted in ElasticSearch Successfully');
        } else {
            console.log('Error inserting into ElasticSearch');
        }
}  
insertIntoAllDB();
