const path = require('path');

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRouter = require("./routes/admin");
const shopRouter = require("./routes/shop");
const errorRouter = require('./controllers/error');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRouter);
app.use(shopRouter);

app.use(errorRouter.get404);

app.listen(3000);
