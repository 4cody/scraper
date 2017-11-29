
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");

const axios = require("axios");
const cheerio = require("cheerio");

const db = require("./models");

const PORT = 4040;

const app = express();

app.use(logger('dev'));

app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static("public"));

mongoose.Promise = Promise;

mongoose.connect("mongodb://localhost/news", {
  useMongoClient: true
});

app.get("/scrape", function(req, res) {
  axios.get("http://www.echojs.com/").then(function(response) {
    const $ = cheerio.load(response.data);

    $("articles.h2").each(function(i, element) {
    	const result = {};

    	result.title = $(this)
    		.children("a")
    		.text();
    	result.link = $(this)
    		.children("a")
    		.attr("href");

    	db.Article
    		.create(result)
    		.then(function(dbArticle) {
    			res.send("Scrape Complete")
    		})
    		.catch(function(err) {
    			res.json(err);
    		});
    });
  });
});

app.get("/articles", function(req, res) {
	db.Article
	.find({})
	.then(function(dbArticle) {
		res.json(dbArticle);
	})
	.catch(function(err) {
		res.json(err);
	});
});

app.post("/article/:id", function(req, res) {
	db.Note
	.create(req.body)
	.then(function(dbNote) {
		return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true});
	})
})

app.listen(PORT, function() {
	console.log("App running on port: " + PORT);
})
