const restify = require('restify');
const {MongoClient} = require('mongodb');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
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
})

server.listen(PORT, function () {
    console.log(`listening on port ${PORT}`);
});
