const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ]
    }
});

userSchema.methods.addToCart = function (product) {
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
            productId: product._id,
            quantity: 1
        });
    }
    const updatedCart = {
        items: updatedCartItems
    };
    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.removeFromCart = function (productId) {
    const updatedCartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save();
}

module.exports = mongoose.model('User', userSchema);

// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// class User {
//     constructor(username, email, cart, userId) {
//         this.name = username,
//             this.email = email
//         this.cart = cart;
//         this._id = userId
//     }

//     save() {
//         const db = getDb();
//         return db.collection('users')
//             .insertOne(this);
//     }

//     addToCart(product) {
//       
//     }

//     getCart() {
//         const db = getDb();
//         const productIds = this.cart.items.map(item => {
//             return item.productId;
//         });
//         return db
//             .collection('products')
//             .find({ _id: { $in: productIds } })
//             .toArray()
//             .then(products => {
//                 return products.map(product => {
//                     return {
//                         ...product, quantity: this.cart.items.find(item => {
//                             return item.productId.toString() === product._id.toString();
//                         }).quantity
//                     };
//                 });
//             });
//     }

//     deleteItemFromCart(productId) {
//         const updatedCartItems = this.cart.items.filter(item => {
//             return item.productId.toString() !== productId.toString();
//         });
//         const db = getDb();
//         return db.collection('users')
//             .updateOne({ _id: new mongodb.ObjectId(this._id) },
//                 { $set: { cart: { items: updatedCartItems } } }
//             );
//     }

//     addOrder() {
//         const db = getDb();
//         return this.getCart().then(products => {
//             const order = {
//                 items: products,
//                 user: {
//                     _id: new mongodb.ObjectId(this._id),
//                     name: this.name,
//                     email: this.email
//                 }
//             };
//             return db.collection('orders').insertOne(order)
//         })
//             .then(result => {
//                 this.cart = [];
//                 return db
//                     .collection('users')
//                     .updateOne({ _id: new mongodb.ObjectId(this._id) },
//                         { $set: { cart: { items: [] } } }
//                     );
//             });
//     }

//     getOrders() {
//         const db = getDb();
//         return db
//             .collection('orders')
//             .find({ 'user._id': new mongodb.ObjectId(this._id) })
//             .toArray();
//     }

//     static findById(userId) {
//         const db = getDb();
//         return db.collection('users')
//             .findOne({ _id: new mongodb.ObjectId(userId) });
//     }
// }

// module.exports = User;