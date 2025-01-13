const restify = require('restify');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { faker } = require('@faker-js/faker');

dotenv.config();

const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: process.env.ELASTICURI });

const server = restify.createServer();

server.use(bodyParser.json());

const PORT = process.env.PORT;

// client.indices.create({
//     index: 'sahil_logger',
// }, (err, resp, status) => {
//     console.log("create", resp);
// });

server.get('/elasticsearch/get', async function(req, res) {
    //const data = req.body.name;
    const result = await client.search({
        index: 'sahil',
        // to get particular data
        // body: {
        //   query: {
        //     match: { 
        //         "index": 'sahil'
        //     }
        //   }
        // }
      }, (err, resp, status) => {
        console.log(resp);
      });
      console.log(result);
      res.send(result);
});

server.post('/elasticsearch/create', async function(req, res) {
    const result = await client.index({
        index: 'sahil',
        body : req.body,
      }, (err, resp, status) => {
        console.log(resp);
      });
      console.log(result);
      res.send("Inserted Successfully");
});

server.put('/elasticsearch/update/:id', async function(req, res) {
    const id = req.params.id;
    const result = await client.update({
        index: 'sahil',
        id: id,
        doc: req.body
    }, (err, resp, status) => {
        console.log(resp);
    });
    console.log(result);
    res.send("Updated Successfully");
});

server.del('/elasticsearch/delete/:id', async function(req, res) {
    const id = req.params.id;
    const result = await client.delete({
        index: 'sahil',
        id: id
    }, (err, resp, status) => {
        console.log(resp);
    });
    console.log(result);
    res.send("Deleted Successfully");
});

server.post('/elasticsearch/insertBulk', async function(req, res) {
    let bulkData = [];
    for(let i=0; i<500000; i++) {
        bulkData.push({
            index: {
                _index: 'sahil',
            }
        },
        {
            "username" : faker.internet.username(),
            "email" : faker.internet.email(),
            "date" : faker.date.past(),
            "time": Date.now(),
        });
    }
    // console.log(bulkData);
    try {
        const result = await client.bulk({
            index: 'sahil',
            body: bulkData
        });
        console.log(result);
        res.send("Inserted Successfully");
    } catch (error) {
       res.send(error); 
    }
});

server.listen(PORT, function () {
    console.log(`listening on port ${PORT}`);
});

module.exports = client;