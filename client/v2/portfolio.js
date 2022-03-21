// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

// current products on the page
let currentProducts = [];
let currentPagination = {};
let currentBrands = [];
let currentRecent = 'All';
let currentReasonablePrice = 'All';
let newProductsNb = 0;
let p50 = 0, p90 = 0, p95 = 0;
let favorites = [];

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectBrand = document.querySelector('select[name="brand"]');
const selectSort = document.querySelector('#sort-select');

const sectionProducts = document.querySelector('#products');

const spanNbProducts = document.querySelector('#nbProducts');
const spanNbNewProducts = document.querySelector('#nbNewProducts');
const spanP50 = document.querySelector('#p50');
const spanP90 = document.querySelector('#p90');
const spanP95 = document.querySelector('#p95');

const inputRecent = document.querySelector('#recent');
const inputReasonablePrice = document.querySelector('#reasonable-price-input');

let currentButtons = [];

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
const fetchProducts = async (page = 1, size = 12, brnd = 'All', date = 'All', price='All', toSort='none') => {
  if (date==='recent') {
    return fetchRecentProducts(page, size, brnd, price, toSort);
  } else if (price==='reasonable') {
    return fetchReasonableProducts(page, size, brnd, date, toSort);
  }
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

    if (toSort !== 'none') {
      body.data.result = sortProduct(body.data.result, toSort);
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

const reasonableProducts = (products) => {
  return products.filter((product) => product.price < 50);
}

const recentProducts = (products) => {
  const now=Date.now();
  return products.filter((product) => now-Date.parse(product.released) < 14*24*60*60);
}

const fetchRecentProducts = async (page = 1, size = 12, brnd = 'All', price='All', toSort='none') => {
  let fetched;
  if (price === 'reasonable') {
    fetched = await fetchReasonableProducts(1, currentPagination.count, brnd, 'All', toSort);
  } else {
    fetched = await fetchProducts(1, currentPagination.count, brnd, 'All', price, toSort);
  }
  fetched.result = recentProducts(fetched.result);

  const totalOfRecent = fetched.result.length;
  fetched.meta.pageCount = Math.ceil(totalOfRecent/size);
  fetched.meta.pageSize = size;
  if (fetched.meta.pageCount<page) { page=1; }
  fetched.meta.currentPage = page;

  fetched.result = fetched.result.slice((page-1)*size,page*size);
  return fetched;
}

const fetchReasonableProducts = async (page = 1, size = 12, brnd = 'All', date='All', toSort='none') => {
  let fetched;
  if (date === 'recent') {
    fetched = await fetchRecentProducts(1, currentPagination.count, brnd, 'All', toSort);
  } else {
    fetched = await fetchProducts(1, currentPagination.count, brnd, date, 'All', toSort);
  }
  fetched.result = reasonableProducts(fetched.result);
  
  const totalOfReasonable = fetched.result.length;
  fetched.meta.pageCount = Math.ceil(totalOfReasonable/size);
  fetched.meta.pageSize = size;
  if (fetched.meta.pageCount<page) { page=1; }
  fetched.meta.currentPage = page;

  fetched.result = fetched.result.slice((page-1)*size,page*size);
  return fetched;
}

const sortProduct = (products, toSort) => {
  if (toSort === 'price-asc') { return products.sort((a,b) => a.price - b.price); }
  else if (toSort === 'price-desc') { return products.sort((a,b) => b.price - a.price); }
  else if (toSort === 'date-asc') { return products.sort((a,b) => Date.parse(b.released)-Date.parse(a.released)); }
  else if (toSort === 'date-desc') { return products.sort((a,b) => Date.parse(a.released)-Date.parse(b.released)); }
  else { return products; }
}

/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  div.setAttribute("class","products")
  products
    .map(product => {
      const productDiv = document.createElement('div');
      productDiv.setAttribute("class","product");

      const childDiv = document.createElement('div');
      childDiv.setAttribute("class","sub_product");
      childDiv.setAttribute("id",product.uuid);

      const span1 = document.createElement('span');
      span1.setAttribute("class","product_span1")
      span1.innerHTML = product.brand;

      const a = document.createElement('a');
      a.setAttribute("href",product.link);
      a.setAttribute("target","_blank");
      a.setAttribute("class","product_a")
      a.innerHTML = product.name;

      const span2 = document.createElement('span');
      span2.setAttribute("class","product_span2")
      span2.innerHTML = product.price.toString() + '€';

      const button = document.createElement('button');
      button.id = product.uuid+"_button";
      button.setAttribute("value",product.uuid);
      button.setAttribute("type","button");
      button.innerHTML = "Add to favorites";
      button.addEventListener('click', async (event) => {
        if (favorites.find( fav =>  fav.uuid===button.value )) { 
          favorites.splice(favorites.indexOf(product),1);
          button.innerHTML = "Add to favorites";
        } else {
          favorites.push(product);
          button.innerHTML = "Remove from favorites";
        };
        }
      );

      childDiv.appendChild(span1);
      childDiv.appendChild(a);
      childDiv.appendChild(span2);
      productDiv.appendChild(childDiv);
      productDiv.appendChild(button);
      div.appendChild(productDiv);
    ;
    });

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
  spanNbNewProducts.innerHTML = newProductsNb;
  spanP50.innerHTML = p50;
  spanP90.innerHTML = p90;
  spanP95.innerHTML = p95;
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
  fetchProducts(currentPagination.currentPage, parseInt(event.target.value), selectBrand.value, currentRecent, currentReasonablePrice, selectSort.value)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
});

selectPage.addEventListener('change', async (event) => {
  fetchProducts(parseInt(event.target.value), selectShow.value, selectBrand.value, currentRecent, currentReasonablePrice, selectSort.value)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
});

selectBrand.addEventListener('change', async (event) => {
  fetchProducts(selectPage.value, selectShow.value, event.target.value, currentRecent, currentReasonablePrice, selectSort.value)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
});

inputRecent.addEventListener('change', async (event) => {
  if (event.target.checked) {
    currentRecent = event.target.value;
    fetchProducts(selectPage.value, selectShow.value, selectBrand.value, currentRecent, currentReasonablePrice, selectSort.value)
      .then(setCurrentProducts)
      .then(() => render(currentProducts, currentPagination));
  } else {
    currentRecent = 'All';
    fetchProducts(selectPage.value, selectShow.value, selectBrand.value, currentRecent, currentReasonablePrice, selectSort.value)
      .then(setCurrentProducts)
      .then(() => render(currentProducts, currentPagination));
  }
});

inputReasonablePrice.addEventListener('change', async (event) => {
  if (event.target.checked) {
    currentReasonablePrice = event.target.value;
    fetchProducts(selectPage.value, selectShow.value, selectBrand.value, currentRecent, event.target.value, selectSort.value)
      .then(setCurrentProducts)
      .then(() => render(currentProducts, currentPagination));
  } else {
    currentReasonablePrice = 'All';
    fetchProducts(selectPage.value, selectShow.value, selectBrand.value, currentRecent, currentReasonablePrice, selectSort.value)
      .then(setCurrentProducts)
      .then(() => render(currentProducts, currentPagination));
  }
});

selectSort.addEventListener('change', async (event) => {
  fetchProducts(selectPage.value, selectShow.value, selectBrand.value, currentRecent, currentReasonablePrice, event.target.value)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
})

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();

  setCurrentProducts(products);

  const allProducts = await fetchProducts(1,currentPagination.count);
  const newProducts = await fetchRecentProducts(1,currentPagination.count);
  const productsSortedPrice = await fetchProducts(1,currentPagination.count,'All','All','All','price-asc');

  newProductsNb = newProducts.result.length;
  p50 = productsSortedPrice.result[parseInt(Math.round(0.5*(productsSortedPrice.result.length+1)))].price;
  p90 = productsSortedPrice.result[parseInt(Math.round(0.9*(productsSortedPrice.result.length+1)))].price;
  p95 = productsSortedPrice.result[parseInt(Math.round(0.95*(productsSortedPrice.result.length+1)))].price;

  render(currentProducts, currentPagination);

  let brands= new Set();
  brands.add('All');
  allProducts.result.forEach(element => brands.add(element.brand));

  setCurrentBrands(Array.from(brands));
  renderBrands();
});
