const Product = require('../models/product');

exports.getAddProduce = (req, res, next) => {
    res.render('add-product', {
        path: '/admin/add-product',
        pageTitle: 'Add Product'
    });
}

exports.postAddProduct = (req, res, next) => {
    const product = new Product(req.body.title);
    product.save(() => {
        res.redirect("/");
    });
}

exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('shop', {
            prods: products,
            pageTitle: 'Shop',
            path: '/'
        });
    });
}