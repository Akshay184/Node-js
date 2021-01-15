const path = require('path');
const fs = require('fs');

module.exports = class Cart {
    static addProduct(id, price) {
        const p = path.join(
            path.dirname(process.mainModule.filename),
            'data',
            'cart.json'
        );
        fs.readFile(p, (err, fileContent) => {
            let cart = {products: [], totalPrice: 0};
            if(!err) {
                cart = JSON.parse(fileContent);

            }
            const existingProductId = cart.products.findIndex(prod => prod.id === id);
            const existingProduct = cart.products[existingProductId];
            let updatedProduct;
            if(existingProduct) {
                updatedProduct = {...existingProduct};
                existingProduct.qty += 1;
                cart.products[existingProductId].qty += 1;
            }
            else {
                updatedProduct = {id: id, qty: 1};
                cart.products = [...cart.products, updatedProduct];
            }
            cart.totalPrice += +price;
            fs.writeFile(p, JSON.stringify(cart), (err) => {
                console.log(err);
            });
        });
    }
}