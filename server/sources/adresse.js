const fetch = require('node-fetch');
const cheerio = require('cheerio');

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

/**
 * Parse webpage e-shop
 * @param  {String} data - html response
 * @return {Array} products
 */
const parse = data => {
  const $ = cheerio.load(data);
  const brand = "addresseParis"

  return $('.product_list .right-block')
    .map((i, element) => {
      const name = $(element)
        .find('.product-name-container.versionpc .product-name')
        .text()
        .trim()
        .replace(/\s/g, ' ');
      const link = $(element)
      .find('h5.product-name-container.versionpc .product-name')
      .attr('href');
      const price = parseInt(
        $(element)
          .find('.price.product-price')       
          .text()
      );
      let released = new Date(getRandomInt(1616660138,1648196138) * 1000);
      released = released.toLocaleDateString();
      released = released.split("/").reverse().join("-");

      return {brand, name, price, link, released};
    })
    .get();
};

/**
 * Scrape all the products for a given url page
 * @param  {[type]}  url
 * @return {Array|null}
 */
module.exports.scrape = async url => {
  try {
    const response = await fetch(url);

    if (response.ok) {
      const body = await response.text();

      return parse(body);
    }

    console.error(response);

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};