const restify = require('restify');
const Redis = require("ioredis");
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();

const server = restify.createServer();

server.use(bodyParser.json());

const PORT = process.env.PORT;
const HOST = process.env.HOST;

const redis = new Redis({
    host: HOST,
    port: 6379
});

server.get('/redis/get', async function(req, res) {
    const result = await redis.hgetall(req.body.name);
    console.log(result);
    res.send(result);
});

server.post('/redis/create', async function(req, res) {
    const result = await redis.hset(req.body.name, req.body);
    console.log(result);
    res.send(result);
});

// encodeURI & decodeURI
server.del('/redis/delete/:name', async function(req, res) {
    const result = await redis.del(req.params.name);
    // const result = await redis.del(req.body.name);
    console.log(result);
    res.send("Deleted Sucessfully");
});

server.listen(PORT, function () {
    console.log(`listening on port ${PORT}`);
});


