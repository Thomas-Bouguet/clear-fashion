/* eslint-disable no-console, no-process-exit */
const dedicatedbrand = require('./sources/dedicatedbrand');
const montlimart = require('./sources/montlimart');
const adresse = require('./sources/adresse');

async function sandbox (eshop = ['https://www.dedicatedbrand.com/en/men/all-men','https://www.montlimart.com/toute-la-collection.html?limit=all','https://adresse.paris/630-toute-la-collection?id_category=630&n=116']) {
  try {
    console.log(`🕵️‍♀️  browsing ${eshop[0]} source`);

    let products = await dedicatedbrand.scrape(eshop[0]);

    console.log(products);
    console.log('done');

    console.log(`🕵️‍♀️  browsing ${eshop[1]} source`);

    products = await montlimart.scrape(eshop[1]);

    console.log(products);
    console.log('done');

    console.log(`🕵️‍♀️  browsing ${eshop[2]} source`);

    products = await adresse.scrape(eshop[2]);

    console.log(products);
    console.log('done');

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;

sandbox();