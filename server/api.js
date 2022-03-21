const cors = require('cors');
const { response } = require('express');
const express = require('express');
const helmet = require('helmet');
const axios = require('axios');

const PORT = 8092;

const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.get('/products/search', async function (req, res) {

  let params = req.query;
  let limit = null;

  console.log(req.query);

  if (params.hasOwnProperty("limit")) {
    limit = params.limit;
    delete params.limit;
  }

  var data = {
      "collection": "products",
      "database": "DB_MONGO_WEB",
      "dataSource": "Cluster0",
      "filter": params
  };

  if (limit!=null) {
    data.limit = parseInt(limit);
  }

  data = JSON.stringify(data);

  console.log(data);

  var config = {
      method: 'post',
      url: 'https://data.mongodb-api.com/app/data-acmwk/endpoint/data/beta/action/find',
      headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Headers': '*',
          'api-key': 'Ofwp99K8tjmjhBUHdT8Af20ILr43K6DUclCPXcMTqGxm7un3ac7ZR4s7MIghRBuQ'
      },
      data : data
  };
  
  let gotten;

  await axios(config)
      .then(function (response) {
          gotten = JSON.stringify(response.data);
      })
      .catch(function (error) {
          console.log(error);
          gotten = error;
      });

  res.send(gotten);
});

app.get('/exit', function (req,res) {
  app.listen(PORT).close();
});

app.listen(PORT);

console.log(`📡 Running on port ${PORT}`);
