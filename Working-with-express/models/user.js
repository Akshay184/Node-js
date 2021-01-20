const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class User {
    constructor(username, email, cart, userId) {
        this.name = username,
            this.email = email
        this.cart = cart;
        this._id = userId
    }

    save() {
        const db = getDb();
        return db.collection('users')
            .insertOne(this);
    }

    addToCart(product) {
        const cartPorductIndex = this.cart.items.findIndex(item => {
            return item.productId.toString() === product._id.toString();
        });
        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items];
        if (cartPorductIndex >= 0) {
            newQuantity = this.cart.items[cartPorductIndex].quantity + 1;
            updatedCartItems[cartPorductIndex].quantity = newQuantity;
        }
        else {
            updatedCartItems.push({
                productId: new mongodb.ObjectId(product._id),
                quantity: 1
            });
        }
        const updatedCart = {
            items: updatedCartItems
        };
        const db = getDb();
        return db.collection('users')
            .updateOne({ _id: new mongodb.ObjectId(this._id) },
                { $set: { cart: updatedCart } }
            );
    }

    getCart() {
        const db = getDb();
        const productIds = this.cart.items.map(item => {
            return item.productId;
        });
        return db
            .collection('products')
            .find({ _id: { $in: productIds } })
            .toArray()
            .then(products => {
                return products.map(product => {
                    return {
                        ...product, quantity: this.cart.items.find(item => {
                            return item.productId.toString() === product._id.toString();
                        }).quantity
                    };
                });
            });
    }

    deleteItemFromCart(productId) {
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId.toString() !== productId.toString();
        });
        const db = getDb();
        return db.collection('users')
            .updateOne({ _id: new mongodb.ObjectId(this._id) },
                { $set: { cart: { items: updatedCartItems } } }
            );
    }

    addOrder() {
        const db = getDb();
        return db.collection('orders').insertOne(this.cart)
            .then(result => {
                this.cart = [];
                return db.collection('users')
                    .updateOne({ _id: new mongodb.ObjectId(this._id) },
                        { $set: { cart: { items: [] } } }
                    );
            });
    }

    static findById(userId) {
        const db = getDb();
        return db.collection('users')
            .findOne({ _id: new mongodb.ObjectId(userId) });
    }
}

module.exports = User;