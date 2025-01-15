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
        index: 'sahil_logger',
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
      // console.log(result);
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

server.get("/elasticsearch/get/hourlyReport", async (req, res) => {
    try {
        const result = await client.search({
        index: 'sahil_logger', 
        body: {
            "size": 0,
                "aggs": {
                "group_by_hour": {
                    "date_histogram": {
                    "field": "datetime",
                    "calendar_interval": "hour"
                    },
                    "aggs": {
                    "total_duration": {
                    "sum": {
                        "field": "duration"
                    }
                    },
                    "total_calltime": {
                    "sum": {
                        "field": "callTime"
                    }
                    },
                    "total_hold": {
                    "sum": {
                        "field": "hold"
                    }
                    },
                    "total_mute": {
                    "sum": {
                        "field": "mute"
                    }
                    },
                    "total_ringing": {
                    "sum": {
                        "field": "ringing"
                    }
                    },
                    "total_transfer": {
                    "sum": {
                        "field": "transfer"
                    }
                    },
                    "total_conference": {
                    "sum": {
                        "field": "conference"
                    }
                    },
                    "unique_calls": {
                    "value_count": {
                        "field": "referenceUUID.keyword"
                    }
                    }
                    }
                }
                }
                }
        });
        // console.log(result.hits)
        res.send(result);
    } catch (error) {
        console.log(error);
    }
  });

server.listen(8000, function () {
    console.log(`listening on port 8000`);
});

module.exports = client;