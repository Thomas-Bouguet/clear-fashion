const fetch = require('node-fetch');
const cheerio = require('cheerio');


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
  
        return {brand, name, price};
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