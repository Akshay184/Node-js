const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (cb) => {
    MongoClient.connect('mongodb+srv://Akshay:Akshay@cluster0.pmyad.mongodb.net/shop?retryWrites=true&w=majority')
        .then(client => {
            console.log('Connected');
            _db = client.db('shop');
            cb();
        })
        .catch(err => {
            console.log(err);
        });
}

const getDb = () => {
    if(_db) {
        return _db;
    }
    throw 'Conection failed';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;