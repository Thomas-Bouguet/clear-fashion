/* eslint-disable no-console, no-process-exit */
const MDB_USER = 'mrcrepe';
const MDB_PWD = 'TUDE2sVbAzyq6tm8';

const { MongoClient, ServerApiVersion } = require('mongodb');
const MONGODB_URI = "mongodb+srv://"+MDB_USER+":"+MDB_PWD+"@cluster0.6y0mf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const MONGO_DB_NAME ='DB_MONGO_WEB';
const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const db = client.db(MONGO_DB_NAME);
const coll = db.collection('products');

const all_products = [];

const dedicatedbrand = require('./sources/dedicatedbrand');
const montlimart = require('./sources/montlimart');
const adresse = require('./sources/adresse');


async function sandbox (eshop = ['https://www.dedicatedbrand.com/en/men/all-men','https://www.montlimart.com/toute-la-collection.html?limit=all','https://adresse.paris/630-toute-la-collection?id_category=630&n=116']) {
  try {
    console.log(`🕵️‍♀️  browsing ${eshop[0]} source`);

    let d_products = await dedicatedbrand.scrape(eshop[0]);

    console.log(d_products);
    console.log(d_products.length);
    console.log('done');
    
    d_products.forEach(product => all_products.push(product));

    console.log(`🕵️‍♀️  browsing ${eshop[1]} source`);

    let m_products = await montlimart.scrape(eshop[1]);

    console.log(m_products);
    console.log(m_products.length);
    console.log('done');

    m_products.forEach(product => all_products.push(product));

    console.log(`🕵️‍♀️  browsing ${eshop[2]} source`);

    let a_products = await adresse.scrape(eshop[2]);

    console.log(a_products);
    console.log(a_products.length);
    console.log('done');

    a_products.forEach(product => all_products.push(product));

    return all_products;
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

async function get_prods() {
  
  const all_products = await sandbox();

  try {
    await client.connect();
    const collection = client.db(MONGO_DB_NAME).collection('products');
    const result = await collection.insertMany(all_products);

    console.log(result.insertedIds,'Succeed !');
  } finally {
    await client.close();
  }
}

const [,, eshop] = process.argv;

get_prods().catch(console.dir);