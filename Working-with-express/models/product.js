const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Product {
  constructor(title, price, imageUrl, description, id, userId) {
    this.title = title,
      this.price = price,
      this.imageUrl = imageUrl,
      this.description = description,
      this._id = id ? new mongodb.ObjectId(id) : null; 
      this.userId = userId;
  }

  save() {
    const db = getDb();
    console.log(this._id);
    let dbOp;
    if (this._id) {
      dbOp = db.
        collection('products')
        .updateOne({ _id: new mongodb.ObjectId(this._id) }, {
          $set: this
        });
    }
    else {
      dbOp = db.collection('products')
        .insertOne(this);
    }
    return dbOp
      .then(result => {
      })
      .catch(err => {
        console.log('yoooooooooooooooo', err);
      })
  }

  static fetchAll() {
    const db = getDb();
    return db.collection('products')
      .find()
      .toArray()
      .then(products => {
        return products;
      })
      .catch(err => {
        console.log(err);
      })
  }

  static findById(prodId) {
    const db = getDb();
    return db.collection('products')
      .find({ _id: new mongodb.ObjectID(prodId) })
      .next()
      .then(product => {
        return product;
      })
      .catch(err => {
        console.log(err);
      });
  }

  static deleteById(prodId) {
    const db = getDb();
    return db.collection('products')
    .deleteOne({_id: new mongodb.ObjectId(prodId)})
    .then(result => {
      console.log('DELETED');
    })
    .catch(err => {
      console.log(err);
    })
  }
}

module.exports = Product;