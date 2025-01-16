const restify = require('restify');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { faker } = require('@faker-js/faker');
const moment = require('moment');

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

server.get('/elasticsearch/get/overallReport', async (req, res) => {
    try {
        const result = await client.search({
            index: 'sahil_logger',
            body: {
                "from" : 0, "size" : 10,
                query: {
                    match_all: {}
                },
            }
        });
        res.send(result.hits.hits.map(data => data._source));
    } catch (error) {
        console.log(error);
    }
})

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

        let data = result['aggregations']['group_by_hour']['buckets'];
        // console.log(data);
        let docs = [];
        data.forEach((doc) => {
            docs.push({
                'hour' : moment(doc.key).format('H'),
                'call_count': doc.doc_count,
                'total_ringing': doc.total_ringing.value,
                'total_calltime': doc.total_calltime.value,
                'total_hold': doc.total_hold.value,
                'total_mute': doc.total_mute.value,
                'total_transfer': doc.total_transfer.value,
                'total_conference': doc.total_conference.value,
                'total_duration': doc.total_duration.value,
            });
        });
        // console.log(docs);
        res.send(docs);
    } catch (error) {
        console.log(error);
    }
  });

server.listen(8000, function () {
    console.log(`listening on port 8000`);
});

module.exports = client;