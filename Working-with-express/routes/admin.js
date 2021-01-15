const path = require("path");

const express = require("express");

const rootDir = require("../util/path");

const router = express.Router();

const products = [];

router.get("/add-product", (req, res, next) => {
  // console.log("In the middleware");
  // res.send('<form action = "/admin/add-product" method = "POST"><input type = "text"
  // name ="title"><button type = "submit">Add Product</button></input></form>');
  res.sendFile(path.join(rootDir, "views", "add-product.html"));
});

router.post("/add-product", (req, res, next) => {
  products.push({ title: req.body.title });
  res.redirect("/");
});

module.exports = {
  routes: router,
  products: products,
};