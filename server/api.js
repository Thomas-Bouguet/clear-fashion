const cors = require('cors');
const { response } = require('express');
const express = require('express');
const helmet = require('helmet');
const axios = require('axios');
const pagination = require('pagination');
const { not } = require('cheerio/lib/api/traversing');

const PORT = 8092;

const app = express();

module.exports = app;

let counted = -1, currentPage = -1, pageCount = -1, pageSize = -1;
let success = true;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.get('/products/search', async function (req, res) {

  if (counted===-1) {
    await axios({
      method: 'post',
      url: 'https://data.mongodb-api.com/app/data-acmwk/endpoint/data/beta/action/find',
      headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Headers': '*',
          'api-key': 'Ofwp99K8tjmjhBUHdT8Af20ILr43K6DUclCPXcMTqGxm7un3ac7ZR4s7MIghRBuQ'
      },
      data:{
        "collection": "products",
        "database": "DB_MONGO_WEB",
        "dataSource": "Cluster0"
      }
    })
      .then(function (response) {
        counted = JSON.stringify(response.data).match(/_id/g).length;
      })
      .catch(function (error) {
        //console.log(error);
        counted = error;
      });
  }

  let params = req.query;
  let size = 12;
  let page = 1;

  if (params.hasOwnProperty("size")) {
    size = parseInt(params.size);
    delete params.size;
  }
  if (params.hasOwnProperty("page")) {
    page = parseInt(params.page);
    delete params.page;
  }

  currentPage = page;
  pageCount = Math.ceil(counted/size);
  pageSize = size;

  var data = {
      "collection": "products",
      "database": "DB_MONGO_WEB",
      "dataSource": "Cluster0",
      "filter": params
  };

  data.skip = size*(page-1);
  data.limit = size;

  data = JSON.stringify(data);

  var config = {
      method: 'post',
      url: 'https://data.mongodb-api.com/app/data-acmwk/endpoint/data/beta/action/find',
      headers: {
          'Content-Type': 'application/json',
          'Access-Control-Request-Headers': '*',
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "X-Requested-With",
          'Access-Control-Expose-Headers': "X-Pagination-Current-Page, X-Pagination-Total-Count",
          'api-key': 'Ofwp99K8tjmjhBUHdT8Af20ILr43K6DUclCPXcMTqGxm7un3ac7ZR4s7MIghRBuQ'
      },
      data : data
  };
  
  let gotten;
  let gotten_meta;

  await axios(config)
      .then(function (response) {
          gotten = response.data.documents;
          gotten_meta = {"count":counted, "currentPage":currentPage, "pageCount":pageCount, "pageSize":pageSize};
      })
      .catch(function (error) {
        success = false;
        console.log(error);
        gotten = error;
      });
  
  //res.send(gotten);
  res.send({"data":{"result":gotten,"meta":gotten_meta}, "success":success});
});

app.listen(PORT);

console.log(`📡 Running on port ${PORT}`);
