const Product = require('../models/product');
const Cart = require('../models/cart');
const { codePointAt } = require('../util/password');

exports.getProducts = (req, res, next) => {
  Product.fetchAll().then(([products, config]) => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  }).catch((err) => {
    console.log(err);
  });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll().then(([products, config]) => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  }).catch((err) => {
    console.log(err);
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  console.log(prodId);
  Product.getById(prodId).then(([product, config]) => {
    console.log(product);
    res.render('./shop/product-detail', {
      pageTitle: product.title,
      product: product[0],
      path: '/products'
    });
  }).catch((err) => {
    console.log('err ha', err);
  });
};

exports.getCart = (req, res, next) => {
  Cart.getCart(cart => {
    Product.fetchAll(products => {
      const cartProducts = [];
      for (product of products) {
        const item = cart.products.find(prod => prod.id === product.id);
        if (item) {
          cartProducts.push({ productData: product, qty: item.qty });
        }
        res.render('shop/cart', {
          path: '/cart',
          pageTitle: 'Your Cart',
          products: cartProducts
        });
      }
    });
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.getById(prodId, (product) => {
    Cart.addProduct(prodId, product.price);
  })
  res.redirect('/cart');
}

exports.postDeleteCardProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.getById(prodId, (product) => {
    Cart.deleteProduct(prodId, product.price);
    res.redirect('/cart');
  })
}

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
