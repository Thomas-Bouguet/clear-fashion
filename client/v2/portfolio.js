// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

// current products on the page
let currentProducts = [];
let currentPagination = {};
let currentBrands = [];

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');
const selectBrand = document.querySelector('select[name="brand"]');

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Set global value of currentBrands
 * @param {Array} brands - all the brands to display
 */
const setCurrentBrands = (brands) => {
  currentBrands = brands;
}

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12, brnd = 'All') => {
  if (page>Math.ceil(currentPagination.count/size)) {
    page=1;
  }
  try {
    let toFetch = new String;
    if (brnd === 'All') {
      toFetch = `https://clear-fashion-api.vercel.app?page=${page}&size=${size}`;
    } else {
      toFetch = `https://clear-fashion-api.vercel.app?page=${page}&size=${size}&brand=${brnd}`;
    }
    const response = await fetch(
      toFetch
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

/**
 * Fetch all the products from api
 * @param {Number} [page=1] - current page to fetch, only one here
 * @param {Number} [size=139] - size of the page, number of products to have all the products
 * @returns 
 */
const fetchAllProducts = async (page = 1, size = 139) => {
  try {
    const response = await fetch(
      `https://clear-fashion-api.vercel.app?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products
    .map(product => {
      return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}">${product.name}</a>
        <span>${product.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbProducts.innerHTML = count;
};

/**
 * Render brands selector
 */
const renderBrands = () => {
  let select = [];
  for(const brnd of currentBrands) {
    select.push(`<option value="${brnd}">${brnd}</option>`);
  }

  selectBrand.innerHTML = select.join('');
}

/**
 * Render all renders
 * @param {Object} products 
 * @param {Object} pagination 
 */
const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination);
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 */
selectShow.addEventListener('change', async (event) => {
  fetchProducts(currentPagination.currentPage, parseInt(event.target.value), selectBrand.value)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
});

selectPage.addEventListener('change', async (event) => {
  fetchProducts(parseInt(event.target.value), selectShow.value, selectBrand.value)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
});

selectBrand.addEventListener('change', async (event) => {
  fetchProducts(selectPage.value, selectShow.value, event.target.value)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
});

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();
  
  setCurrentProducts(products);
  render(currentProducts, currentPagination);

  const allProducts = await fetchAllProducts(1,currentPagination.count);

  let brands= new Set();
  brands.add('All');
  allProducts.result.forEach(element => brands.add(element.brand));

  setCurrentBrands(Array.from(brands));
  renderBrands();
});
