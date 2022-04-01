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
    const brand = "montlimart";

    return $('.category-products .item')
      .map((i, element) => {
        const name = $(element)
          .find('.product-name')
          .text()
          .trim()
          .replace(/\s/g, ' ');
        const price = parseInt(
          $(element)
            .find('.price')
            .text()
        );
        const link = $(element)
            .find('product-name')
            .find('a')
            .attr('href');
        let released = new Date(getRandomInt(1616660138,1648196138) * 1000);
        released = released.toLocaleDateString();
        released = released.split("/").reverse().join("-");
  
        return {brand, name, price, released};
      })
      .get();
  };

/**
 * 
 * @param {[type]} url 
 * @returns {Array|null}
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